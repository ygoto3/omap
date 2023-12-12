import dashjs from 'dashjs';
import { OmapIABClient } from '@ygoto3/omap-iab-client';
import { OmapDashjsBinder } from '@ygoto3/omap-dashjs-binder';
import { OmapDashjsSDBinder } from '@ygoto3/omap-dashjs-sd-binder';
import { OmapDashjsUIOverlayBinder } from '@ygoto3/omap-dashjs-ui-binder';
import { Debug } from '../../utils/src';

const Key = {
    ENTER: 13,
    SPACE: 32,
    UP: 38,
    DOWN: 40,
} as const;

function main() {
    Debug.enable(true);
    const playButtonMultiDecoders = document.getElementById('play-button-multi-decoders') as HTMLButtonElement;
    const playButtonSingleDecoder = document.getElementById('play-button-single-decoder') as HTMLButtonElement;
    const playButtonUI = document.getElementById('play-button-ui') as HTMLButtonElement;
    playButtonMultiDecoders.addEventListener('click', onClickPlayMultiDecoders);
    playButtonSingleDecoder.addEventListener('click', onClickPlaySingleDecoder);
    playButtonUI.addEventListener('click', onClickPlayUI);
    window.addEventListener('keydown', e => {
        e.preventDefault();
        switch (e.keyCode) {
            case Key.ENTER:
                document.getElementById('play-button-ui')?.click();
                break;
            case Key.SPACE:
                (document.getElementsByClassName('ad-skip-button')[0] as HTMLButtonElement)?.click();
                break;
            case Key.UP:
                Debug.displayOverlay(true);
                break;
            case Key.DOWN:
                Debug.displayOverlay(false);
                break;
            default:
                break;
        }
    }, false);
}

async function onClickPlayMultiDecoders(e: MouseEvent): Promise<void> {
    e.preventDefault();

    const videoElement = document.getElementById('video') as HTMLVideoElement;
    const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
    const player = dashjs.MediaPlayer().create();
    const adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator=';
    const omapClient = new OmapIABClient(adTagUrl);
    const omapBinder = new OmapDashjsBinder(player, adDisplayContainer);
    omapBinder.bind(omapClient);
    await omapBinder.play().catch(() => {
        Debug.error('adBinder failed to get ready');
    });
    player.initialize(videoElement, 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd', true);
}

async function onClickPlaySingleDecoder(e: MouseEvent): Promise<void> {
    e.preventDefault();

    const videoElement = document.getElementById('video') as HTMLVideoElement;
    const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
    const player = dashjs.MediaPlayer().create();
    const adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator=';
    const omapClient = new OmapIABClient(adTagUrl);
    const omapBinder = new OmapDashjsSDBinder(player, adDisplayContainer);
    omapBinder.bind(omapClient);
    await omapBinder.play().catch(() => {
        Debug.error('adBinder failed to get ready');
    });
    player.initialize(videoElement, 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd', true);
}

async function onClickPlayUI(e: MouseEvent): Promise<void> {
    e.preventDefault();

    const videoElement = document.getElementById('video') as HTMLVideoElement;
    const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
    const player = dashjs.MediaPlayer().create();
    const adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator=';
    const adClient = new OmapIABClient(adTagUrl);
    
    const adInfoContainer = document.createElement('p');
    const adMark = document.createTextNode('AD : ');
    const adRemainingTime = document.createTextNode('');
    const adSecond = document.createTextNode('s');
    const adSpace = document.createTextNode(' ');
    const adIndex = document.createTextNode('');
    const adSlash = document.createTextNode(' / ');
    const adTotal = document.createTextNode('');
    adInfoContainer.appendChild(adMark);
    adInfoContainer.appendChild(adRemainingTime);
    adInfoContainer.appendChild(adSecond);
    adInfoContainer.appendChild(adSpace);
    adInfoContainer.appendChild(adIndex);
    adInfoContainer.appendChild(adSlash);
    adInfoContainer.appendChild(adTotal);
    adInfoContainer.className = 'ad-info';
    adDisplayContainer.appendChild(adInfoContainer);

    const skipButton = document.createElement('button');
    skipButton.className = 'ad-skip-button';
    skipButton.innerText = 'Skip';
    adDisplayContainer.appendChild(skipButton);
    
    const adBinder = new OmapDashjsUIOverlayBinder(player, adDisplayContainer, adRemainingTime, adIndex, adTotal, skipButton);
    adBinder.bind(adClient);
    await adBinder.play().catch(() => {
        Debug.error('adBinder failed to get ready');
    });
    player.initialize(videoElement, 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd', true);
}

main();