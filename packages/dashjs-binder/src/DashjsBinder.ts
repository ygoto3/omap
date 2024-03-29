import {
    Ad,
    AdPod,
    AdPodInsertionRequest,
    OmapClientEvent,
    OmapBinderState,
    OmapBinderEvent,
} from '@ygoto3/omap-core';
import type {
    IOmapClient,
    IOmapBinder,
    TOmapBinderState,
    TOmapBinderEvent,
    AdBreak,
    AdMediaFile,
    BinderConfig,
    Bitrate,
} from '@ygoto3/omap-core';
import { Debug } from '../../utils/src';
import type dashjs from 'dashjs';
import Prefetchable from './Prefetchable';

/**
 * Dash.js binder for OMAP clients.
 * ```ts
 * const player = dashjs.MediaPlayer().create();
 * const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
 * const adVideoElement = document.getElementById('ad-video') as HTMLVideoElement;
 * const adTagUrl = 'https://example.com/vmap.xml';
 * const omapClient = new OmapIABClient(adTagUrl);
 * const omapBinder = new OmapDashjsBinder(player, adDisplayContainer);
 * omapBinder.bind(omapClient);
 * omapBinder.play()
 *     .then(() => {
 *         player.initialize(videoElement, 'https://example.com/manifest.mpd', true);
 *     })
 *     .catch(() => {
 *         console.error('adBinder failed to get ready');
 *     });
 * ```
 */
export default class OmapDashjsBinder implements IOmapBinder {

    /**
     * @param player the dash.js player instance
     * @param adDisplayContainer the HTMLElement to contain ad video and UI
     * @param adVideoElement the HTMLVideoElement to playback ad video
     */
    constructor(player: dashjs.MediaPlayerClass, adDisplayContainer: HTMLElement, adVideoElement?: HTMLVideoElement) {
        this.dashjs = player;
        this.adDisplayContainer = adDisplayContainer;
        if (adVideoElement) {
            this.adVideoElement = adVideoElement;
            this._keepsAdVideoElement = true;
        }
        this.onTimeUpdate = this.onTimeUpdate.bind(this);
        this.onContentPauseRequested = this.onContentPauseRequested.bind(this);
        this.onContentResumeRequested = this.onContentResumeRequested.bind(this);
        this.onAdEnded = this.onAdEnded.bind(this);
        this.onAdStarted = this.onAdStarted.bind(this);
        this.onAdPodEnded = this.onAdPodEnded.bind(this);
        this.onAdProgress = this.onAdProgress.bind(this);
        this.onAdSkippable = this.onAdSkippable.bind(this);
        
        this._onContentCanPlay = this._onContentCanPlay.bind(this);
        this._onAllAdsCompleted = this._onAllAdsCompleted.bind(this);
        this._onOmapClientLoaded = this._onOmapClientLoaded.bind(this);
        this._onOmapClientLoadError = this._onOmapClientLoadError.bind(this);
        this._onOmapClientStarted = this._onOmapClientStarted.bind(this);
        this._onOmapClientComplete = this._onOmapClientComplete.bind(this);
        this._onAdInsertionRequested = this._onAdInsertionRequested.bind(this);
        this._onAdPreparationRequested = this._onAdPreparationRequested.bind(this);
        this._onPlaybackStarted = this._onPlaybackStarted.bind(this);

        this._adManifestReady = new Promise((resolve, reject) => {
            this._adManifestReadyResolve = resolve;
            this._adManifestReadyReject = reject;
        });

        this._playReady = new Promise((resolve, _) => {
            this._playReadyResolve = resolve;
        });
    }

    get state(): TOmapBinderState {
        return this._state;
    }

    destroy(): void {
        Debug.log('destroy');
        this._unbind();
        this._destroyAdVideoElement();
    }

