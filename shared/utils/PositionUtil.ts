import { Point } from "@shared/interfaces/EmployeeProfileI";
import { Position } from "@shared/interfaces/MapsInterfaces";

export abstract class PositionUtil {

    public static toGeoPoint(position?: Position): Point | null {
        if (!position) {
            return null;
        }
        return {
            type: 'Point',
            coordinates: [position.lng, position.lat],
        };
    }

    public static fromGeoPoint(point: Point, address?: string): Position {
        const [lng, lat] = point.coordinates;
        return { lat, lng, address };
    }

    public static formatPosition = (position: Position): string => {
        return position.address || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
    }

    public static getDistanceFromToInMeters(from: Position, to: Position): number {
        const toRad = (deg: number) => deg * Math.PI / 180;
        const earthRadius = 6371e3; // Earth's radius in meters

        const lat1 = toRad(from.lat);
        const lat2 = toRad(to.lat);
        const deltaLat = toRad(to.lat - from.lat);
        const deltaLng = toRad(to.lng - from.lng);

        const a = Math.sin(deltaLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

        const distance = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return distance;
    }

    public static displayDistance(distanceInMeters: number): string {
        if (distanceInMeters < 1000) {
            return `${Math.round(distanceInMeters)} m`;
        } else {
            return `${Math.round(distanceInMeters / 1000)} km`;
        }
    }

}
