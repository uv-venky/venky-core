export declare function dataURLToUint8Array(dataURL: string): Uint8Array<ArrayBuffer>;
export declare function readImageFromFS(filePath: string): Promise<Uint8Array>;
export declare function getPngDimensions(dataURL: string): {
    width: number;
    height: number;
};
export declare function readImageFromFSAsBase64(filePath: string): Promise<string>;
//# sourceMappingURL=export-utils.d.ts.map