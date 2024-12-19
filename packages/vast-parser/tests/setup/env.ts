import { DOMParser, XMLSerializer } from 'xmldom';

export function setup() {
  globalThis.DOMParser = DOMParser;
  globalThis.XMLSerializer = XMLSerializer;
}
