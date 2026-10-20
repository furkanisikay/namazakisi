/**
 * Paketlenmiş cami verisinin (`assets/camiler/tr.bin`) ham baytları — iOS DIŞI.
 *
 * Android'de veriyi native modül (`expo-cami-geofence`) APK asset'inden okur; JS'in
 * ayrıca okumasına gerek yoktur. iOS sürümü `camiVeriDosyasi.ios.ts`'tedir: Metro
 * platform uzantısını seçer, böylece 2,4 MB'lık dosya YALNIZ iOS paketine girer
 * (düz `Platform.OS` dalı `require`'ı Android paketine de koyardı).
 */
export async function camiVeriBaytlariniOku(): Promise<Uint8Array | null> {
    return null;
}
