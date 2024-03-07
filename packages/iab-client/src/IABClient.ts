import {
    type IOmapClient,
    OmapClientEvent,
    AdPodInsertionRequest,
    AdCreative, AdMediaFile,
    Ad as AdObj,
    AdBreak as AdBreakObj,
    AdPod,
    type IHttpClient,
    DefaultHttpClient,
    type TOmapClientEvent,
} from '@ygoto3/omap-core';
import {
    VMAPParser,
    type VMAP,
    type AdBreak
} from '@ygoto3/omap-vmap-parser';
import {
    VASTParser,
    Tracking,
    LinearAdMetric,
    Impression,
    type Ad,
} from '@ygoto3/omap-vast-parser';
import { Debug, filterNull } from '../../utils/src';

/**
 * An OMAP client implentation for IAB specifaication.
 *
 * ```ts
 * const omapClient = new OmapIABClient(adTagUrl);
 * ```
 */
export default class OmapIABClient implements IOmapClient {

    /**
     * @param adTagUrl AD Tag URI
     * @param httpClient You can specify your own HTTP client. If you don't specify, the default HTTP client will be used.
     * @param prefetchableOffset Offset time to let the IAB client prefetch ad data.
     * @param prefetchThreshold The threshold of giving up prefetching ad data.
     */
    constructor(adTagUrl: string, httpClient?: IHttpClient, prefetchableOffset: number = 5, prefetchThreshold: number = 2) {
        this._countAdBreakConsumption = this._countAdBreakConsumption.bind(this);

        this._adTagUrl = adTagUrl;
        if (prefetchableOffset) this.prefetchableOffset = prefetchableOffset;
        if (prefetchThreshold) this.prefetchThreshold = prefetchThreshold;
        if (httpClient) this.httpClient = httpClient;
        this._init();
    }

    play(): void {
        this._playing = true;
    }

    attachAdInsertionDecider(
        decider: (
            currentTime: number,
            adBreaks: AdBreak[],
            countAdBreakConsumption: (adBreak: AdBreak) => number
        ) => AdBreak | undefined
    ): void {
        this._adInsertionDecider = decider;
    }

    on(type: typeof OmapClientEvent.CONTENT_CAN_PLAY, listener: () => void): void;
    on(type: typeof OmapClientEvent.CONTENT_PAUSE_REQUESTED, listener: () => void): void;
    on(type: typeof OmapClientEvent.CONTENT_RESUME_REQUESTED, listener: () => void): void;
    on(type: typeof OmapClientEvent.ALL_ADS_COMPLETED, listener: () => void): void;
    on(type: typeof OmapClientEvent.LOADED, listener: (adBreaks: AdBreakObj[]) => void): void;
    on(type: typeof OmapClientEvent.LOAD_ERROR, listener: () => void): void;
    on(type: typeof OmapClientEvent.STARTED, listener: () => void): void;
    on(type: typeof OmapClientEvent.COMPLETE, listener: () => void): void;
    on(type: typeof OmapClientEvent.AD_POD_INSERTION_REQUESTED, listener: (adPodInsertionRequest: AdPodInsertionRequest) => void): void;
    on(type: typeof OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED, listener: () => void): void;
    on(type: typeof OmapClientEvent.AD_POD_PREPARATION_REQUESTED, listener: (adPodInsertionRequest: AdPodInsertionRequest) => void): void;
    on(type: TOmapClientEvent, listener: (...args: any[]) => void): void {
        this._eventListeners.push([ type, listener ]);
    }

