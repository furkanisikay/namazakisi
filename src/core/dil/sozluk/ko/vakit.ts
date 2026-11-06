import type { Sozluk } from '../tr';

/**
 * Korece vakit adları Kore Müslüman Federasyonu (KMF, 한국이슬람교중앙회) resmî vakit tablosundaki
 * Korece adlardır: 새벽 · 일출 · 정오 · 오후 · 저녁 · 밤 (cümle içinde "새벽 예배" gibi). Hangılda
 * büyük/küçük harf yok: `buyuk` ve `kucuk` `adlar` ile aynıdır. Namaz 예배; cuma KMF'nin
 * "금요합동예배"ından kısaltılmış 금요예배. Teheccüd için 밤예배 KULLANILMAZ (KMF'de yatsıdır).
 * Ad yer tutucusundan (`{vakit}`, `{ad}`) sonra sese bağlı ek (을/를, 이/가, 은/는) gelmez: araya
 * sabit ad girer ("{vakit} 예배를").
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: '새벽', gunes: '일출', ogle: '정오', ikindi: '오후', aksam: '저녁', yatsi: '밤' },
  buyuk: { imsak: '새벽', gunes: '일출', ogle: '정오', ikindi: '오후', aksam: '저녁', yatsi: '밤' },
  kucuk: { imsak: '새벽', gunes: '일출', ogle: '정오', ikindi: '오후', aksam: '저녁', yatsi: '밤' },
  imsakVakti: '새벽',
  cuma: '금요예배',
  cumaKucuk: '금요예배',
  gunesDogusu: '일출',
  gunesDogusuKucuk: '일출',
  durum: { kilindi: '예배 완료', vaktiGeldi: '예배 시간', girmedi: '아직 시간 전', gecti: '예배 미완료' },
  durumKucuk: { kilindi: '예배 완료', vaktiGeldi: '예배 시간', girmedi: '아직 시간 전', gecti: '예배 미완료' },
  eylem: { kildim: '예배 드렸어요', kilindi: '예배 완료' },
  kerahatVakti: '예배를 삼가는 시간',
  isaretle: '예배 완료로 표시',
  geriAlEtiketi: '{durum}, 취소하려면 탭하세요',
  geriAlindi: '표시를 해제했습니다',
};
