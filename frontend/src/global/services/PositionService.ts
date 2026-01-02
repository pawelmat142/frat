import { Position } from "@shared/interfaces/MapsInterfaces";

export const PositionService = {

    async callApiFindCountryByPosition(position: Position): Promise<string | null> {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(position.lat)}&lon=${encodeURIComponent(position.lng)}&zoom=3&addressdetails=1`;
        const resp = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                // Nominatim requires a valid identifying User-Agent; replace with app/contact in production.
                'User-Agent': 'jobHighEmployeeSearch/1.0 (contact: example@example.com)'
            }
        });
        if (!resp.ok) {
            return null; // Silent fail – we do not block UX
        }
        const data = await resp.json();
        // Nominatim returns lowercase ISO 3166-1 alpha-2 code under address.country_code

        const code = data?.address?.country_code;
        return code || null;
    },
}