    off(type: typeof OmapClientEvent.CONTENT_CAN_PLAY, listener: () => void): void;
    off(type: typeof OmapClientEvent.CONTENT_PAUSE_REQUESTED, listener: () => void): void;
    off(type: typeof OmapClientEvent.CONTENT_RESUME_REQUESTED, listener: () => void): void;
    off(type: typeof OmapClientEvent.ALL_ADS_COMPLETED, listener: () => void): void;
    off(type: typeof OmapClientEvent.LOADED, listener: (adBreaks: AdBreakObj[]) => void): void;
    off(type: typeof OmapClientEvent.LOAD_ERROR, listener: () => void): void;
    off(type: typeof OmapClientEvent.STARTED, listener: () => void): void;
    off(type: typeof OmapClientEvent.COMPLETE, listener: () => void): void;
    off(type: typeof OmapClientEvent.AD_POD_INSERTION_REQUESTED, listener: (adPodInsertionRequest: AdPodInsertionRequest) => void): void;
    off(type: typeof OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED, listener: () => void): void;
    off(type: typeof OmapClientEvent.AD_POD_PREPARATION_REQUESTED, listener: (adPodInsertionRequest: AdPodInsertionRequest) => void): void;
    off(type: TOmapClientEvent, listener: (...args: any[]) => void): void {
        this._eventListeners = this._eventListeners.filter((eventListener) => {
            if (eventListener[0] === type && eventListener[1] === listener) {
                return false;
            }
            return true;
        });
    }

    notifyCurrentTime(currentTime: number): void {
        if (!this._playing || this._playingAd) return;
        const adBreaks = this._vmap?.adBreaks || [];

        const adBreakToInsert = this._adInsertionDecider(currentTime + this.prefetchableOffset, adBreaks, this._countAdBreakConsumption);
        if (adBreakToInsert) {
            const calcTime = (adBreak: AdBreak) => adBreak.timeOffset.split(':')
                    .map((timeElm: string, index: number) => {
                        return +timeElm * Math.pow(60, 2 - index);
                    })
                    .reduce((prev: number, curr: number) => curr + prev, 0);
            const offsetTime = adBreakToInsert.timeOffset === 'start' ? 0 : calcTime(adBreakToInsert);
            
            if (offsetTime - currentTime <= this.prefetchableOffset && offsetTime - currentTime > this.prefetchThreshold) {
                this._requestAdPreparation(adBreakToInsert);
            } else if (offsetTime === 0 || !this.prefetchableOffset || currentTime >= offsetTime) {
                this._requestAdInsertion(adBreakToInsert);
            }
        } 
        else if (!this._canPlay) {
            this._canPlay = true;
            this.emit(OmapClientEvent.CONTENT_CAN_PLAY);
        }
    }

    notifyAdPodEnded(): void {
        this._playingAd = false;
        if (!this._playing) return;
        if (this._canPlay) {
            this.emit(OmapClientEvent.CONTENT_RESUME_REQUESTED);
        } else {
            this._canPlay = true;
            this.emit(OmapClientEvent.CONTENT_CAN_PLAY);
        }
    }

    notifyAdPodSkipped(): void {
        this.notifyAdPodEnded();
    }

    notifyAdStarted(ad: AdObj): void {
        if (!this._playing) return;
        const impressions = this._extractImpressingAd(ad);
        if (!impressions) return;
        impressions.forEach(impression => {
            this.httpClient.get(impression.url)
                .catch(e => {
                    Debug.error(e);
                });
        });
    }

    notifyAdPlaybackError(ad: AdObj): void {
        if (!this._playing) return;
        const errors = this._getErrorAd(ad);
        if (!errors) return;
        errors.forEach(error => {
            this.httpClient.get(error)
                .catch(e => {
                    Debug.error(e);
                });
        });
    }

    notifyAdCreativePlaying(adCreative: AdCreative, elapsedTime: number, adSequence: number): void {
        if (!this._playing) return;
        const percentage = elapsedTime / adCreative.duration;
        if (percentage < 0 || percentage >= 1) return;

        let metric: typeof LinearAdMetric[keyof typeof LinearAdMetric] | undefined;
        if (percentage >= 0 && percentage < 0.25) {
            metric = LinearAdMetric.START;
        } else if (percentage >= 0.25 && percentage < 0.5) {
            metric = LinearAdMetric.FIRST_QUARTILE;
        } else if (percentage >= 0.5 && percentage < 0.75) {
            metric = LinearAdMetric.MIDPOINT;
        } else if (percentage >= 0.75 && percentage < 1) {
            metric = LinearAdMetric.THIRD_QUARTILE;
        }
        if (!metric) return;
        const tracking = this._consumeTrackingAd(adSequence, adCreative, metric);
        if (!tracking) return;
        this.httpClient.get(tracking.uri)
            .catch(e => {
                Debug.error(e);
            });
    }

