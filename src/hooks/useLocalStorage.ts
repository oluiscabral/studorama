import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { localStorage } from "../core/services";

/**
 * Custom hook for using localStorage with React state
 * Optimized for performance with large datasets
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Use ref to track if we're initializing to prevent unnecessary re-renders
  const isInitializing = useRef(true);
  const lastValueRef = useRef<T>();

  // Get stored value or initialize with provided default
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem<T>(key, initialValue);
      lastValueRef.current = item;
      return item;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    } finally {
      isInitializing.current = false;
    }
  });

  // Function to update both state and localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function for previous state pattern
        const valueToStore = value instanceof Function ? value(lastValueRef.current || storedValue) : value;

        // Only update if value actually changed (deep comparison for objects)
        if (JSON.stringify(lastValueRef.current) === JSON.stringify(valueToStore)) {
          return;
        }

        // Update refs first
        lastValueRef.current = valueToStore;

        // Update state
        setStoredValue(valueToStore);

        // Save to localStorage asynchronously to avoid blocking
        requestIdleCallback(() => {
          try {
            localStorage.setItem(key, valueToStore);
          } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
          }
        });
      } catch (error) {
        console.error(`Error processing localStorage update for key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          // Only update if different from current value
          if (JSON.stringify(lastValueRef.current) !== JSON.stringify(newValue)) {
            lastValueRef.current = newValue;
            setStoredValue(newValue);
          }
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    }

    // Only add listener after initial load to avoid unnecessary work
    if (!isInitializing.current) {
      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [key]);

  return useMemo(() => [storedValue, setValue] as const, [storedValue, setValue]);
}