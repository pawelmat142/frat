import { Point, Position } from "@shared/interfaces/EmployeeProfileI";

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
        return `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
    }

}