    bind(omapClient: IOmapClient): void {
        this.omapClient = omapClient;

        this.omapClient.on(OmapClientEvent.CONTENT_CAN_PLAY, this._onContentCanPlay);
        this.omapClient.on(OmapClientEvent.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested);
        this.omapClient.on(OmapClientEvent.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested);
        this.omapClient.on(OmapClientEvent.ALL_ADS_COMPLETED, this._onAllAdsCompleted);
        this.omapClient.on(OmapClientEvent.LOADED, this._onOmapClientLoaded);
        this.omapClient.on(OmapClientEvent.LOAD_ERROR, this._onOmapClientLoadError);
        this.omapClient.on(OmapClientEvent.STARTED, this._onOmapClientStarted);
        this.omapClient.on(OmapClientEvent.COMPLETE, this._onOmapClientComplete);
        this.omapClient.on(OmapClientEvent.AD_POD_INSERTION_REQUESTED, this._onAdInsertionRequested);
        this.omapClient.on(OmapClientEvent.AD_POD_PREPARATION_REQUESTED, this._onAdPreparationRequested);

        // dashjs.MediaPlayer.events.PLAYBACK_STARTED = 'playbackStarted'
        this.dashjs.on('playbackStarted', this._onPlaybackStarted);

        // dashjs.MediaPlayer.events.PLAYBACK_TIME_UPDATED = 'playbackTimeUpdated'
        this.dashjs.on('playbackTimeUpdated', this.onTimeUpdate);

        this._state = OmapBinderState.BOUND;
    }

    async play(startTime: number = 0): Promise<void> {
        if (typeof this.omapClient === 'undefined') {
            throw new Error('No Omap client is bound');
        }
        
        this.omapClient.play();
        await this._adManifestReady;
        this._state = OmapBinderState.CONTENT_PLAYING;
        this.omapClient?.notifyCurrentTime(startTime);
        return this._playReady;
    }

    skip(): void {
        Debug.log('skipAd');
        this._endAdPod();
        this.omapClient?.notifyAdPodSkipped();
    }

    updateConfig(config: Partial<BinderConfig>): void {
        this.config = config;
    }

    on(
        type: typeof OmapBinderEvent.AD_POD_STARTED,
        listener: () => void
    ): void;
    on(
        type: typeof OmapBinderEvent.AD_POD_ENDED,
        listener: () => void
    ): void;
    on(
        type: typeof OmapBinderEvent.AD_STARTED,
        listener: (ad: Ad) => void
    ): void;
    on(
        type: typeof OmapBinderEvent.AD_ENDED,
        listener: (ad: Ad) => void
    ): void;
    on(
        type: typeof OmapBinderEvent.AD_INFO_UPDATED,
        listener: (sequence: number, numOfAds: number, remainingTime: number, duration: number) => void
    ): void;
    on(
        type: typeof OmapBinderEvent.AD_SKIPPABLE_STATE_CHANGED,
        listener: (skippable: boolean) => void
    ): void;
    on(type: TOmapBinderEvent, listener: (...args: any[]) => void): void {
        this._eventListeners.push([ type, listener ]);
    }

    off(
        type: typeof OmapBinderEvent.AD_POD_STARTED,
        listener: () => void
    ): void;
    off(
        type: typeof OmapBinderEvent.AD_POD_ENDED,
        listener: () => void
    ): void;
    off(
        type: typeof OmapBinderEvent.AD_STARTED,
        listener: (ad: Ad) => void
    ): void;
    off(
        type: typeof OmapBinderEvent.AD_ENDED,
        listener: (ad: Ad) => void
    ): void;
    off(
        type: typeof OmapBinderEvent.AD_INFO_UPDATED,
        listener: (sequence: number, numOfAds: number, remainingTime: number, duration: number) => void
    ): void;
    off(
        type: typeof OmapBinderEvent.AD_SKIPPABLE_STATE_CHANGED,
        listener: () => void
    ): void;
    off(type: TOmapBinderEvent, listener: (...args: any[]) => void): void {
        this._eventListeners = this._eventListeners.filter((eventListener) => {
            if (eventListener[0] === type && eventListener[1] === listener) {
                return false;
            }
            return true;
        });
    }

    protected dashjs: dashjs.MediaPlayerClass;
    protected omapClient?: IOmapClient;
    protected adDisplayContainer: HTMLElement;
    protected adVideoElement?: HTMLVideoElement;
    protected adBreaks: AdBreak[] = [];
    protected config: Partial<BinderConfig> = {};

