/**
 * Validates that a value is a valid coordinate pair [lat, lng]
 */
export declare function validateCoordinatePair(pair: unknown): [number, number];
/**
 * Validates and ensures polygon coordinates are in correct format
 */
export declare function validatePolygonCoordinates(coordinates: unknown): [number, number][];
/**
 * Ensures polygon is closed (first point equals last point)
 * PostgreSQL polygon type requires closed polygons
 */
export declare function ensurePolygonClosed(coordinates: [number, number][]): [number, number][];
/**
 * Converts array of coordinate pairs to PostgreSQL polygon string format
 * Format: ((lat1,lng1),(lat2,lng2),...)
 */
export declare function coordinatesToPolygonString(coordinates: [number, number][]): string;
/**
 * Parses PostgreSQL polygon string format to array of coordinate pairs
 * Format: ((lat1,lng1),(lat2,lng2),...)
 */
export declare function polygonStringToCoordinates(polygonStr: string): [number, number][];
//# sourceMappingURL=polygon-utils.d.ts.map