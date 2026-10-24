/**
 * Ortak arayüz bileşenleri (sade tasarım, Dalga 1). Yeni ekran bu parçalarla kurulur;
 * mevcut ekranlar Dalga 2–4'te taşınır. Hareketler: `../hareket`.
 */
export { BolumBasligi } from './BolumBasligi';
export { NotSatiri, type NotTipi } from './NotSatiri';
export { IkonCipi, type IkonCipiBoyutu } from './IkonCipi';
export { AnahtarSatiri } from './AnahtarSatiri';
export { SecenekListesi, type Secenek } from './SecenekListesi';
export { DurumSatiri, type CihazdaYok, type DurumSatiriDurumu } from './DurumSatiri';
export { useIzinAkisi, sonucCoz, MODAL_KAPANIS_BEKLEMESI_MS, type IzinAkisi, type IzinSonucu } from './useIzinAkisi';
export { RizaModali, RIZA_AZAMI_MADDE, type RizaMaddesi } from './RizaModali';
export { DurumRozeti } from './DurumRozeti';
export { GeriAlBandiKatmani, geriAlBandiGoster, geriAlBandiniKapat, GERI_AL_SURESI_MS, type GeriAlIstegi, type GeriAlBandiKatmaniProps } from './GeriAlBandi';
export { KaydedildiIsareti, useKaydedildi, kaydedildiMetni } from './Kaydedildi';
export { BosDurum, Yukleniyor } from './BosDurum';