    protected emit(type: typeof OmapBinderEvent.AD_POD_STARTED): void;
    protected emit(type: typeof OmapBinderEvent.AD_POD_ENDED): void;
    protected emit(type: typeof OmapBinderEvent.AD_STARTED, ad: Ad): void;
    protected emit(type: typeof OmapBinderEvent.AD_ENDED, ad: Ad): void;
    protected emit(type: typeof OmapBinderEvent.AD_INFO_UPDATED, sequence: number, numOfAds: number, remainingTime: number, duration: number): void;
    protected emit(type: typeof OmapBinderEvent.AD_SKIPPABLE_STATE_CHANGED): void;
    protected emit(type: TOmapBinderEvent, ...args: any[]): void {
        Debug.log(`Event type ${ type } is emitted`);
        this._eventListeners
            .filter(eventListener => eventListener[0] === type)
            .forEach(eventListener => eventListener[1](...args));
    }

    protected onTimeUpdate(e: dashjs.PlaybackTimeUpdatedEvent): void {
        Debug.log(`onTimeUpdate content current time : ${ e.time }`);
        const time = e.time;
        if (time) {
            this.omapClient?.notifyCurrentTime(time);
        }
    }

    protected onContentCanPlay(): void {
        Debug.log('ContentCanPlay');
    }

    protected _onAllAdsCompleted(): void {
        Debug.log('OmapClientEvent.ALL_ADS_COMPLETED');
    }

    protected onContentPauseRequested(): void {
        Debug.log('ContentPauseRequested');
        if (this.dashjs.isReady()) {
            console.log('isReady');
            this.dashjs.pause();
        } 
    }

    protected onContentResumeRequested(): void {
        Debug.log('ContentResumeRequested');
        if (this.dashjs.isReady()) this.dashjs.play();
    }

    protected onAdPodStarted(adPod: AdPod, adDisplayContainer: HTMLElement): void {
        Debug.log('AdPodStarted');
    }

    protected onAdPodEnded(adPod: AdPod, adDisplayContainer: HTMLElement): void {
        Debug.log('AdPodEnded');
    }

    protected onAdStarted(ad: Ad, adDisplayContainer: HTMLElement): void {
        Debug.log('AdStarted');
        this.emit(OmapBinderEvent.AD_STARTED, ad);
    }

    protected onAdEnded(ad: Ad, adDisplayContainer: HTMLElement): void {
        Debug.log('AdEnded');
        this.emit(OmapBinderEvent.AD_ENDED, ad);
    }

    protected onAdProgress(ad: Ad, adDisplayContainer: HTMLElement, adCurrentTime: number, numOfAds: number): void {
        Debug.log(`AdProgress current time : ${ adCurrentTime }`);
        const sequence = ad.sequence;
        const duration = ad.adCreatives[0].duration;
        const remainingTime = Math.max(Math.floor(duration - adCurrentTime), 0);
        if (
            this._lastAdInfo.sequence !== sequence ||
            this._lastAdInfo.numOfAds !== numOfAds ||
            this._lastAdInfo.remainingTime !== remainingTime
        ) {
            this._lastAdInfo.sequence = sequence;
            this._lastAdInfo.numOfAds = numOfAds;
            this._lastAdInfo.remainingTime = remainingTime;
            this.emit(OmapBinderEvent.AD_INFO_UPDATED, sequence, numOfAds, remainingTime, duration);
        }
    }

    protected onAdSkippable(ad: Ad, adDisplayContainer: HTMLElement, adCurrentTime: number, numOfAds: number): void {
        Debug.log('AdSkippable');
        this.emit(OmapBinderEvent.AD_SKIPPABLE_STATE_CHANGED);
    }

    private _playReady: Promise<void>;
    private _playReadyResolve?: (value: void | PromiseLike<void>) => void;
    private _adManifestReady: Promise<void>;
    private _adManifestReadyResolve?: (value: void | PromiseLike<void>) => void;
    private _adManifestReadyReject?: (reason?: any) => void;
    private _eventListeners: [string, (...args: any[]) => void][] = [];
    private _currentAdPod?: AdPod;
    private _keepsAdVideoElement: boolean = false;
    private _state: TOmapBinderState = OmapBinderState.NOT_BOUND;
    private _lastAdInfo: Partial<{
        sequence: number,
        numOfAds: number,
        remainingTime: number,
    }> = {};
    private _prefetchable = new Prefetchable();

    private _onAdPreparationRequested(adPodInsertionRequest: AdPodInsertionRequest): void {
        Debug.log("AdPreparationRequested");
        this._prefetchNextAd(adPodInsertionRequest.adPod, 0);
    }

