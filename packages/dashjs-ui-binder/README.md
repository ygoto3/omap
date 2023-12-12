# @ygoto3/omap-dashjs-ui-binder

## Overview

An OMAP binder implementation to bind [dash.js](https://github.com/Dash-Industry-Forum/dash.js) to an OMAP client.  This binder is implemented to display overlay ad information such as the current ad's sequence number and remaining time in second.

## Documentation

[API document](https://ygoto3.github.io/omap/modules/dashjs_ui_binder_src.html) is available.

## Getting Started

To install `@ygoto3/omap-dashjs-ui-binder`, run the command below.

```sh
$ npm install @ygoto3/omap-dashjs-ui-binder --save
```

Then you can bind any OMAP client to dash.js.

```ts
import { OmapDashjsUIBinder } from ''@ygoto3/omap-dashjs-ui-binder';

const player = dashjs.MediaPlayer().create();
const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
const adRemainingTime = document.createElement('');
const adSequence = document.createElement('');
const adTotal = document.createElement('');
const skipButton = document.createElement('button');
skipButton.innerText = 'Skip';
skipButton.addEventListener('click', () => {
  // do something to skip the ad
});
adDisplayContainer.appendChild(skipButton);
const adTagUrl = 'https://example.com/vmap.xml';
const omapClient = new OmapIABClient(adTagUrl);
const omapBinder = new OmapDashjsUIOverlayBinder(player, adDisplayContainer, adRemainingTime, adSequence, adTotal, skipButton, adVideoElement);
omapBinder.bind(omapClient);
omapBinder.play()
    .then(() => {
        player.initialize(videoElement, 'https://example.com/manifest.mpd', true);
    });
```