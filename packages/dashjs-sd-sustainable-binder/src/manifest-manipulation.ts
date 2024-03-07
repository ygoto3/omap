import type { Period, S, AdaptationSet, Representation, SegmentTemplate, SegmentTimeline } from './dashjs-types';


export function periodSplitInfo(period: Period, points: number[]): PeriodSplitInfo {
    const [mediaSplitPoints, videoDuration, audioDuration] = mediaSplitPointsInAdaptationSets(points, period.AdaptationSet_asArray);

    const periodSplitInfo: PeriodSplitInfo = {
        duration: period.duration || Math.max(videoDuration, audioDuration),
        points: mediaSplitPoints,
    };

    return periodSplitInfo;
}

function mediaSplitPointsInAdaptationSets(points: number[], adaptationSets: AdaptationSet[]): [MediaSplitPoint[], number, number] {

    const [
        videoSegmentTimelineSplitPoints,
        audioSegmentTimelineSplitPoints,
        videoDuration,
        audioDuration,
    ] = adaptationSets.reduce((acc, adaptationSet) => {

        const [
            videoSegmentTimelineSplitPoints,
            audioSegmentTimelineSplitPoints,
            prevVideoDuration,
            prevAudioDuration,
        ] = acc;

        const contentType = contentTypeFromAdaptationSet(adaptationSet);

        if (contentType === 'unknown') {
            return [
                videoSegmentTimelineSplitPoints,
                audioSegmentTimelineSplitPoints,
                prevVideoDuration,
                prevAudioDuration,
            ];
        }

        const representation = adaptationSet.Representation_asArray[0];
        const segmentTemplate = segmentTemplateFromRepresentation(representation);
        const segmentTimeline = segmentTemplate.SegmentTimeline_asArray[0];
        
        if (typeof segmentTimeline !== 'undefined') {
            const timescale = segmentTemplate.timescale || 1;

            const [
                segmentTimelineSplitPoints,
                totalDuration,
            ] = segmentTimelineSplitPointsInSArray(points, segmentTimeline.S_asArray, timescale);

            let videoDuration = prevVideoDuration;
            let audioDuration = prevAudioDuration;
            if (contentType === 'video') {
                videoSegmentTimelineSplitPoints.push(...segmentTimelineSplitPoints);
                videoDuration = totalDuration / timescale;
            } else if (contentType === 'audio') {
                audioSegmentTimelineSplitPoints.push(...segmentTimelineSplitPoints);
                audioDuration = totalDuration / timescale;
            }

            return [
                videoSegmentTimelineSplitPoints,
                audioSegmentTimelineSplitPoints,
                videoDuration,
                audioDuration,
            ];
        }

        return [
            videoSegmentTimelineSplitPoints,
            audioSegmentTimelineSplitPoints,
            prevVideoDuration,
            prevAudioDuration,
        ];
    }, [
        [],
        [],
        0,
        0,
    ] as [SegmentTimelineSplitPoint[], SegmentTimelineSplitPoint[], number, number]);
    
    return [
        mediaSplitPointsInSegmentTimelineSplitPoints(points, videoSegmentTimelineSplitPoints, audioSegmentTimelineSplitPoints),
        videoDuration,
        audioDuration,
    ];
}

function segmentTimelineSplitPointsInSArray(
    points: number[],
    sArray: S[],
    timescale: number = 1
): [SegmentTimelineSplitPoint[], number, number] {
    return sArray.reduce((acc, s, idx) => {
        const [
            prevSegmentTimelineSplitPoints,
            offsetTime,
            timescale,
        ] = acc;
        
        const [segmentTimelineSplitPoints, endTime] = pointsInS(points, s, offsetTime, timescale, idx);
        prevSegmentTimelineSplitPoints.push(...segmentTimelineSplitPoints);
        
        return [prevSegmentTimelineSplitPoints, endTime, timescale];
    },
    [
        [],
        0 /* offsetTime */,
        timescale,
    ] as [SegmentTimelineSplitPoint[], number, number]);
}

function pointsInS(
    points: number[],
    s: S,
    offset: number,
    timescale: number,
    segmentIndex: number,
): [SegmentTimelineSplitPoint[], number] {
    const repeat = s.r || 0;
    const duration = s.d * (repeat + 1);
    const startTime = s.t || offset;
    const endTime = offset + duration;

    const [
        segmentTimelineSplitPoints,
        accumulatedDuration,
    ] = points.reduce((acc, point) => {
        const [
            segmentTimelineSplitPoints,
            _,
            timescale,
        ] = acc;

        const pointInScale = point * timescale;
        
        if (offset <= pointInScale && pointInScale <= endTime) {
            let repeatNumber = 0;
            if (s.r && s.r > 0) {
                const delta = pointInScale - offset;
                repeatNumber = Math.floor(delta / s.d);
            }
            const segmentTimelineSplitPoint: SegmentTimelineSplitPoint = {
                offsetInSecond: point,
                type: 'SegmentTimeline',
                index: segmentIndex,
                repeat: repeatNumber,
            };
            segmentTimelineSplitPoints.push(segmentTimelineSplitPoint);
        }

        return [segmentTimelineSplitPoints, endTime, timescale, segmentIndex];
    }, [
        [],
        offset,
        timescale,
        segmentIndex,
    ] as [
        SegmentTimelineSplitPoint[], number, number, number
    ]);

    return [segmentTimelineSplitPoints, accumulatedDuration];
}

