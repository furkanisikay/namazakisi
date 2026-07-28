module.exports = {
  requestForegroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getBackgroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  startLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
  // Bolge (geofence) izleme: konum takibinin BIRINCIL yolu
  startGeofencingAsync: jest.fn(),
  stopGeofencingAsync: jest.fn(),
  hasStartedGeofencingAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
  ActivityType: {
    Other: 1,
    AutomotiveNavigation: 2,
    Fitness: 3,
    OtherNavigation: 4,
    Airborne: 5,
  },
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  // Gercek expo degerleriyle AYNI olmali: uretim `eventType !== Exit` ile eler,
  // sapan bir deger tum cikis olaylarini sessizce yok sayardi.
  LocationGeofencingEventType: {
    Enter: 1,
    Exit: 2,
  },
  LocationGeofencingRegionState: {
    Unknown: 0,
    Inside: 1,
    Outside: 2,
  },
};
