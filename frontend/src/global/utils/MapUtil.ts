import { GeocodedPosition } from "@shared/interfaces/EmployeeProfileI";


export abstract class MapUtil {
	/**
	 * Parse a google.maps.GeocoderResponse and return a simplified position object.
	 * Heuristics:
	 * - prefer results with type 'street_address' or 'premise', otherwise first result
	 * - city: locality > postal_town > administrative_area_level_2 > administrative_area_level_1
	 * - district: neighborhood > sublocality > administrative_area_level_3
	 */
	static parseGeocoderResponse(response: google.maps.GeocoderResponse | null | undefined): GeocodedPosition | null {
		if (!response || !response.results || response.results.length === 0) return null;

		// prefer most specific result
		let result: google.maps.GeocoderResult | undefined = response.results.find(r =>
			Array.isArray(r.types) && (r.types.includes('street_address') || r.types.includes('premise') || r.types.includes('subpremise'))
		);

		if (!result) result = response.results[0];

		const comp = (types: string[]) => {
			if (!result || !result.address_components) return undefined;
			for (const t of types) {
				const c = result.address_components.find(ac => ac.types && ac.types.includes(t));
				if (c) return c.long_name;
			}
			return undefined;
		};

		// Extract components
		const postcode = comp(['postal_code']);
		const route = comp(['route']);
		const streetNumber = comp(['street_number']);
		const subpremise = comp(['subpremise', 'premise']);
		const state = comp(['administrative_area_level_1']);

		let street: string | undefined = undefined;
		if (route) {
			street = streetNumber ? `${route} ${streetNumber}` : route;
			if (subpremise) street = `${street}, ${subpremise}`;
		}

		// fallback: try to build street from remaining components excluding locality/state/country/postal_code
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
		const lat = typeof result.geometry?.location?.lat === 'function' ? result.geometry.location.lat() : (result.geometry?.location as any)?.lat ?? undefined;
		const lng = typeof result.geometry?.location?.lng === 'function' ? result.geometry.location.lng() : (result.geometry?.location as any)?.lng ?? undefined;

		if (typeof lat !== 'number' || typeof lng !== 'number') return null;

		const city = comp(['locality', 'postal_town', 'administrative_area_level_2']);
		const district = comp(['neighborhood', 'sublocality', 'administrative_area_level_3']);
		// Prefer country short_name (ISO code) when available
		const countryComponent = (result.address_components || []).find(ac => ac.types && ac.types.includes('country'));
		const country = countryComponent?.short_name || countryComponent?.long_name;

		const out: GeocodedPosition = {
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

		return out;
	}
}