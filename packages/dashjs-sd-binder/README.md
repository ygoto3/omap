# @ygoto3/omap-dashjs-sd-binder

## Overview

An OMAP binder implementation to bind [dash.js](https://github.com/Dash-Industry-Forum/dash.js) to an OMAP client.  This binder is implemented to manage an environment where only a single decoder is available.

## Documentation

[API document](https://ygoto3.github.io/omap/modules/dashjs_sd_binder_src.html) is available.

## Getting Started

To install `@ygoto3/omap-dashjs-sd-binder`, run the command below.

```sh
$ npm install @ygoto3/omap-dashjs-sd-binder --save
```

Then you can bind any OMAP client to dash.js.

```ts
import { OmapDashjsSDBinder } from ''@ygoto3/omap-dashjs-binder';

const player = dashjs.MediaPlayer().create();
const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
const omapClient = new YourOMAPClient();
const omapBinder = new OmapDashjsSDBinder(player, adDisplayContainer);
omapBinder.bind(omapClient);
```