    private _onAdInsertionRequested(adPodInsertionRequest: AdPodInsertionRequest): void {
        Debug.log("AdInsertionRequested");
        if (!this._keepsAdVideoElement) {
            this.adVideoElement = document.createElement('video');
            this.adVideoElement.id = 'ad-video';
            this.adDisplayContainer.appendChild(this.adVideoElement);
        }
        this._state = OmapBinderState.AD_PLAYING;
        this._lastAdInfo = {};
        this._currentAdPod = adPodInsertionRequest.adPod;
        if (this._playNextAd(adPodInsertionRequest.adPod, 0)) {
            this.onAdPodStarted(adPodInsertionRequest.adPod, this.adDisplayContainer);
            this.emit(OmapBinderEvent.AD_POD_STARTED);    
        }
    }

    private _onContentCanPlay(): void {
        Debug.log('OmapClientEvent.CONTENT_CAN_PLAY');
        this._playReadyResolve?.();
    }

    private _onOmapClientLoaded(adBreaks: AdBreak[]): void {
        Debug.log('OmapClientEvent.LOADED');
        this.adBreaks = adBreaks;
        this._adManifestReadyResolve?.();
    }

    private _onOmapClientLoadError(): void {
        Debug.log('OmapClientEvent.LOAD_ERROR');
        this._adManifestReadyReject?.();
    }

    private _onOmapClientStarted(): void {
        Debug.log('OmapClientEvent.STARTED');
    }

    private _onOmapClientComplete(): void {
        Debug.log('OmapClientEvent.COMPLETE');
    }

    private _onPlaybackStarted(): void {
        Debug.log('playbackStarted');
        const video = this.dashjs.getVideoElement();
        
        const alreadyRegisteredTrack = [].find.call(video.textTracks, (track: TextTrack) => track.label === AD_BREAKS_TRACK_LABEL);
        if (alreadyRegisteredTrack) return;

        // Register a text track to notify ad break timings.
        const newTrack = video.addTextTrack('metadata', AD_BREAKS_TRACK_LABEL);
        newTrack.mode = 'hidden';
        this.adBreaks.forEach(adBreak => {
            const cue = new (window.VTTCue || window.TextTrackCue)(adBreak.offsetTime, adBreak.offsetTime, '');
            cue.addEventListener('enter', e => {
                const c = e.target as TextTrackCue;
                this.omapClient?.notifyCurrentTime(c.startTime);
            });
            newTrack.addCue(cue);
        });
    }

    private _unbind(): void {
        if (typeof this.omapClient !== 'undefined') {
            this.omapClient.off(OmapClientEvent.CONTENT_CAN_PLAY, this._onContentCanPlay);
            this.omapClient.off(OmapClientEvent.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested);
            this.omapClient.off(OmapClientEvent.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested);
            this.omapClient.off(OmapClientEvent.ALL_ADS_COMPLETED, this._onAllAdsCompleted);
            this.omapClient.off(OmapClientEvent.LOADED, this._onOmapClientLoaded);
            this.omapClient.off(OmapClientEvent.LOAD_ERROR, this._onOmapClientLoadError);
            this.omapClient.off(OmapClientEvent.STARTED, this._onOmapClientStarted);
            this.omapClient.off(OmapClientEvent.COMPLETE, this._onOmapClientComplete);
            this.omapClient.off(OmapClientEvent.AD_POD_INSERTION_REQUESTED, this._onAdInsertionRequested);
            this.omapClient.off(OmapClientEvent.AD_POD_PREPARATION_REQUESTED, this._onAdPreparationRequested);
            delete this.omapClient;
        }

        // dashjs.MediaPlayer.events.PLAYBACK_STARTED = 'playbackStarted'
        this.dashjs.off('playbackStarted', this._onPlaybackStarted);

        // dashjs.MediaPlayer.events.PLAYBACK_TIME_UPDATED = 'playbackTimeUpdated'
        this.dashjs.off('playbackTimeUpdated', this.onTimeUpdate);

        this._state = OmapBinderState.NOT_BOUND;
    }

