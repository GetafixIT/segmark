export declare type SegmarkResponse = {
    [x: string]: string | {};
} | string;
export declare type Segmark = (x: string, isUri?: boolean) => Promise<SegmarkResponse>;
declare const segmark: Segmark;
export { segmark };
declare const _default: {
    segmark: Segmark;
};
export default _default;
