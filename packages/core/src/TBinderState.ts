import type BinderState from "./BinderState";

type TBinderState = typeof BinderState[keyof typeof BinderState];

export default TBinderState;