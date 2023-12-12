import type ClientEvent from './ClientEvent';

type TClientEvent = typeof ClientEvent[keyof typeof ClientEvent];

export default TClientEvent;