    private async _prefetchNextAd(adPod: AdPod, idx: number): Promise<void> {
        if (adPod.ads.length === 0) return;

        const ad = adPod.ads[idx];
        if (ad.adCreatives.length === 0) return;

        const adVideoElement = this.adVideoElement!;
        if (adVideoElement === null) return;

        let contentVideoElement: HTMLVideoElement | undefined;
        let videoHeight: number = NaN;
        let height: number = NaN
        if (this.dashjs.isReady()) {
            contentVideoElement = this.dashjs.getVideoElement();
            videoHeight = contentVideoElement.videoHeight;
            height = videoHeight ? videoHeight : contentVideoElement.clientHeight;
        }

        // Select only the first ad creative.
        const adCreative = ad.adCreatives[0];

        const adMediaFile = selectAdMediaFile(adCreative.adMediaFiles, height, this.config);

        const url = adMediaFile.uri;
        this._prefetchable.prefetch(url);
    }

    private _playNextAd(adPod: AdPod, idx: number): boolean {
        if (adPod.ads.length === 0) {
            this._endAdPod();
            this.omapClient?.notifyAdPodEnded();
            return false;
        }

        const ad = adPod.ads[idx];
        if (ad.adCreatives.length === 0) {
            this._endAdPod();
            this.omapClient?.notifyAdPlaybackError(ad);
            this.omapClient?.notifyAdPodEnded();
            return false;
        }

        const adDisplayContainer = this.adDisplayContainer;
        const adVideoElement = this.adVideoElement!;
        if (adVideoElement === null) {
            this._endAdPod();
            this.omapClient?.notifyAdPlaybackError(ad);
            this.omapClient?.notifyAdPodEnded();
            return false;
        }

        let contentVideoElement: HTMLVideoElement | undefined;
        let videoHeight: number = NaN;
        let height: number = NaN
        if (this.dashjs.isReady()) {
            contentVideoElement = this.dashjs.getVideoElement();
            videoHeight = contentVideoElement.videoHeight;
            height = videoHeight ? videoHeight : contentVideoElement.clientHeight;
        }

        // Select only the first ad creative.
        const adCreative = ad.adCreatives[0];

        const adMediaFile = selectAdMediaFile(adCreative.adMediaFiles, height, this.config);

        const url = adMediaFile.uri;
        this._prefetchable.fetch(url)
            .then((response) => response.blob())
            .then((mediaData) => {
                adVideoElement.src = URL.createObjectURL(mediaData);
                adVideoElement.currentTime = 0;
                if (ad.skipOffset === 0) {
                    this.onAdSkippable(ad, adDisplayContainer, 0, adPod.ads.length);
                }
                Debug.log("ad playing: " + idx);
                adVideoElement.play();
            });

        let playingCount = 0;

        const onPlaying = () => {
            if (playingCount++ > 0) return;
            URL.revokeObjectURL(adVideoElement.src);
            this.onAdStarted(ad, adDisplayContainer);
            this.omapClient?.notifyAdStarted(ad);
            if (idx + 1 < adPod.ads.length) {
                this._prefetchNextAd(adPod, idx + 1);
            }
        };
        const onTimeupdate = () => {
            let currentTime = NaN;
            if (adVideoElement) {
                currentTime = adVideoElement.currentTime;
            }
            this.onAdProgress(ad, adDisplayContainer, currentTime, adPod.ads.length);
            if (ad.skipOffset > 0 && currentTime >= ad.skipOffset) {
                this.onAdSkippable(ad, adDisplayContainer, currentTime, adPod.ads.length);
            }
            this.omapClient?.notifyAdCreativePlaying(adCreative, currentTime, ad.sequence);
        }
        const onEnded = () => {
            this.onAdEnded(ad, adDisplayContainer);
            this.omapClient?.notifyAdCreativeEnded(adCreative, ad.sequence);
            if (idx + 1 >= adPod.ads.length) {
                this._endAdPod();
                this.omapClient?.notifyAdPodEnded();
            } else {
                this._destroyAdVideoElement();
                this._playNextAd(adPod, idx + 1);
            }
        }
        const onError = (e: ErrorEvent) => {
            const src = adVideoElement.src;
            URL.revokeObjectURL(adVideoElement.src);            
            if (e.target) {
                const target = e.target as HTMLVideoElement;
                const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
                if (!target.error) {
                    // If the error is not caused by the media file, ignore the event.
                    return;
                } else if (target.error.code === MEDIA_ERR_SRC_NOT_SUPPORTED && src.indexOf('blob:') === 0) {
                    // If the media file is not supported, try to play the original URL.
                    adVideoElement.src = url;
                    adVideoElement.play();
                    return;                   
                }
            }
            this._endAdPod();
            this.omapClient?.notifyAdPlaybackError(ad);
            this.omapClient?.notifyAdPodEnded();
        }

        if (CAN_ABORT_EVENT) {
            this._adVideoEventAbortController = new AbortController();
        } else {
            this._adVideoEventArguments.push([ 'playing', onPlaying ]);
            this._adVideoEventArguments.push([ 'timeupdate', onTimeupdate ]);
            this._adVideoEventArguments.push([ 'ended', onEnded ]);
            this._adVideoEventArguments.push([ 'error', onError ]);
        }
        const options = CAN_ABORT_EVENT ? { signal: this._adVideoEventAbortController?.signal } : void 0;
        adVideoElement.addEventListener('playing', onPlaying, options);
        adVideoElement.addEventListener('timeupdate', onTimeupdate, options);
        adVideoElement.addEventListener('ended', onEnded, options);
        adVideoElement.addEventListener('error', onError, options);

        return true;
    }

