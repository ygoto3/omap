import filterNull from "./filterNull";

export default function mapArrayOrElem<T, U>(
  arr: T[],
  fn: (item: T) => U | null,
): U[] {
    return arr.map(fn).filter(filterNull) as U[];
}
