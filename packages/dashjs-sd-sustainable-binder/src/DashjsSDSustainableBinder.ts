import type dashjs from "dashjs";
import { OmapDashjsSDBinder } from '@ygoto3/omap-dashjs-sd-binder';
import {
    OmapClientEvent,
    type IOmapBinder,
    type IOmapClient,
    AdBreak,
} from '@ygoto3/omap-core';
import type ITrickyMediaPlayerHandler from './ITrickyMediaPlayerHandler';
import {
    MediaSplitPoint,
    PeriodSplitInfo,
    deepCopy,
    periodSplitInfo,
    shortenPeriodAt,
} from './manifest-manipulation';
import type { Manifest, Period } from './dashjs-types';
import { Debug } from '../../utils/src';

/**
 * Dash.js binder for OMAP clients.
 * Use this binder when only a single decoder is available.
 * ```ts
 * const player = dashjs.MediaPlayer().create();
 * const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
 * const adVideoElement = document.getElementById('ad-video') as HTMLVideoElement;
 * const adTagUrl = 'https://example.com/vmap.xml';
 * const omapClient = new OmapIABClient(adTagUrl);
 * const omapBinder = new OmapDashjsSDSustainableBinder(player, adDisplayContainer);
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
export default class OmapDashjsSDSustainableBinder extends OmapDashjsSDBinder implements IOmapBinder {

    constructor(player: dashjs.MediaPlayerClass, adDisplayContainer: HTMLElement, adVideoElement?: HTMLVideoElement, periodManipulationRoom: number = 3) {
        super(player, adDisplayContainer, adVideoElement);

        this._onManifestLoaded = this._onManifestLoaded.bind(this);
        this._onAdPodInsertionRequestFailed = this._onAdPodInsertionRequestFailed.bind(this);
        this._periodManipulationRoom = periodManipulationRoom;
    }

    get trickyMediaPlayerHandler(): ITrickyMediaPlayerHandler {
        const me = this;

        return {

            get duration(): number {
                let duration = NaN;
                const dashAdapter = me.dashjs.getDashAdapter();
                if (dashAdapter) {
                    duration = dashAdapter.getMpd().mediaPresentationDuration;
                }
                if (isNaN(duration)) {
                    duration = me._periodSplitInfoList.reduce((acc, psi) => acc + psi.duration, 0);
                }
                return duration;
            },

            seek: this._seek.bind(this),

        };
    }

    override destroy(): void {
        this.__unbind();
        super.destroy();
    }

    override bind(omapClient: IOmapClient): void {
        super.bind(omapClient);

        this.omapClient?.on(OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED, this._onAdPodInsertionRequestFailed);

        // dashjs.MediaPlayer.events.MANIFEST_LOADED === 'manifestLoaded'
        this.dashjs.on('manifestLoaded', this._onManifestLoaded);
    }

    protected override onContentResumeRequested(): void {
        Debug.log("ContentResumeRequested");
        this._restart(this._seekingPlayheadTimeBeyondAdBreak);
    }

    private _periodSplitInfoList: PeriodSplitInfo[] = [];
    private _currentPeriodSplitIndex = -1;
    private _currentPointIndex = -1;
    private _originalPeriods: Period[] = [];
    private _seekingPlayheadTimeBeyondAdBreak: number | undefined;
    private _periodManipulationRoom: number;

    private _resetManifest(): Manifest {
        const manifest = this.dashjs.getDashAdapter().getMpd().manifest as Manifest;
        const originalPeriods = deepCopy(this._originalPeriods);
        manifest.Period_asArray.length = 0;
        manifest.Period_asArray.push(...originalPeriods);
        return manifest;
    }

    private _restart(startTime?: number): void {
        if (!this.dashjs.isReady()) return;
        this.lastPlayheadTime = startTime || this.dashjs.time();
        const manifest = this._resetManifest();
        this.dashjs.attachSource(manifest, this.lastPlayheadTime);
        
        // reset state
        this._periodSplitInfoList.length = 0;
        this._currentPeriodSplitIndex = -1;
        this._currentPointIndex = -1;
        this._seekingPlayheadTimeBeyondAdBreak = void 0;
    }

    private _seek(time: number): void {
        const splitPeriodStart = this._periodSplitInfoList
            .slice(0, -1)
            .reduce((acc, psi) => acc + psi.duration, 0);

        const point: MediaSplitPoint | undefined = this._periodSplitInfoList[this._currentPeriodSplitIndex]?.points[this._currentPointIndex];

        const offestInSecond = point?.video?.offsetInSecond || point?.audio?.offsetInSecond || Number.MAX_SAFE_INTEGER;
        if (time < splitPeriodStart + offestInSecond) {
            this.dashjs.seek(time);
            return;
        } else if (this.omapClient?.hasAdPodInsertionAt(time)) {
            this.dashjs.pause();
            this._seekingPlayheadTimeBeyondAdBreak = time;
            this.omapClient?.notifyCurrentTime(time);
        } else {
            this._restart(time);
        }
    }

    private __unbind(): void {
        if (typeof this.omapClient !== 'undefined') {
            this.omapClient.off(OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED, this._onAdPodInsertionRequestFailed);
        }
        // dashjs.MediaPlayer.events.MANIFEST_LOADED === 'manifestLoaded'
        this.dashjs.off('manifestLoaded', this._onManifestLoaded);
    }

    private _onAdPodInsertionRequestFailed(): void {
        Debug.log('OmapClientEvent.AD_POD_INSERTION_REQUEST_FAILED');
        this._restart(this._seekingPlayheadTimeBeyondAdBreak);
    }

    private _onManifestLoaded(e: dashjs.ManifestLoadedEvent): void {
        Debug.log('MANIFEST_LOADED');
            
        const points = this.adBreaks
            .map(adBreak => adBreak.offsetTime)
            .reduce((acc, val) => {
                if (val === 0) return acc;
                if (!~acc.indexOf(val)) acc.push(val);
                return acc;
            }, [] as number[])
            .sort((a, b) => a - b);

        const startTime = isNaN(this.lastPlayheadTime) ? 0 : this.lastPlayheadTime;
        const pointIndex = points.findIndex(p => p > startTime);

        if (pointIndex === -1) return;

        const mpd = e.data as Manifest;
        const Period_asArray = mpd.Period_asArray as Period[];
        this._originalPeriods = deepCopy(Period_asArray);
        
        const [psis, periodIndex] = Period_asArray.reduce((acc, period: Period, idx) => {
            const [psis, foundIndex, prevPeriodEndTime, points, startTime, periodManipulationRoom] = acc;
            if (foundIndex !== -1) return acc;
            const offsetPoints = points
                .map(p => p - prevPeriodEndTime)
                .filter(p => p >= 0);
            const psi = periodSplitInfo(period, offsetPoints, periodManipulationRoom);
            psis.push(psi);

            let newFoundIndex = -1;
            if (psi.points.length) {
                newFoundIndex = idx;
            }
            const newAccTime = psi.duration + prevPeriodEndTime;
            return [psis, newFoundIndex, newAccTime, points, startTime, periodManipulationRoom];
        }, [
            [] /* period split info list */,
            -1 /* found index */,
            0 /* acculated time */,
            points,
            startTime,
            this._periodManipulationRoom
        ] as [PeriodSplitInfo[], number, number, number[], number, number]);

        if (periodIndex === -1) return;
        const period = Period_asArray[periodIndex];
        const psi = psis[periodIndex];
        const mediaSplitPoint = psi.points[pointIndex];
        if (typeof mediaSplitPoint === 'undefined') return;
        const shortenedPeriod = shortenPeriodAt(period, mediaSplitPoint);
        const remainingPeriods = Period_asArray.slice(0, periodIndex);
        Period_asArray.length = 0;
        Period_asArray.push(...remainingPeriods, shortenedPeriod);

        this._periodSplitInfoList = psis;
        this._currentPeriodSplitIndex = periodIndex;
        this._currentPointIndex = pointIndex;
    }

}