    notifyAdCreativeEnded(adCreative: AdCreative, adSequence: number): void {
        if (!this._playing) return;
        const trackingEvents = this._extractTrackingAd(adSequence, adCreative);
        if (!trackingEvents) return;
        const complete = trackingEvents.find(trackingEvent => trackingEvent.event === LinearAdMetric.COMPLETE);
        if (!complete) return;
        this.httpClient.get(complete.uri).catch(e => {
            Debug.error(e);
        });
    }

    notifyContentEnded(): void {
        if (!this._playing) return;
        if (this._playingAd) return;
        const adBreaks = this._vmap?.adBreaks || [];
        adBreaks.forEach((adBreak: AdBreak) => {
            const consumed = this._countAdBreakConsumption(adBreak);
            if (!consumed) {
                if (adBreak.timeOffset === 'end') {
                    this._requestAdInsertion(adBreak);
                }
            }
        });
    }

    hasAdPodInsertionAt(time: number): boolean {
        const adBreaks = this._vmap?.adBreaks || [];
        const adBreakToInsert = this._adInsertionDecider(time, adBreaks, this._countAdBreakConsumption);
        return typeof adBreakToInsert !== 'undefined';
    }

    protected prefetchableOffset: number = 5;
    protected prefetchThreshold: number = 2;
    protected httpClient: IHttpClient = new DefaultHttpClient();

    protected onContentTimeUpdate(
        currentTime: number,
        adBreaks: AdBreak[],
        requestAdInsertion: (adBreak: AdBreak) => void,
        countAdBreakConsumption: (adBreak: AdBreak) => number
    ): void {
        for (let i = 0; i < adBreaks.length; i++) {
            const adBreak = adBreaks[i] as AdBreak | undefined;
            if (!adBreak) continue;
            const nextAdBreak = adBreaks[i + 1] as AdBreak | undefined;
            const consumptionCount = countAdBreakConsumption(adBreak);
            if (consumptionCount) continue;
            if (adBreak.timeOffset === 'start') {
                requestAdInsertion(adBreak);
                break;
            } else if (adBreak.timeOffset.includes(':')) {
                const calcTime = (adBreak: AdBreak) => adBreak.timeOffset.split(':')
                    .map((timeElm: string, index: number) => {
                        return +timeElm * Math.pow(60, 2 - index);
                    })
                    .reduce((prev: number, curr: number) => curr + prev, 0);
                const time = calcTime(adBreak);
                let nextTime = Number.MAX_VALUE;
                if (nextAdBreak) nextTime = calcTime(nextAdBreak);
                if (currentTime >= time && currentTime < nextTime) {
                    requestAdInsertion(adBreak);
                    break;
                }
            }
        }
    }

    protected emit(type: typeof OmapClientEvent.CONTENT_CAN_PLAY): void;
    protected emit(type: typeof OmapClientEvent.CONTENT_PAUSE_REQUESTED): void;
    protected emit(type: typeof OmapClientEvent.CONTENT_RESUME_REQUESTED): void;
    protected emit(type: typeof OmapClientEvent.ALL_ADS_COMPLETED): void;
    protected emit(type: typeof OmapClientEvent.LOADED, adBreaks: AdBreakObj[]): void;
    protected emit(type: typeof OmapClientEvent.LOAD_ERROR): void;
    protected emit(type: typeof OmapClientEvent.STARTED): void;
    protected emit(type: typeof OmapClientEvent.COMPLETE): void;
    protected emit(type: typeof OmapClientEvent.AD_POD_PREPARATION_REQUESTED, adPodInsertionRequest: AdPodInsertionRequest): void;
    protected emit(type: typeof OmapClientEvent.AD_POD_INSERTION_REQUESTED, adPodInsertionRequest: AdPodInsertionRequest): void;
    protected emit(type: typeof OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED): void;
    protected emit(type: TOmapClientEvent, ...args: any[]): void {
        Debug.log(`Event type ${ type } is emitted`);
        this._eventListeners
            .filter(eventListener => eventListener[0] === type)
            .forEach(eventListener => eventListener[1](...args));
    }

