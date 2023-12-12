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
    TOmapBinderEvent
} from '@ygoto3/omap-core';
import { Debug } from '../../utils/src';
import type dashjs from 'dashjs';

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
        this._onAdInsertionRequested = this._onAdInsertionRequested.bind(this);

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

    bind(omapClient: IOmapClient): void {
        this.omapClient = omapClient;

        this.omapClient.on(OmapClientEvent.CONTENT_CAN_PLAY, () => {
            Debug.log('OmapClientEvent.CONTENT_CAN_PLAY');
            this._playReadyResolve?.();
        });

        this.omapClient.on(OmapClientEvent.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested);

        this.omapClient.on(OmapClientEvent.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested);

        this.omapClient.on(OmapClientEvent.ALL_ADS_COMPLETED, () => {
            Debug.log('OmapClientEvent.ALL_ADS_COMPLETED');
        });

        this.omapClient.on(OmapClientEvent.LOADED, () => {
            Debug.log('OmapClientEvent.LOADED');
            this._adManifestReadyResolve?.();
        });

        this.omapClient.on(OmapClientEvent.LOAD_ERROR, () => {
            Debug.log('OmapClientEvent.LOAD_ERROR');
            this._adManifestReadyReject?.();
        });

        this.omapClient.on(OmapClientEvent.STARTED, () => {
            Debug.log('OmapClientEvent.STARTED');
        });

        this.omapClient.on(OmapClientEvent.COMPLETE, () => {
            Debug.log('OmapClientEvent.COMPLETE');
        });

        this.omapClient.on(OmapClientEvent.AD_POD_INSERTION_REQUESTED, this._onAdInsertionRequested);

        // dashjs.MediaPlayer.events.PLAYBACK_TIME_UPDATED = 'playbackTimeUpdated'
        this.dashjs.on('playbackTimeUpdated', this.onTimeUpdate);

        this._state = OmapBinderState.BINDED;
    }

    async play(startTime: number = 0): Promise<void> {
        this.omapClient?.play();
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
        listener: (sequence: number, numOfAds: number, remainingTime: number) => void
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
        listener: (sequence: number, numOfAds: number, remainingTime: number) => void
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

    protected emit(type: typeof OmapBinderEvent.AD_POD_STARTED): void;
    protected emit(type: typeof OmapBinderEvent.AD_POD_ENDED): void;
    protected emit(type: typeof OmapBinderEvent.AD_STARTED, ad: Ad): void;
    protected emit(type: typeof OmapBinderEvent.AD_ENDED, ad: Ad): void;
    protected emit(type: typeof OmapBinderEvent.AD_INFO_UPDATED, sequence: number, numOfAds: number, remainingTime: number): void;
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
            this.emit(OmapBinderEvent.AD_INFO_UPDATED, sequence, numOfAds, remainingTime);
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
    private _state: TOmapBinderState = OmapBinderState.NOT_BINDED;
    private _lastAdInfo: Partial<{
        sequence: number,
        numOfAds: number,
        remainingTime: number,
    }> = {};

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

        // Select the media file with the height larget than and closest to the content video.
        let adMediaFile = adCreative.adMediaFiles
            .filter((adMediaFile) => adMediaFile.height >= height)
            .sort((a, b) => (a.height - height) - (b.height - height))[0] ||
            adCreative.adMediaFiles.sort((a, b) => b.height - a.height)[0];

        const url = adMediaFile.uri;
        adVideoElement.src = url;
        adVideoElement.currentTime = 0;
        if (ad.skipOffset === 0) {
            this.onAdSkippable(ad, adDisplayContainer, 0, adPod.ads.length);
        }
        Debug.log("ad playing: " + idx);
        adVideoElement.play();

        let playingCount = 0;

        const onPlaying = () => {
            if (playingCount++ > 0) return;
            this.onAdStarted(ad, adDisplayContainer);
            this.omapClient?.notifyAdStarted(ad);
        };
        const onTimeupdate = () => {
            let currentTime = NaN;
            let duration = NaN;
            if (adVideoElement) {
                currentTime = adVideoElement.currentTime;
                duration = adVideoElement.duration;
            }
            this.onAdProgress(ad, adDisplayContainer, currentTime, adPod.ads.length);
            if (ad.skipOffset > 0 && currentTime >= ad.skipOffset) {
                this.onAdSkippable(ad, adDisplayContainer, currentTime, adPod.ads.length);
            }
            this.omapClient?.notifyAdCreativePlaying(adCreative, currentTime, ad.sequence);
        }
        const onEnded = () => {
            this.onAdEnded(ad, adDisplayContainer);
            adVideoElement?.removeEventListener('playing', onPlaying);
            adVideoElement?.removeEventListener('timeupdate', onTimeupdate);
            adVideoElement?.removeEventListener('ended', onEnded);
            this.omapClient?.notifyAdCreativeEnded(adCreative, ad.sequence);
            if (idx + 1 >= adPod.ads.length) {
                this._endAdPod();
                this.omapClient?.notifyAdPodEnded();
            } else {
                this._playNextAd(adPod, idx + 1);
            }
        }
        const onError = () => {
            this._endAdPod();
            this.omapClient?.notifyAdPlaybackError(ad);
        }
        adVideoElement.addEventListener('playing', onPlaying);
        adVideoElement.addEventListener('timeupdate', onTimeupdate);
        adVideoElement.addEventListener('ended', onEnded);
        adVideoElement.addEventListener('error', onError);

        return true;
    }

    private _endAdPod(): void {
        const adVideoElement = this.adDisplayContainer.querySelector('#ad-video') as HTMLVideoElement | null;
        // Destroy the ad video element to release the media buffer.
        // Otherwise, the player will fail to attach the source where only a single decoder is available.
        if (adVideoElement !== null) this._destroyMediaElement(adVideoElement);
        this._state = OmapBinderState.CONTENT_PLAYING;
        if (!this._currentAdPod) return;
        this.onAdPodEnded(this._currentAdPod, this.adDisplayContainer);
        this._currentAdPod = undefined;
        this.emit(OmapBinderEvent.AD_POD_ENDED);
    }

    private _destroyMediaElement(mediaElement: HTMLMediaElement): void {
        mediaElement.pause();
        mediaElement.removeAttribute('src');
        mediaElement.load();
        if (!this._keepsAdVideoElement) {
            mediaElement.remove();
        }
    }

}