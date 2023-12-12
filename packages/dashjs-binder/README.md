# @ygoto3/omap-dashjs-binder

## Overview

An OMAP binder implementation to bind [dash.js](https://github.com/Dash-Industry-Forum/dash.js) to an OMAP client.

## Documentation

[API document](https://ygoto3.github.io/omap/modules/dashjs_binder_src.html) is available.

## Getting Started

To install `@ygoto3/omap-dashjs-binder`, run the command below.

```sh
$ npm install @ygoto3/omap-dashjs-binder --save
```

Then you can bind any OMAP client to dash.js.

```ts
import { OmapDashjsBinder } from ''@ygoto3/omap-dashjs-binder';

const player = dashjs.MediaPlayer().create();
const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
const omapClient = new YourOMAPClient();
const omapBinder = new OmapDashjsBinder(player, adDisplayContainer);
omapBinder.bind(omapClient);
```