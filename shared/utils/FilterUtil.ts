import { Position } from "../interfaces/MapsInterfaces"

export abstract class FilterUtil {

    public static getArray = (key: string, params: URLSearchParams): string[] => {
        const v = params.get(key)
        if (!v) return []
        return v.split(',').filter(Boolean)
    }

    public static prepareNumberParam = (params: URLSearchParams, name: string): number | null => {
        const value = params.get(name)
        const parsed = value ? parseFloat(value) : null
        return isNaN(parsed as number) ? null : parsed;
    }

    public static preparePositionParam = (params: URLSearchParams, latKey: string, lngKey: string): Position | null => {
        const lat = this.prepareNumberParam(params, latKey);
        const lng = this.prepareNumberParam(params, lngKey);
        if (!lat || !lng) {
            return null;
        }
        return { lat, lng };
    }
}