    private _playing: boolean = false;
    private _adTagUrl: string;
    private _vmap: VMAP | undefined;
    private _eventListeners: [string, (...args: any[]) => void][] = [];
    private _playingAd: boolean = false;
    private _adBreakConsumptions: AdBreakConsumption[] = [];
    private _trackingAds: { [key: string]: Tracking[] } = {};
    private _impressionAds: { [key: string]: Impression[] } = {};
    private _errors: { [key: string]: string[] } = {};
    private _canPlay: boolean = false;
    private _preparedAdBreak?: AdBreak;

    private _adInsertionDecider = this._defaultAdInsertionDecider;

    private _defaultAdInsertionDecider(
        currentTime: number,
        adBreaks: AdBreak[],
        countAdBreakConsumption: (adBreak: AdBreak) => number,
    ): AdBreak | undefined {
        for (let i = 0; i < adBreaks.length; i++) {
            const adBreak = adBreaks[i] as AdBreak | undefined;
            if (!adBreak) continue;
            const nextAdBreak = adBreaks[i + 1] as AdBreak | undefined;
            const consumptionCount = countAdBreakConsumption(adBreak);
            if (consumptionCount) continue;
            const calcTime = (adBreak: AdBreak) => adBreak.timeOffset.split(':')
                    .map((timeElm: string, index: number) => {
                        return +timeElm * Math.pow(60, 2 - index);
                    })
                    .reduce((prev: number, curr: number) => curr + prev, 0);
            if (adBreak.timeOffset === 'start' && (typeof nextAdBreak === 'undefined' || currentTime < calcTime(nextAdBreak))) {
                // If the adBreak is the first adBreak and the next adBreak is not defined or the current time is less than the next adBreak's time, return the adBreak.
                return adBreak;
            } else if (adBreak.timeOffset.includes(':')) {
                
                const time = calcTime(adBreak);
                let nextTime = Number.MAX_VALUE;
                if (nextAdBreak && nextAdBreak.timeOffset.includes(':')) {
                    nextTime = calcTime(nextAdBreak);
                }
                if (currentTime >= time && currentTime <= nextTime) {
                    return adBreak;
                }
            }
        }
        return void 0;
    }

    private async _init(): Promise<void> {
        this.httpClient.get(this._adTagUrl)
            .then(text => {
                this._vmap = new VMAPParser(text).parse() || void 0;
                const adBreaks = this._vmap?.adBreaks.map(adBreak => {
                    let timeOffset = NaN;
                    if (adBreak.timeOffset === 'start') {
                        timeOffset = 0;
                    } else if (adBreak.timeOffset === 'end') {
                        timeOffset = Number.MAX_VALUE;
                    } else {
                        const timeOffsetArr = adBreak.timeOffset.split(':').map(Number);
                        timeOffset = timeOffsetArr[0] * 3600 + timeOffsetArr[1] * 60 + timeOffsetArr[2];
                    }
                    const id = adBreak.breakId;
                    return new AdBreakObj(timeOffset, adBreak.breakId);
                }) || [];
                this.emit(OmapClientEvent.LOADED, adBreaks);
            })
            .catch(e => {
                Debug.error(e);
                this.emit(OmapClientEvent.LOAD_ERROR);
            });
    }

