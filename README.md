# OMAP : Open Media Ad Player

## Overview

An open-sourced media ad player to let you freely customize its ad insertion logics and UI overlays.

## Motivation

I want an easy-to-customize and open-sourced media ad player library since the major media ad library "IMA SDK" is provided as closed source software and is hard to customize.

## Documentation

Full [API document](https://ygoto3.github.io/omap/) is available describing all public methods, properties, and events.

## Getting Started

If you use [dash.js](https://github.com/Dash-Industry-Forum/dash.js) and IAB's [VMAP](https://www.iab.com/guidelines/vmap/), the easiest way to try OMAP is to use the OMAP binder `@ygoto3/omap-dashjs-binder` and the OMAP client `@ygoto3/omap-iab-client` like below.

First of all, install some essential packages.

```sh
$ npm install @ygoto3/omap-iab-client @ygoto3/omap-dashjs-binder --save
```

Then use the packages in your application code.

```ts
import dashjs from 'dashjs';
import { OmapIABClient } from '@ygoto3/omap-iab-client';
import { OmapDashjsBinder } from '@ygoto3/omap-dashjs-binder';

const videoElement = document.getElementById('video') as HTMLVideoElement;
const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
const player = dashjs.MediaPlayer().create();
const adTagUrl = 'https://example.com/vmap.xml';
const omapClient = new OmapIABClient(adTagUrl);
const omapBinder = new OmapDashjsBinder(player, adDisplayContainer);
omapBinder.bind(omapClient);
omapBinder.play()
    .then(() => {
        player.initialize(videoElement, 'https://example.com/manifest.mpd', true);
    });
```

### Customize an OMAP binder

You can customize an OMAP binder by implementing `IOmapBinder` in `@ygoto3/omap-core`.  The example below is to show you how to overlay the "THIS IS AD!!!" text on the ad video.
 
```ts
class YourBinder extends OmapDashjsBinder implements IOmapBinder {    
    protected override onContentPauseRequested(): void {
        super.onContentPauseRequested();
        const ad = document.createElement('p');
        ad.innerText = 'THIS IS AD!!!';
        this.adDisplayContainer.appendChild(ad);
    }
}
```

Then use your custom binder instead of `OmapDashjsBinder`.

```ts
const omapBinder = new YourBinder(player, adDisplayContainer);
omapBinder.bind(omapClient);
```

### Customize an OMAP client

Your ad server possibly talks to an media player by some means other than IAB's VMAP and VAST.  In this case, you need another OMAP client.  If you implement `IOmapClient` in `@ygoto3/omap-core`, you can replace `@ygoto3/omap-iab-client` with it.

```ts
class YourClient implements IOmapClient {
    // some implementation 
}
const omapClient = new YourClient(adTagUrl);
const omapBinder = new OmapDashjsBinder(player, adDisplayContainer);
omapBinder.bind(omapClient);
```

## Design

The design of OMAP is a 2-layered architecture.  

1. OMAP Client
1. OMAP Binder

### OMAP Client

The role of an OMAP client is to communicate directly with your ad server.  It handles no UI-related concerns. 

### OMAP Binder

The role of an OMAP binder is to bind an OMAP client to a specific player library.  It handles player-related and UI-related concerns. 

## Quick Start for Developers

1. Checkout project repository (default branch: main)
    - `git clone https://github.com/ygoto3/omap.git`
1. Install dependencies
    - `npm install`
1. Build and launch samples page.
    - `npm -w packages/demo run dev`

## License

OMAP is released under [MIT license](./LICENSE)