function mediaSplitPointsInSegmentTimelineSplitPoints(points: number[], videoSegmentTimelineSplitPoints: SegmentTimelineSplitPoint[], audioSegmentTimelineSplitPoints: SegmentTimelineSplitPoint[]): MediaSplitPoint[] {
    const [mediaSplitPoints] = videoSegmentTimelineSplitPoints.reduce(
        (acc, videoSegmentTimelineSplitPoint, idx) => {
            const [mediaSplitPoints, audioSegmentTimelineSplitPoints] = acc;
        
            const audioSegmentTimelineSplitPoint = audioSegmentTimelineSplitPoints[idx];
            if (typeof audioSegmentTimelineSplitPoint !== 'undefined') {
                const mediaSplitPoint: MediaSplitPoint = {
                    video: videoSegmentTimelineSplitPoint,
                    audio: audioSegmentTimelineSplitPoint,
                }
                mediaSplitPoints[idx] = mediaSplitPoint;
            }

            return acc;
    }, [[], audioSegmentTimelineSplitPoints] as [MediaSplitPoint[], SegmentTimelineSplitPoint[]]);
    
    return mediaSplitPoints;
}

export function shortenPeriodAt(period: Period, mediaSplitPoint: MediaSplitPoint): Period {
    const { video, audio } = mediaSplitPoint;
    if (typeof video === 'undefined' || typeof audio === 'undefined') return period;
    
    const clonedAdaptationSets = deepCopy(period.AdaptationSet_asArray);
    const [
        adaptationSets,
    ] = clonedAdaptationSets.reduce((acc, adaptationSet) => {
        const [
            adaptationSets,
            prevVideo,
            prevAudio,
        ] = acc;

        const contentType = contentTypeFromAdaptationSet(adaptationSet);
        if (contentType === 'unknown') return acc;

        const splitPoint = contentType === 'video' ? video : audio;

        const [ representations, _ ] =
            adaptationSet.Representation_asArray.reduce((acc, representation) => {
                const [ representations, splitPoint ] = acc;

                const segmentTemplate = segmentTemplateFromRepresentation(representation);
                const segmentTimeline = segmentTemplate.SegmentTimeline_asArray[0];

                [segmentTemplate.SegmentTimeline_asArray[0], segmentTemplate.SegmentTimeline as SegmentTimeline].forEach(segmentTimeline => {
                    const targetS = segmentTimeline.S_asArray[splitPoint.index];
                    if (typeof targetS === 'undefined') return [representations, splitPoint] as [Representation[], SegmentTimelineSplitPoint];
                    if (splitPoint.repeat === 0) {
                        delete targetS.r;
                    } else if (targetS.r && targetS.r > 0) {
                        targetS.r =  splitPoint.repeat;
                    }
                    segmentTimeline.S_asArray.length = splitPoint.index + 1;
                });

                representations.push(representation);

                return [representations, splitPoint] as [Representation[], SegmentTimelineSplitPoint];
            }, [
                [],
                splitPoint,
            ] as [Representation[], SegmentTimelineSplitPoint]);

        adaptationSet.Representation_asArray.length = 0;
        adaptationSet.Representation_asArray.push(...representations);

        adaptationSets.push(adaptationSet);
        
        return [
            adaptationSets,
            video,
            audio,
        ];
    }, [
        [],
        video,
        audio,
    ] as [AdaptationSet[], SegmentTimelineSplitPoint, SegmentTimelineSplitPoint]);


    period.AdaptationSet_asArray.length = 0;
    period.AdaptationSet_asArray.push(...adaptationSets);
    return period;
};

export function deepCopy<T>(obj: T): T {
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(obj);
        } catch (e) {
            console.warn('structuredClone is not supported, using JSON.parse(JSON.stringify())');
        }
    }
    return JSON.parse(JSON.stringify(obj)) as T;
}

export function contentTypeFromAdaptationSet(adaptationSet: AdaptationSet): 'video' | 'audio' | 'unknown' {
    if (adaptationSet.contentType === 'video') return 'video';
    else if (adaptationSet.contentType === 'audio') return 'audio';
    else if (typeof adaptationSet.mimeType !== 'undefined') {
        if (adaptationSet.mimeType.startsWith('video')) return 'video';
        else if (adaptationSet.mimeType.startsWith('audio')) return 'audio';
        else return 'unknown';
    }
    return 'unknown';
}

export function segmentTemplateFromRepresentation(representation: Representation): SegmentTemplate {
    return Array.isArray(representation.SegmentTemplate_asArray) ? representation.SegmentTemplate_asArray[0] : representation.SegmentTemplate;
}

interface SplitPoint {
    type: 'SegmentTimeline';
    offsetInSecond: number;
}

type SegmentTimelineSplitPoint = SplitPoint & {
    index: number;
    repeat: number;
};

export interface MediaSplitPoint {
    video?: SegmentTimelineSplitPoint;
    audio?: SegmentTimelineSplitPoint;
}

export interface PeriodSplitInfo {
    duration: number;
    points: MediaSplitPoint[];
}
