import type IHttpClient from "./IHttpClient";

export default class DefaultHttpClient implements IHttpClient {
    get(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(response => {
                    if (response.ok) {
                        resolve(response.text());
                    } else {
                        reject(response.statusText);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}