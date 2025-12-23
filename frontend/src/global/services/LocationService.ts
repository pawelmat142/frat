import { Position } from "@shared/interfaces/EmployeeProfileI";

export const LocationService = {

    getLocation(): Promise<Position | null> {

        return new Promise<Position | null>((resolve) => {
            if (!navigator.geolocation) {
                console.warn('Geolocation is not supported by this browser.');
                resolve(null);
            } else {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        resolve({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        });
                    },
                    (err) => {
                        console.error('Error getting position:', err);
                        resolve(null);
                    }
                );
            }
        });
    }
}
