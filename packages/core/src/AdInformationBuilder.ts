import AdInformation from "./AdInformation";

export default class AdInformationBuilder {

    setAdTagUrl(adTagUrl: string): AdInformationBuilder {
        this._adTagUrl = adTagUrl;
        return this;
    }
    
    setAdDisplayContainer(adDisplayContainer: HTMLElement): AdInformationBuilder {
        this._adDisplayContainer = adDisplayContainer;
        return this;
    }

    build(): AdInformation {
        if (this._adDisplayContainer === undefined) {
            throw new Error('AdDisplayContainer is not defined');
        }
        if (this._adTagUrl === undefined) {
            throw new Error('AdTagUrl is not defined');
        }
        return new AdInformation(this._adTagUrl, this._adDisplayContainer);
    }

    private _adTagUrl: string | undefined;
    private _adDisplayContainer: HTMLElement | undefined;

}