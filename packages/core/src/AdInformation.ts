import type IAdInformation from './IAdInformation';

export default class AdInformation implements IAdInformation {
   
    constructor(adTagUrl: string, adDisplayContainer: HTMLElement) {
        this.adTagUrl = adTagUrl;
        this.adDisplayContainer = adDisplayContainer;
    }

    adTagUrl: string;
    adDisplayContainer: HTMLElement;

}