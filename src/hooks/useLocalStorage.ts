import { useState, useEffect, useCallback, useMemo } from "react";
import { localStorage } from "../core/services";
import { isEqual } from "lodash";

/**
 * Custom hook for using localStorage with React state
 * Provides type safety and automatic serialization/deserialization
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get stored value or initialize with provided default
  const [storedValue, setStoredValue] = useState<T>(() => {
    return localStorage.getItem<T>(key, initialValue);
  });

  // Function to update both state and localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prevStoredValue) => {
        // Allow value to be a function for previous state pattern
        const valueToStore = value instanceof Function ? value(prevStoredValue) : value;

        // Save state
        if (isEqual(prevStoredValue, valueToStore)) return prevStoredValue;

        try {
          // Save to localStorage
          localStorage.setItem(key, valueToStore);
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }

        return valueToStore;
      });
    },
    [key]
  );

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    }

    // Listen for storage events
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  return useMemo(() => [storedValue, setValue] as const, [storedValue, setValue]);
}
