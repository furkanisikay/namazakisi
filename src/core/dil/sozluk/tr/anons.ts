import { cogul } from '../../tipler';

/**
 * Sesli okuma (TTS) metinleri. Motor etkin dilde konuşur (`DilServisi > anonsDiliniBildir`).
 * Hazır şablonlar kullanıcı kaydına YAZILI durur → Türkçe değerler BİREBİR korunur; çözüm
 * anında bilinen bir şablon etkin dilin aynı sıradaki şablonuna çevrilir
 * (`anonsSablonlari.ts > sablonuYerellestir`). Yer tutucu jetonları (`{vakit}`, `{süre}`,
 * `{yön}`) her dilde AYNIDIR.
 */
export const anons = {
  yon: { cikisaDogru: 'kaldı', girisindenItibaren: 'geçti' },
  cip: { vakit: 'Vakit adı', sure: 'Dakika', yon: 'kaldı / geçti', cuma: 'Cuma', yatsi: 'Yatsı' },
  sablon: {
    muhafizCikis: [
      '{vakit} vakti çıkıyor, son {süre} dakika.',
      '{vakit} namazını kaçırma, {süre} dakika kaldı.',
      'Vakit daralıyor, {vakit} namazına {süre} dakika.',
    ],
    muhafizGiris: [
      '{vakit} vakti girdi, {süre} dakika geçti.',
      '{vakit} namazını geciktirme, üzerinden {süre} dakika geçti.',
      'Vakit ilerliyor, {vakit} namazına dur, {süre} dakika oldu.',
    ],
    nafile: [
      '{vakit} vakti, {süre} dakika {yön}. İki rekât için güzel bir an.',
      '{vakit} vakti sürüyor. İki rekât kılmak için güzel bir fırsat.',
      '{vakit} için {süre} dakika {yön}.',
    ],
    cuma: [
      'Cuma namazına {süre} dakika kaldı. Hazırlan, camiye yola çık.',
      'Cuma vakti yaklaşıyor, {süre} dakika kaldı.',
      'Hutbeye yetiş, cumaya {süre} dakika kaldı.',
    ],
    camiyeGit: [
      '{vakit} vaktine {süre} dakika kaldı. Camiye yola çık.',
      'Camiye gitme zamanı, {vakit} vaktine {süre} dakika var.',
      '{vakit} namazı için camiye yola çık.',
    ],
    yatis: ['Yatmadan önce yatsıyı kıl.', 'Yatsı vakti sürüyor, uyumadan önce namaza dur.', 'Yatsıyı kılmadan uyuma.'],
    takvim: [
      'Takviminizdeki bir etkinlik {vakit} vaktine denk geliyor.',
      '{vakit} vakti bir etkinlikle çakışıyor; önce kılmayı unutmayın.',
      '{süre} dakika sonra {vakit} vakti etkinliğinizle çakışıyor; namazı unutmayın.',
    ],
  },
  /** Yüzeylerin OTOMATİK (boş metin) cümleleri. */
  otomatik: {
    cuma: 'Cuma için öğle vaktine {sure} kaldı. Hazırlan, camiye yola çık.',
    camiyeGiris: '{vakit} vaktine {sure} kaldı.',
    camiyeHazirlan: 'Hazırlan, camiye yola çık.',
    camiyeYola: 'Camiye yola çık.',
    takvimGiris: 'Takviminizdeki bir etkinlik {vakit} vaktine denk geliyor.',
    takvimOnce: 'Etkinlikten önce kılmayı unutmayın.',
    takvimKaplar: 'Ara verip kılmayı unutmayın.',
    yatsi: 'Yatmadan önce yatsıyı kıl.',
    muhasebeTek: 'Bugün {vakit} vakti işaretlenmemiş görünüyor.',
    muhasebeCoklu: cogul({ one: 'Bugün {n} vakit işaretlenmemiş görünüyor.', other: 'Bugün {n} vakit işaretlenmemiş görünüyor.' }),
    geceCapasi: 'Gece sessizliğine {süre} dakika var. Yatmadan {vakit} namazını kıl.',
    kuslukSuruyor: 'Kuşluk vakti sürüyor.',
    kuslukGirdi: 'Kuşluk vakti girdi. İki rekât için güzel bir an.',
    kuslukBitiyor: cogul({ one: 'Kuşluk vaktinin bitmesine {n} dakika var.', other: 'Kuşluk vaktinin bitmesine {n} dakika var.' }),
    evvabinSuruyor: 'Evvâbîn için vakit sürüyor.',
    evvabinGirdi: 'Evvâbîn vakti. İki rekât için güzel bir an.',
    evvabinKalan: cogul({ one: 'Evvâbîn için {n} dakika var.', other: 'Evvâbîn için {n} dakika var.' }),
    teheccudSonUcte: 'Teheccüd vakti. Gecenin son üçte biri girdi.',
    teheccudKalan: cogul({ one: 'Teheccüd vakti. İmsaka {n} dakika kaldı.', other: 'Teheccüd vakti. İmsaka {n} dakika kaldı.' }),
  },
} as const;
