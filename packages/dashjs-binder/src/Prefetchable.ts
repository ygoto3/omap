export default class Prefetchable {

    async fetch(url: string): Promise<Response> {
        let promise: Promise<Response> | undefined;
        if (this._promises.has(url)) {
            promise = this._promises.get(url) ?? void 0;;
            this._promises.delete(url);
        }
        if (!promise) {
            promise = fetch(url);
        }
        if (!promise) return Promise.reject(new Error('Failed to fetch'));
        return promise;
    }

    prefetch(url: string): void {
        this._promises.set(url, fetch(url));
    }

    private _promises: Map<string, Promise<Response>> = new Map();

}