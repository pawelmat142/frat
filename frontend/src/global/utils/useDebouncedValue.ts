import { useState, useEffect } from "react";

/**
 * Reusable hook for debouncing any value.
 * @param value The value to debounce
 * @param delay Delay in ms
 * @returns Debounced value
 */

export function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}
