export interface GeocodedPosition {
	lat: number;
	lng: number;
	street?: string;
	city?: string;
	district?: string;
	state?: string; // administrative_area_level_1
	postcode?: string;
	country?: string;
	fullAddress?: string;
}

export interface Position {
  lat: number;
  lng: number;
  address?: string;
}