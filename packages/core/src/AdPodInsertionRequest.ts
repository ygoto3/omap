import type AdPod from "./AdPod";

export default class AdPodInsertionRequest {

    constructor(adPod: AdPod) {
        this.adPod = adPod;
    }

    readonly adPod: AdPod;

}
