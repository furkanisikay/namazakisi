/**
 * `@maplibre/maplibre-react-native` mock'u (Camideyim haritası, #297 Faz 2).
 *
 * Gerçek paket Fabric native bileşenleri (codegen) yükler; jest'te yoktur ve
 * içe aktaran her suite hiç çalışmadan patlar. Bileşenler DÜZ DİZE'dir
 * (AGENTS.md: mock fabrikasında React.createElement ÇAĞIRMA — nativewind):
 * react-test-renderer dizeyi host düğümü sayar, prop'ları test okuyabilir.
 *
 * `Map` ref'i yoktur; harita merkezi testte `onRegionDidChange` olayıyla verilir.
 */
module.exports = {
  Map: 'Map',
  Camera: 'Camera',
  GeoJSONSource: 'GeoJSONSource',
  Layer: 'Layer',
  Images: 'Images',
  Marker: 'Marker',
  UserLocation: 'UserLocation',
  NativeUserLocation: 'NativeUserLocation',
};
