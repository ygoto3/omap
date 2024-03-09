# @ygoto3/omap-dashjs-sd-binder

## Overview

An OMAP binder implementation to bind [dash.js](https://github.com/Dash-Industry-Forum/dash.js) to an OMAP client.  This binder is implemented to extend [@ygoto3/omap-dashjs-sd-binder](https://github.com/ygoto3/omap/tree/main/packages/dashjs-sd-binder) in order to playback a video stream in a sustainable way.  The binder avoids fetching excessive media data that will be discarded after an ad pod is played, which is what  [@ygoto3/omap-dashjs-sd-binder](https://github.com/ygoto3/omap/tree/main/packages/dashjs-sd-binder) does.

## Documentation

[API document](https://ygoto3.github.io/omap/modules/dashjs_sd_sustainable_binder_src.html) is available.

## Getting Started

To install `@ygoto3/omap-dashjs-sd-sustainable-binder`, run the command below.

```sh
$ npm install @ygoto3/omap-dashjs-sd-sustainable-binder --save
```

Then you can bind any OMAP client to dash.js.

```ts
import { OmapDashjsSDSustainableBinder } from '@ygoto3/omap-dashjs-sd-sustainable-binder';

const player = dashjs.MediaPlayer().create();
const adDisplayContainer = document.getElementById('ad-display-container') as HTMLDivElement;
const omapClient = new YourOMAPClient();
const omapBinder = new OmapDashjsSDSustainableBinder(player, adDisplayContainer);
omapBinder.bind(omapClient);
```

## trickyMediaPlayerHandler

You need to use a `trickyMediaPlayerHandler` when you want to seek or to get the duration of the media stream.  Binded by OmapDashjsSDSustainableBinder, a dash.js player cannot neither accurately seek nor return the original duration since the OmapDashjsSDSustainableBinder manipulates the manifest in order to avoid downloading media segments that the dash.js player would redundantly download after playing an ad pod.

```ts
// Instead of dashjs.seek(10);
omapBinder.trickyMediaPlayerHandler.seek(10);

// Instead of dashjs.duration;
omapBinder.trickyMediaPlayerHandler.duration;
```

## Manifest Format Support

OmapDashjsSDSustainableBinder's manifest manipulation depends on the format of the manifest dashjs plays.  Which mpd format it currently supports is shown below. 

|Type           |SegmentTemplate only|SegmentTimeline $Number$|SegmentTimeline $Time$|SegmentList|SegmentBase|
|:-------------:|:------------------:|:----------------------:|:--------------------:|:---------:|:---------:|
|Video On-Demand| -                  |**Y**                   |**Y**                 | -         | -         |
|Live           | -                  | -                      | -                    | -         | -         |
|Event          | -                  | -                      | -                    | -         | -         |