    private _findAdBreakComsumption(adBreak: AdBreak): AdBreakConsumption | undefined {
        return this._adBreakConsumptions.find(consumption =>
            adBreak.timeOffset === consumption.adBreak.timeOffset &&
            adBreak.breakId === consumption.adBreak.breakId
        );
    }

    private _registerAdBreakConsumption(adBreak: AdBreak): void {
        const consumption = this._findAdBreakComsumption(adBreak);
        if (consumption) {
            consumption.count++;
        } else {
            this._adBreakConsumptions.push({
                adBreak,
                count: 1
            });
        }
    }

    private _countAdBreakConsumption(adBreak: AdBreak): number {
        const consumption = this._findAdBreakComsumption(adBreak);
        if (consumption) return consumption.count;
        return 0;
    }

    private _cache = new Map<string, AdPod>();

    private _adBreak2AdPod(adBreak: AdBreak): Promise<AdPod> {
        return new Promise<AdPod>((resolve, reject) => {
            adBreak.adSources.forEach(adSource => {
                if (adSource.adTagURI.templateType === 'vast3') {
                    if (this._cache.has(adSource.adTagURI.uri)) {
                        resolve(this._cache.get(adSource.adTagURI.uri) as AdPod);
                        return;
                    }
                    this.httpClient.get(adSource.adTagURI.uri)
                        .then(text => {
                            const vast = new VASTParser(text).parse();
                            if (!vast) {
                                reject(new Error('Failed to parse VAST'));
                                return;
                            }
    
                            const ads = sortAdsBySequence(vast.ads).map((ad, adIdx) => {
                                if (!ad.inLine) return null;
                                const inLine = ad.inLine;
                                const adSequence = adIdx + 1;
                                let skipOffset = 0;
                                const adCreatives = inLine.creatives.map((creative, creativeIdx) => {
                                    const creativeSequence = creative.sequence ? creative.sequence : creativeIdx;
                                    const linear = creative.linear;
                                    if (linear?.skipOffset) skipOffset = linear.skipOffset;
                                    const mediaFiles = linear?.mediaFiles.map(mediaFile => {
                                        const url = mediaFile.url;
                                        const width = mediaFile.width;
                                        const height = mediaFile.height;
                                        return new AdMediaFile(url, width, height);
                                    });
                                    if (!mediaFiles) return null;
                                    const duration = linear?.duration || 0;
                                    const trackingEvents = linear?.trackingEvents;
                                    const adParameters = linear?.adParameters;
                                    const newAdCreative = new AdCreative(creative.id, creativeSequence, duration, mediaFiles, adParameters);
                                    if (trackingEvents) {
                                        this._registerTrackingAd(newAdCreative, trackingEvents, adSequence);
                                    }
                                    return newAdCreative;
                                }).filter(filterNull) as AdCreative[];
                                const newAdObj = new AdObj(adCreatives, adSequence, ad.id, skipOffset);
                                this._registerImpressingAd(newAdObj, ad.inLine.impressions);
                                this._registerErrorAd(newAdObj, inLine.errors);
                                return newAdObj;
                            }).filter(filterNull) as AdObj[];
    
                            const adPod = new AdPod(ads);
                            this._cache.set(adSource.adTagURI.uri, adPod);
                            resolve(adPod);
                        });
                }
            });
        });
    }

    private async _requestAdPreparation(adBreak: AdBreak): Promise<void> {
        if (this._preparedAdBreak === adBreak) return;
        this._preparedAdBreak = adBreak;
        const adPod = await this._adBreak2AdPod(adBreak)
            .catch(e => this.emit(OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED));
        if (!adPod) return;
        const adPodInsertionRequest = new AdPodInsertionRequest(adPod);
        this.emit(OmapClientEvent.AD_POD_PREPARATION_REQUESTED, adPodInsertionRequest);
    }

