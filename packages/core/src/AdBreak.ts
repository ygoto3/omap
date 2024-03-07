import type AdPod from './AdPod';

export default class AdBreak {

    constructor(offsetTime: number, id?: string, adPod?: AdPod) {
        this.offsetTime = offsetTime;
        this.id = id;
        this.adPod = adPod;
    }

    readonly offsetTime: number;
    readonly id?: string;
    readonly adPod?: AdPod;

}