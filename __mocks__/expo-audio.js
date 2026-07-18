/**
 * expo-audio mock'u.
 *
 * Gercek modul `expo-modules-core` uzerinden native `EventEmitter`e dokunur →
 * jest ortaminda YOKTUR ve import eden HER suite "Cannot read properties of
 * undefined (reading 'EventEmitter')" ile hic calismadan patlar (AGENTS.md
 * `requireNativeModule` tuzagi). Global moduleNameMapper ile burasi devreye
 * girer; boylece ses calan bir servisi DOLAYLI yukleyen testler de calisir.
 *
 * `createAudioPlayer` her cagrida yeni bir sahte calar dondurur; testler
 * `createAudioPlayer.mock.results` ile calari alip play/seekTo/release
 * cagrilarini dogrulayabilir.
 */
const sahteCalarOlustur = () => ({
  playing: false,
  volume: 1,
  play: jest.fn(function () {
    this.playing = true;
  }),
  pause: jest.fn(function () {
    this.playing = false;
  }),
  seekTo: jest.fn().mockResolvedValue(undefined),
  release: jest.fn(),
  remove: jest.fn(),
});

module.exports = {
  createAudioPlayer: jest.fn(() => sahteCalarOlustur()),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  useAudioPlayer: jest.fn(() => sahteCalarOlustur()),
  __sahteCalarOlustur: sahteCalarOlustur,
};
