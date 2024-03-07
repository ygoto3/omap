export default interface ITrickyMediaPlayerHandler {

    duration: number;
    seek(time: number): void;

}