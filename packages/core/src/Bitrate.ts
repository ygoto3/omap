export default class Bitrate {

    constructor(average?: number, max?: number, min?: number) {
        this.average = average;
        this.max = max;
        this.min = min;
    }

    readonly average?: number;
    readonly max?: number;
    readonly min?: number;

}
