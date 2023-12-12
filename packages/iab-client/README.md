# @ygoto3/omap-iab-client

## Overview

An OMAP client implementation to handle IAB's VMAP and VAST.

## Documentation

[API document](https://ygoto3.github.io/omap/modules/iab_client_src.html) is available.

## Getting Started

To install `@ygoto3/omap-iab-client`, run the command below.

```sh
$ npm install @ygoto3/omap-iab-client --save
```

Then you can play video ad specified via VMAP.

```ts
import { OmapIABClient } from '@ygoto3/omap-iab-client';
import { OmapClientEvent } from '@ygoto3/omap-core';

const adTagUrl = 'https://example.com/vmap.xml';
const omapClient = new OmapIABClient(adTagUrl);
omapClient.on(OmapClientEvent.CONTENT_PAUSE_REQUESTED, () => player.pause());
omapClient.on(OmapClientEvent.CONTENT_RESUME_REQUESTED, () => player.play());
omapClient.play();
omapClient?.notifyCurrentTime(player.time());
```

Or you can bind `@ygoto3/omap-iab-client` to some player library via any OMAP binder such as `@ygoto3/omap-dashjs-binder` to easily sync the ad insertion timings to the player's playback.

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
```