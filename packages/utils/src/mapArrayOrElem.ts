import forceArray from "./forceArray";
import filterNull from "./filterNull";

export default function mapArrayOrElem<T, U>(
  arr: T[] | T,
  fn: (item: T) => U | null,
): U[] {
    return forceArray(arr).map(fn).filter(filterNull) as U[];
}
