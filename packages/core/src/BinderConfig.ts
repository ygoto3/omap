import type Bitrate from './Bitrate';

export default interface BinderConfig {

    /**
     * Target bitrate for ad media files.
     * The binder will download media files where the following bitrate conditions meet. 
     * If the average bitrate is specified, media files with average bitrate that is equal to or less than the specified average bitrate will be downloaded.
     * If the max bitrate is specified, media files with max bitrate that is equal to or less than the specified max bitrate will be downloaded.
     * If the min bitrate is specified, media files with min bitrate that is equal to or greater than the specified max bitrate will be downloaded.
     */
    bitrate: Bitrate;
    
}
