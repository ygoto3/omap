export default function forceArray<T>(arr: T[] | T): T[] {
    return Array.isArray(arr) ? arr : [arr];
}