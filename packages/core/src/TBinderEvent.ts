import type BinderEvent from './BinderEvent';

type TBindEvent = typeof BinderEvent[keyof typeof BinderEvent];

export default TBindEvent;