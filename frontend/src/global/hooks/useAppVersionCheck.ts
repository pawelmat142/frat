import { useEffect, useRef } from 'react';

const VERSION_URL = '/version.json';
const RELOAD_GUARD_KEY = 'app-version-reload-guard';

interface VersionResponse {
    version?: string;
}

/**
 * Detects that a new frontend build has been deployed and reloads the app.
 *
 * Installed PWAs rarely reload on their own (no navigation happens while
 * the app sits in the background), so this checks the server's
 * version.json whenever the app is opened or comes back to the foreground
 * (app icon tap / tab focus) and forces a reload if it differs from the
 * version baked into the currently running bundle.
 */
export function useAppVersionCheck(): void {
    const isCheckingRef = useRef(false);

    useEffect(() => {
        const currentVersion = process.env.REACT_APP_VERSION;
        // No version info (e.g. local dev build) - nothing to compare against.
        if (!currentVersion) return;

        const checkVersion = async () => {
            if (isCheckingRef.current) return;
            isCheckingRef.current = true;
            try {
                const response = await fetch(`${VERSION_URL}?_=${Date.now()}`, { cache: 'no-store' });
                if (!response.ok) return;

                const data: VersionResponse = await response.json();
                if (!data.version || data.version === currentVersion) return;

                // Guard against reload loops if the mismatch cannot be resolved.
                if (sessionStorage.getItem(RELOAD_GUARD_KEY) === data.version) return;
                sessionStorage.setItem(RELOAD_GUARD_KEY, data.version);

                window.location.reload();
            } catch {
                // Network hiccup - it will be retried next time the app is opened.
            } finally {
                isCheckingRef.current = false;
            }
        };

        checkVersion();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkVersion();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', checkVersion);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', checkVersion);
        };
    }, []);
}
