import type dashjs from "dashjs";
import type { IOmapBinder } from '@ygoto3/omap-core';
import { OmapDashjsBinder } from '@ygoto3/omap-dashjs-binder';
import { Debug } from '../../utils/src';

/**
 * Dash.js binder for OMAP clients.
 * Use this binder when only a single decoder is available.
 *
 * At ad pod start this binder detaches the content's MediaSource from dash.js so that
 * the single video decoder is released for the ad video element. At ad pod end
 * it reattaches the saved manifest at the recorded playhead time.
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

    protected lastPlayheadTime: number = NaN;
    // Parsed manifest saved before detaching the MediaSource at ad pod start.
    // Subclasses (e.g. sustainable binder) read this to reattach with their own restored manifest.
    protected _savedManifest: object | undefined;

    override destroy(): void {
        // Clear the saved manifest even if destroy is called mid-ad, so that reusing or
        // re-binding this instance for a different content cannot resurrect a stale manifest.
        this._savedManifest = void 0;
        super.destroy();
    }

    protected override onContentPauseRequested(): void {
        Debug.log("ContentPauseRequested");
        super.onContentPauseRequested();
        if (!this.dashjs.isReady()) return;
        // Save the parsed manifest first: once the source is detached dash.js resets its
        // adapter and the manifest can no longer be read back from getDashAdapter().
        this._savedManifest = this.dashjs.getDashAdapter().getMpd().manifest;
        this.lastPlayheadTime = this.dashjs.time();
        // Release the single video decoder by detaching the content's MediaSource.
        this._detachSource();
    }

    protected override onContentResumeRequested(): void {
        Debug.log("ContentResumeRequested");
        if (typeof this._savedManifest === 'undefined') return;
        // Reattach the saved manifest at the recorded playhead time. dash.js auto-plays
        // when the source becomes ready, so no explicit play() call is required here.
        this.dashjs.attachSource(this._savedManifest, this.lastPlayheadTime);
        this._savedManifest = void 0;
    }

    /**
     * dash.js has no public "detach source" API. Passing null to attachSource releases
     * the MediaSource from the video element, which is what we need to free the single
     * video decoder for the ad playback. The cast isolates the type incompatibility.
     */
    private _detachSource(): void {
        this.dashjs.attachSource(null as unknown as object);
    }

}
