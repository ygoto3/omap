# @ygoto3/omap-vast-parser

## Overview

A VAST parser implementaion.

## Documentation

[API document](https://ygoto3.github.io/omap/modules/vast_parser_src.html) is available.

## Getting Started

To install `@ygoto3/omap-vast-parser`, run the command below.

```sh
$ npm install @ygoto3/omap-vast-parser --save
```

Then you can parse a VAST text using `@ygoto3/omap-vast-parser` in your application code.

```ts
import { VASTParser } from '@ygoto3/omap-vast-parser';

const vast = `
<?xml version="1.0" encoding="UTF-8"?>
<VAST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd" version="3.0">
...
</VAST>
`;

const parser = new VASTParser(vast);
const parsedVAST = parser.parse();
const ads = parsedVMAP?.ads;
```