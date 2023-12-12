import type AdCreative from "./AdCreative";

export default class Ad {

    constructor(adCreatives: AdCreative[], sequence: number, id?: string, skipOffset: number = 0) {
        this.adCreatives = adCreatives;
        this.sequence = sequence;
        this.id = id;
        this.skipOffset = skipOffset;
    }

    readonly id?: string;
    readonly sequence: number;
    readonly adCreatives: AdCreative[];
    readonly skipOffset: number;

}