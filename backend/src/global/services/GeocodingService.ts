import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeocodedPosition } from '@shared/interfaces/EmployeeProfileI';

interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

interface GeocoderResult {
    address_components: GeocoderAddressComponent[];
    formatted_address: string;
    geometry: {
        location: { lat: number; lng: number };
    };
    types: string[];
}

interface GeocoderApiResponse {
    status: string;
    results: GeocoderResult[];
    error_message?: string;
}

@Injectable()
export class GeocodingService {
    private readonly logger = new Logger(GeocodingService.name);
    private readonly apiKey: string | undefined;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('REACT_APP_GOOGLE_MAPS_API_KEY');
        if (!this.apiKey) {
            this.logger.warn('REACT_APP_GOOGLE_MAPS_API_KEY is not configured. Geocoding will not work.');
        }
    }

    /**
     * Reverse geocode coordinates using Google Maps Geocoding API.
     * This method is called from the backend to avoid browser API key restrictions.
     */
    async reverseGeocode(lat: number, lng: number): Promise<GeocodedPosition | null> {
        if (!this.apiKey) {
            this.logger.error('REACT_APP_GOOGLE_MAPS_API_KEY is not configured');
            return null;
        }

        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(`${lat},${lng}`)}&key=${encodeURIComponent(this.apiKey)}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                this.logger.error(`Geocoding API HTTP error: ${response.status}`);
                return null;
            }

            const json: GeocoderApiResponse = await response.json();

            if (json.status !== 'OK') {
                this.logger.warn(`Geocoding API error: ${json.status} ${json.error_message || ''}`);
                return null;
            }

            return this.parseGeocoderResponse(json.results);
        } catch (error) {
            this.logger.error('Geocoding API request failed', error);
            return null;
        }
    }

    /**
     * Parse Google Maps Geocoder results and return a simplified position object.
     */
    private parseGeocoderResponse(results: GeocoderResult[]): GeocodedPosition | null {
        if (!results || results.length === 0) return null;

        // Prefer most specific result (street_address, premise, subpremise)
        let result = results.find(r =>
            Array.isArray(r.types) && 
            (r.types.includes('street_address') || r.types.includes('premise') || r.types.includes('subpremise'))
        );

        if (!result) result = results[0];

        const getComponent = (types: string[]): string | undefined => {
            if (!result || !result.address_components) return undefined;
            for (const t of types) {
                const component = result.address_components.find(ac => ac.types && ac.types.includes(t));
                if (component) return component.long_name;
            }
            return undefined;
        };

        const getComponentShort = (types: string[]): string | undefined => {
            if (!result || !result.address_components) return undefined;
            for (const t of types) {
                const component = result.address_components.find(ac => ac.types && ac.types.includes(t));
                if (component) return component.short_name;
            }
            return undefined;
        };

        // Extract components
        const postcode = getComponent(['postal_code']);
        const route = getComponent(['route']);
        const streetNumber = getComponent(['street_number']);
        const subpremise = getComponent(['subpremise', 'premise']);
        const state = getComponent(['administrative_area_level_1']);

        let street: string | undefined = undefined;
        if (route) {
            street = streetNumber ? `${route} ${streetNumber}` : route;
            if (subpremise) street = `${street}, ${subpremise}`;
        }

        // Fallback: build street from remaining components
        if (!street) {
            const excludedTypes = new Set([
                'locality',
                'postal_town',
                'administrative_area_level_1',
                'administrative_area_level_2',
                'administrative_area_level_3',
                'country',
                'postal_code',
            ]);
            const remainingParts = (result.address_components || [])
                .filter(ac => !ac.types?.some(t => excludedTypes.has(t)))
                .map(ac => ac.long_name)
                .filter(Boolean);
            if (remainingParts.length) street = remainingParts.join(', ');
        }

        const fullAddress = result.formatted_address || undefined;
        const lat = result.geometry?.location?.lat;
        const lng = result.geometry?.location?.lng;

        if (typeof lat !== 'number' || typeof lng !== 'number') return null;

        const city = getComponent(['locality', 'postal_town', 'administrative_area_level_2']);
        const district = getComponent(['neighborhood', 'sublocality', 'administrative_area_level_3']);
        
        // Prefer country short_name (ISO code) when available
        const country = getComponentShort(['country']);

        return {
            lat,
            lng,
            street,
            city,
            district,
            state,
            postcode,
            country,
            fullAddress,
        };
    }
}
