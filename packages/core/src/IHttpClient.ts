export default interface IHttpClient {
    get(url: string): Promise<string>;
}