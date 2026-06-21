/* Copyright (c) 2024-present Venky Corp. */
import { UserError } from '../../../../../lib/core/common/error';
/**
 * Validates that a value is a valid coordinate pair [lat, lng]
 */
export function validateCoordinatePair(pair) {
    if (!Array.isArray(pair)) {
        throw new UserError(`Expected coordinate pair to be an array, got ${typeof pair}`);
    }
    if (pair.length !== 2) {
        throw new UserError(`Expected coordinate pair to have 2 elements, got ${pair.length}`);
    }
    const [lat, lng] = pair;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new UserError(`Expected coordinate pair to contain numbers, got [${typeof lat}, ${typeof lng}]`);
    }
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new UserError(`Coordinate pair contains NaN values: [${lat}, ${lng}]`);
    }
    return [lat, lng];
}
/**
 * Validates and ensures polygon coordinates are in correct format
 */
export function validatePolygonCoordinates(coordinates) {
    if (!Array.isArray(coordinates)) {
        throw new UserError(`Expected polygon coordinates to be an array, got ${typeof coordinates}`);
    }
    if (coordinates.length < 3) {
        throw new UserError(`Polygon must have at least 3 points, got ${coordinates.length}`);
    }
    return coordinates.map((pair, index) => {
        try {
            return validateCoordinatePair(pair);
        }
        catch (error) {
            throw new UserError(`Invalid coordinate pair at index ${index}: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
/**
 * Ensures polygon is closed (first point equals last point)
 * PostgreSQL polygon type requires closed polygons
 */
export function ensurePolygonClosed(coordinates) {
    if (coordinates.length === 0) {
        return coordinates;
    }
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    // Check if already closed (allowing for floating point precision)
    const isClosed = Math.abs(first[0] - last[0]) < Number.EPSILON && Math.abs(first[1] - last[1]) < Number.EPSILON;
    if (isClosed) {
        return coordinates;
    }
    // Add first point at the end to close the polygon
    return [...coordinates, first];
}
/**
 * Converts array of coordinate pairs to PostgreSQL polygon string format
 * Format: ((lat1,lng1),(lat2,lng2),...)
 */
export function coordinatesToPolygonString(coordinates) {
    const validated = validatePolygonCoordinates(coordinates);
    const closed = ensurePolygonClosed(validated);
    const points = closed.map(([lat, lng]) => `(${lat},${lng})`).join(',');
    return `(${points})`;
}
/**
 * Parses PostgreSQL polygon string format to array of coordinate pairs
 * Format: ((lat1,lng1),(lat2,lng2),...)
 */
export function polygonStringToCoordinates(polygonStr) {
    if (typeof polygonStr !== 'string') {
        throw new UserError(`Expected polygon string, got ${typeof polygonStr}`);
    }
    // Remove outer parentheses
    const trimmed = polygonStr.trim();
    if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
        throw new UserError(`Invalid polygon format: expected format ((x1,y1),(x2,y2),...), got ${polygonStr}`);
    }
    // Remove outer parentheses: ((x1,y1),...) -> (x1,y1),...
    const inner = trimmed.slice(1, -1).trim();
    if (inner.length === 0) {
        throw new UserError(`Invalid polygon format: empty polygon string`);
    }
    // Split by '),(' to get individual points, but need to handle edge cases
    // Pattern: (x1,y1),(x2,y2) -> ['(x1,y1', 'x2,y2)']
    // Better approach: use regex to match (number,number) patterns
    const pointPattern = /\(([^,]+),([^)]+)\)/g;
    const matches = Array.from(inner.matchAll(pointPattern));
    if (matches.length === 0) {
        throw new UserError(`Invalid polygon format: no valid points found in ${polygonStr}`);
    }
    const coordinates = matches.map((match) => {
        const x = Number.parseFloat(match[1].trim());
        const y = Number.parseFloat(match[2].trim());
        if (Number.isNaN(x) || Number.isNaN(y)) {
            throw new UserError(`Invalid coordinate values: (${match[1]}, ${match[2]})`);
        }
        return [x, y];
    });
    if (coordinates.length < 3) {
        throw new UserError(`Polygon must have at least 3 points, got ${coordinates.length}`);
    }
    return coordinates;
}
//# sourceMappingURL=polygon-utils.js.map