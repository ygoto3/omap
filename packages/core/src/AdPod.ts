import type Ad from "./Ad";

export default class AdPod {
    
    constructor(ads: Ad[]) {
        this.ads = ads;
    }

    readonly ads: Ad[] = [];

}