import type dashjs from "dashjs";
import type { IOmapBinder } from '@ygoto3/omap-core';
import { OmapDashjsBinder } from '@ygoto3/omap-dashjs-binder';
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
 * const omapBinder = new OmapDashjsSDBinder(player, adDisplayContainer);
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
export default class OmapDashjsSDBinder extends OmapDashjsBinder implements IOmapBinder {

    constructor(player: dashjs.MediaPlayerClass, adDisplayContainer: HTMLElement, adVideoElement?: HTMLVideoElement) {
        super(player, adDisplayContainer, adVideoElement);
    }

    protected override onContentPauseRequested(): void {
        Debug.log("ContentPauseRequested");
        super.onContentPauseRequested();
        if (this.dashjs.isReady()) {
            this._manifest = this.dashjs.getSource();
            this._currentTime = this.dashjs.time();
        }
    }

    protected override onContentResumeRequested(): void {
        Debug.log("ContentResumeRequested");
        const manifest = this._manifest;
        if (manifest === undefined) return;
        if (this.dashjs.isReady()) {
            // Reattach the source
            // to resume the content after the ad is played where only a single decoder is available.
            this.dashjs.attachSource(manifest, this._currentTime);
        }
        super.onContentResumeRequested();
    }

    private _currentTime: number = NaN;
    private _manifest: string | object | undefined;

}