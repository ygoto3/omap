import type AdMediaFile from "./AdMediaFile";

export default class AdCreative {
        
    constructor(id: string, sequence: number, duration: number, adMediaFiles: AdMediaFile[], customData?: string) {
        this.id = id;
        this.sequence = sequence;
        this.duration = duration;
        this.adMediaFiles = adMediaFiles;
        this.customData = customData;
    }

    readonly id: string;
    readonly sequence: number;
    readonly duration: number = 0;
    readonly adMediaFiles: AdMediaFile[] = [];
    readonly customData?: string;
    
}