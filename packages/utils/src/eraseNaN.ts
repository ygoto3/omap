export default function eraseNaN(num: number): number | undefined {
    return isNaN(num) ? void 0 : num;
}
