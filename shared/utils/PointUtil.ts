import { Point, Position } from "@shared/def/employee-profile.def";

export abstract class PointUtil {

    public static toGeoPoint(position: Position): Point {
        return {
            type: 'Point',
            coordinates: [position.lng, position.lat],
        };
    }

    public static fromGeoPoint(point: Point, address?: string): Position {
        const [lng, lat] = point.coordinates;
        return { lat, lng, address };
    }

}
