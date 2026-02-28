export const GoogleMapsLoader = {
    load: (apiKey: string) => {
        return new Promise<void>((resolve, reject) => {
            if (typeof window === 'undefined') return resolve();
            // already loaded
            // @ts-ignore
            if ((window as any).google && (window as any).google.maps) return resolve();

            const srcBase = 'https://maps.googleapis.com/maps/api/js';
            const src = `${srcBase}?key=${encodeURIComponent(apiKey || '')}&libraries=places&v=weekly`;

            // If a script tag with maps API already exists, wait for it instead of adding another
            const existing = Array.from(document.getElementsByTagName('script')).find(s => s.src && s.src.indexOf(srcBase) !== -1);
            if (existing) {
                if ((window as any).google && (window as any).google.maps) return resolve();
                const onLoad = () => {
                    existing.removeEventListener('load', onLoad);
                    existing.removeEventListener('error', onError);
                    resolve();
                };
                const onError = (ev: any) => {
                    existing.removeEventListener('load', onLoad);
                    existing.removeEventListener('error', onError);
                    reject(new Error('Failed to load Google Maps script'));
                };
                existing.addEventListener('load', onLoad);
                existing.addEventListener('error', onError);
                // fallback timeout
                setTimeout(() => {
                    if ((window as any).google && (window as any).google.maps) resolve();
                }, 5000);
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.defer = true;
            script.type = 'text/javascript';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google Maps script'));
            document.head.appendChild(script);
        });
    }
};

export default GoogleMapsLoader;
