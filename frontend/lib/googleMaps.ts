// Shared Google Maps loader to prevent multiple script loads
let mapsLoaded = false;
let mapsLoading = false;
const loadCallbacks: Array<() => void> = [];

export const loadGoogleMaps = (callback: () => void): void => {
  if (typeof window === 'undefined') return;

  if (window.google && window.google.maps) {
    callback();
    return;
  }

  if (mapsLoaded) {
    callback();
    return;
  }

  loadCallbacks.push(callback);

  if (mapsLoading) {
    return;
  }

  mapsLoading = true;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDQtLAhMnixQ_SX3PC0xYLRfn2Ues_JKOE&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    mapsLoaded = true;
    mapsLoading = false;
    loadCallbacks.forEach((cb) => cb());
    loadCallbacks.length = 0;
  };
  script.onerror = () => {
    mapsLoading = false;
    console.error('Failed to load Google Maps');
  };
  document.head.appendChild(script);
};

