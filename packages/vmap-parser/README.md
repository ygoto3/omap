# @ygoto3/omap-vmap-parser

## Overview

A VMAP parser implementaion.

## Documentation

[API document](https://ygoto3.github.io/omap/modules/vmap_parser_src.html) is available.

## Getting Started

To install `@ygoto3/omap-vmap-parser`, run the command below.

```sh
$ npm install @ygoto3/omap-vmap-parser --save
```

Then you can parse a VMAP text using `@ygoto3/omap-vmap-parser` in your application code.

```ts
import { VMAPParser } from '@ygoto3/omap-vmap-parser';

const vmap = `
<?xml version="1.0" encoding="UTF-8"?>
<vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">
...
</vmap:VMAP>
`;

const parser = new VMAPParser(vmap);
const parsedVMAP = parser.parse();
const adBreaks = parsedVMAP?.adBreaks;
```