    private _endAdPod(): void {
        this._destroyAdVideoElement();
        this._state = OmapBinderState.CONTENT_PLAYING;
        if (!this._currentAdPod) return;
        this.onAdPodEnded(this._currentAdPod, this.adDisplayContainer);
        this._currentAdPod = undefined;
        this.emit(OmapBinderEvent.AD_POD_ENDED);
    }

    private _destroyAdVideoElement(): void {
        if (CAN_ABORT_EVENT && typeof this._adVideoEventAbortController !== 'undefined') {
            this._adVideoEventAbortController.abort();
        } else {
            this._adVideoEventArguments.forEach(([ type, listener ]) => {
                this.adVideoElement?.removeEventListener(type, listener as EventListener);
            });
        }
        delete this._adVideoEventAbortController;
        this._adVideoEventArguments.length = 0;

        if (typeof this.adVideoElement === 'undefined') return;
        // Destroy the ad video element to release the media buffer.
        // Otherwise, the player will fail to attach the source where only a single decoder is available.
        this._resetMediaElement(this.adVideoElement);
        if (!this._keepsAdVideoElement) {
            this.adVideoElement.remove();
        }
    }

    private _resetMediaElement(mediaElement: HTMLMediaElement): void {
        mediaElement.pause();
        mediaElement.removeAttribute('src');
        mediaElement.load();
    }

    private _adVideoEventAbortController?: AbortController;
    private _adVideoEventArguments: ([
        string,
        EventListener | ((e: ErrorEvent) => void),
    ])[] = [];

}

const AD_BREAKS_TRACK_LABEL = 'omap_ad_breaks';
const CAN_ABORT_EVENT = (() => {
    let canAbort = false;
    const testOptions = {
        get signal() {
            canAbort = true;
            return;
        }
    };
    const g = (0, eval)('this');
    if (typeof g.addEventListener !== 'function' || typeof g.removeEventListener !== 'function') return canAbort;
    g.addEventListener('test', null, testOptions);
    Debug.log(`Is AddEventListenerOption signal available?: ${ canAbort }`);
    g.removeEventListener('test', null, testOptions);
    return canAbort;
})();

export function selectAdMediaFile(adMediaFiles: AdMediaFile[], targetHeight: number, config: Partial<BinderConfig> = {}): AdMediaFile {
    function validateBitrate(bitrate?: Bitrate): boolean {
        if (typeof bitrate === 'undefined' || typeof config.bitrate === 'undefined') return true;
        let validBitrate = true;
        if (typeof bitrate.max !== 'undefined' && typeof config.bitrate.max !== 'undefined') {
            validBitrate &&= config.bitrate.max >= bitrate.max;
        }
        if (typeof bitrate.average !== 'undefined' && typeof config.bitrate.average !== 'undefined') {
            validBitrate &&= config.bitrate.average >= bitrate.average;
        }
        return validBitrate;
    }
    // NaN means no target.  Select the media file with the largest height.
    const tHeight = isNaN(targetHeight) ? Number.MAX_SAFE_INTEGER : targetHeight;
    return adMediaFiles
        // Select the media file with the height larget than and closest to the content video and with the bitrate following the config.
        .filter(adMediaFile => validateBitrate(adMediaFile.bitrate))
        .sort((a, b) => Math.abs(a.height - tHeight) - Math.abs(b.height - tHeight))[0] ||
        adMediaFiles.sort((a, b) => b.height - a.height)[0];
}
