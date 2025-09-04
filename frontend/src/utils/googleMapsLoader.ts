// Create this file: frontend/src/utils/googleMapsLoader.ts

let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMapsAPI = (): Promise<void> => {
  // If already loaded, resolve immediately
  if (isLoaded && window.google && window.google.maps) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (loadPromise) {
    return loadPromise;
  }

  isLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;

    // Use the environment variable properly
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      reject(new Error('Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.'));
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = () => {
      isLoading = false;
      loadPromise = null;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};
