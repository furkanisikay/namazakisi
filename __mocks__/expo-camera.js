/**
 * expo-camera native köprüdür (requireNativeModule) → jest'te yüklenemez.
 * Bileşen düz dizeye iner (nativewind/jest-hoist tuzağı: fabrikada createElement YOK).
 * İzin kancası testten `__izinAyarla` ile yönlendirilir.
 */
let izin = { granted: false, canAskAgain: true, status: 'undetermined' };
const istek = jest.fn(async () => izin);
module.exports = {
  CameraView: 'CameraView',
  useCameraPermissions: () => [izin, istek, jest.fn(async () => izin)],
  Camera: {
    getCameraPermissionsAsync: jest.fn(async () => izin),
    requestCameraPermissionsAsync: istek,
  },
  __izinAyarla: (yeni) => {
    izin = { ...izin, ...yeni };
  },
  __istek: istek,
};
