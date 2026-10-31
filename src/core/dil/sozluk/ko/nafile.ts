import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Nafile 임의예배 (KMF "임의예배(순나)"). Kuşluk, evvâbîn ve teheccüd için Korece kaynakta
 * yerleşik ad bulunamadı: Arapçadan harf çevirisi (두하, 아우와빈, 타하주드), DOĞRULANMADI.
 * Teheccüd için 밤예배 YAZILMAZ (KMF'de yatsıdır). Rekât 라크아 (KMF).
 */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: '두하', evvabin: '아우와빈', teheccud: '타하주드' },
  kucuk: { kusluk: '두하', evvabin: '아우와빈', teheccud: '타하주드' },
  aciklamalar: {
    kusluk:
      '일출 약 45분 뒤에 시작해 정오 예배 10분 전까지 이어집니다. 가장 이른 때는 이슈라끄이고, 가장 좋은 때는 하루의 첫 4분의 1이 지난 뒤입니다.',
    evvabin: '저녁 예배 뒤부터 밤 예배 시간까지 드립니다.',
    teheccud: '밤 예배 뒤 잠들었다가 일어나 새벽 예배 시간까지 드립니다. 가장 좋은 때는 밤의 마지막 3분의 1입니다.',
  },
  bilgiBugun: '{aciklama}\n\n오늘: {bas} – {son}',
  enFaziletli: ' · {saat} 이후가 가장 좋은 때',
  sonUcteBir: ' · 밤의 마지막 3분의 1 {saat}',
  durumAktif: '시간이 되었습니다 · {saat}에 끝남',
  durumNafile: '임의예배 · {bas}–{son}',
  bildirim: {
    kuslukBaslik: '두하 예배 시간',
    kuslukSuruyor: '두하 예배 시간입니다. {son}까지 드릴 수 있습니다.',
    kuslukGirdi: '두하 예배 시간이 되었습니다. 2라크아를 드리기 좋은 때이며, {son}까지 이어집니다.',
    kuslukBitiyor: cogul({
      other: '두하 예배 시간이 {n}분 남았습니다. 2라크아를 드리기 좋은 때이며, {son}까지 이어집니다.',
    }),
    evvabinBaslik: '아우와빈 예배',
    evvabinSuruyor: '아직 아우와빈 예배를 드릴 시간이 있습니다. 밤 예배는 {son}에 시작합니다.',
    evvabinGirdi: '저녁 예배 뒤, 아우와빈 예배를 드리기 좋은 때입니다. 밤 예배는 {son}에 시작합니다.',
    evvabinKalan: cogul({ other: '아우와빈 예배 시간이 {n}분 남았습니다. 밤 예배는 {son}에 시작합니다.' }),
    teheccudBaslik: '타하주드 예배 시간',
    uyandirSonUcte: '일어나세요. 밤의 마지막 3분의 1이 시작되었습니다. 새벽 예배는 {son}에 시작합니다.',
    uyandirKalan: cogul({ other: '일어나세요. 새벽 예배까지 {n}분 남았습니다. 새벽 예배는 {son}에 시작합니다.' }),
    sonUcteBaslik: '밤의 마지막 3분의 1',
    sonUcteGovde: '타하주드 예배에 가장 복된 시간입니다. 새벽 예배는 {son}에 시작합니다.',
    teheccudKalan: cogul({ other: '새벽 예배까지 {n}분 남았습니다. 타하주드 예배를 드리기 좋은 때입니다.' }),
  },
  uyandirmaKanali: '타하주드 깨우기',
  uyandirmaKanaliAciklama: '타하주드 예배를 위해 깨워 줍니다. 무음 모드에서도 울립니다',
};
