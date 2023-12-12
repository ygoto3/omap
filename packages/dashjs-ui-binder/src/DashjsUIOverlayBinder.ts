import type dashjs from 'dashjs';
import { OmapBinderEvent } from "@ygoto3/omap-core";
import { OmapDashjsBinder } from "@ygoto3/omap-dashjs-binder";

/**
 * Dash.js binder for an OMAP client.
 * Use this binder if you want a UI overlay to display the ads' information.
 * ```ts
 * const player = dashjs.MediaPlayer().create();
 * const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
 * const adVideoElement = document.getElementById('ad-video') as HTMLVideoElement;
 * const adRemainingTime = document.createElement('');
 * const adSequence = document.createElement('');
 * const adTotal = document.createElement('');
 * const skipButton = document.createElement('button');
 * skipButton.innerText = 'Skip';
 * skipButton.addEventListener('click', () => {
 *   // do something to skip the ad
 * });
 * adDisplayContainer.appendChild(skipButton);
 * const adTagUrl = 'https://example.com/vmap.xml';
 * const omapClient = new OmapIABClient(adTagUrl);
 * const omapBinder = new OmapDashjsUIOverlayBinder(player, adDisplayContainer, adRemainingTime, adSequence, adTotal, skipButton, adVideoElement);
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
export default class OmapDashjsUIOverlayBinder extends OmapDashjsBinder {

    /**
     * @param player The dash.js player.
     * @param adDisplayContainer The container element for the ad UI overlay.
     * @param adRemainingTime The text node to display the remaining time of the current ad.
     * @param adSequence The text node to display the index of the current ad.
     * @param adTotal The text node to display the total number of ads in the current ad pod.
     * @param skipButton The skip button element.
     * @param adVideoElement The ad video element.
     */
    constructor(player: dashjs.MediaPlayerClass, adDisplayContainer: HTMLElement, adRemainingTime: Text, adSequence: Text, adTotal: Text, skipButton: HTMLElement, adVideoElement?: HTMLVideoElement) {
        super(player, adDisplayContainer, adVideoElement);

        this._adRemainingTime = adRemainingTime;
        this._adIndex = adSequence;
        this._adTotal = adTotal;

        this._skipButton = skipButton;
        this._skipButton.hidden = true;
        this._skipButton.addEventListener('click', () => {
            this.skip();
        });

        this.on(OmapBinderEvent.AD_POD_STARTED, () => {
            adDisplayContainer.hidden = false;
        });

        this.on(OmapBinderEvent.AD_POD_ENDED, () => {
            adDisplayContainer.hidden = true;
        });

        this.on(OmapBinderEvent.AD_INFO_UPDATED, (sequence: number, numOfAds: number, remainingTime: number) => {
            this._adIndex.textContent = `${ sequence }`;
            this._adTotal.textContent = `${ numOfAds }`;
            this._adRemainingTime.textContent = `${ remainingTime }`;
        });

        this.on(OmapBinderEvent.AD_SKIPPABLE_STATE_CHANGED, () => {
            this._skipButton.hidden = false;
        });
    }

    private _adRemainingTime: Text;
    private _adIndex: Text;
    private _adTotal: Text;
    private _skipButton: HTMLElement;
    
}