    private async _requestAdInsertion(adBreak: AdBreak): Promise<void> {
        delete this._preparedAdBreak;
        this._registerAdBreakConsumption(adBreak);
        const adPod = await this._adBreak2AdPod(adBreak)
            .catch(e => this.emit(OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED));
        if (!adPod) return;
        const adPodInsertionRequest = new AdPodInsertionRequest(adPod);
        this._playingAd = true;
        this.emit(OmapClientEvent.CONTENT_PAUSE_REQUESTED);
        this.emit(OmapClientEvent.AD_POD_INSERTION_REQUESTED, adPodInsertionRequest);
    }

    private _registerTrackingAd(adCreative: AdCreative, trackingEvents: Tracking[], adSequence: number): void {
        const key = getAdCreativeKey(adCreative, adSequence);
        this._trackingAds[key] = trackingEvents;
    }

    private _extractTrackingAd(adSequence: number, adCreative: AdCreative): Tracking[] | undefined {
        const key = getAdCreativeKey(adCreative, adSequence);
        const target = this._trackingAds[key];
        if (target) {
            delete this._trackingAds[key];
            return target;
        }
        return void 0;
    }

    private _consumeTrackingAd(
        adSequence: number,
        adCreative: AdCreative,
        metric: typeof LinearAdMetric[keyof typeof LinearAdMetric]
    ): Tracking | undefined {
        const key = getAdCreativeKey(adCreative, adSequence);
        const trackings = this._trackingAds[key];
        if (!trackings) return void 0;
        const idx = trackings.findIndex(tracking => tracking.event === metric);
        if (!~idx) return void 0;
        const target = trackings[idx];
        trackings.splice(idx, 1);
        return target;
    }

    private _registerImpressingAd(ad: AdObj, impressions: Impression[]): void {
        const key = getAdKey(ad);
        this._impressionAds[key] = impressions;
    }

    private _extractImpressingAd(ad: AdObj): Impression[] | undefined {
        const key = getAdKey(ad);
        const target = this._impressionAds[key];
        if (target) {
            delete this._impressionAds[key];
            return target;
        }
        return void 0;
    }

    private _registerErrorAd(ad: AdObj, errors: string[]): void {
        const key = getAdKey(ad);
        this._errors[key] = errors;
    }

    private _getErrorAd(ad: AdObj): string[] | undefined {
        const key = getAdKey(ad);
        const target = this._errors[key];
        if (target) {
            return target;
        }
        return void 0;
    }

}

function getAdKey(ad: AdObj): string {
    return `${ ad.id ? ad.id : '' }:${ ad.sequence ? ad.sequence : '' }`;
}

function getAdCreativeKey(adCreative: AdCreative, adSequence: number): string {
    return `${ adSequence }:${ adCreative.id }:${ adCreative.sequence }`;
}

export function sortAdsBySequence(ads: Ad[]): Ad[] {
    const seq: Ad[] = [];
    const duplicated: Ad[] = [];
    const rest: Ad[] = [];
    ads.forEach(ad => {
        if (typeof ad.sequence === 'undefined') {
            rest.push(ad);
            return;
        } else if (typeof seq[ad.sequence - 1] === 'undefined') {
            seq[ad.sequence - 1] = ad;
            return;
        } else {
            duplicated.push(ad);
        }
    });
    duplicated.forEach(ad => {
        if (typeof ad.sequence === 'undefined') return;
        const idx = ad.sequence - 1;
        const offsetToInsert = seq.slice(idx).findIndex(s => typeof s === 'undefined');
        if (!~offsetToInsert) {
            seq.push(ad);
        } else {
            seq[idx + offsetToInsert] = ad;
        }
    });
    rest.forEach(ad => {
        if (typeof ad.sequence !== 'undefined') return;
        const idxToInsert = seq.findIndex(s => typeof s === 'undefined');
        if (!~idxToInsert) {
            seq.push(ad);
        } else {
            seq[idxToInsert] = ad;
        }
    });
    return seq.filter(s => typeof s !== 'undefined');
}

type AdBreakConsumption = {
    adBreak: AdBreak,
    count: number
};