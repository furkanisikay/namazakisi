import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: zamirsiz, kısa ‑세요 emri; "secdeye kapan" yok. Sıra Türkçe şablonlarla
 * BİREBİR eşleşir. Dakika sayıya bitişik yazılır ("{süre}분"; `dakikaUyumu` bitişik kalıbı tanır);
 * vakit adından sonra hep sabit "예배" gelir (ek ünlü uyumuna bağlı kalmasın).
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: '남음', girisindenItibaren: '지남' },
  cip: { vakit: '예배 이름', sure: '분', yon: '남음 / 지남', cuma: '금요예배', yatsi: '밤' },
  sablon: {
    muhafizCikis: [
      '{vakit} 예배 시간이 끝나 갑니다. {süre}분 남았습니다.',
      '{vakit} 예배를 놓치지 마세요. {süre}분 남았습니다.',
      '시간이 줄어들고 있습니다. {vakit} 예배 시간이 끝나기까지 {süre}분 남았습니다.',
    ],
    muhafizGiris: [
      '{vakit} 예배 시간이 시작되었습니다. {süre}분이 지났습니다.',
      '{vakit} 예배를 미루지 마세요. {süre}분이 지났습니다.',
      '시간이 흐르고 있습니다. {vakit} 예배를 드리세요. {süre}분이 지났습니다.',
    ],
    nafile: [
      '{vakit} 예배 시간, {süre}분 {yön}. 2라크아를 드리기 좋은 때입니다.',
      '{vakit} 예배 시간입니다. 2라크아를 드릴 좋은 기회입니다.',
      '{vakit} 예배, {süre}분 {yön}.',
    ],
    cuma: [
      '금요예배까지 {süre}분 남았습니다. 준비하고 성원으로 가세요.',
      '금요예배가 다가옵니다. {süre}분 남았습니다.',
      '설교에 늦지 마세요. 금요예배까지 {süre}분 남았습니다.',
    ],
    camiyeGit: [
      '{vakit} 예배까지 {süre}분 남았습니다. 성원으로 가세요.',
      '성원에 갈 시간입니다. {vakit} 예배까지 {süre}분 남았습니다.',
      '{vakit} 예배를 위해 성원으로 가세요.',
    ],
    yatis: ['잠자리에 들기 전에 밤 예배를 드리세요.', '아직 밤 예배 시간입니다. 잠들기 전에 예배하러 일어서세요.', '밤 예배를 드리기 전에는 잠들지 마세요.'],
    takvim: [
      '캘린더의 일정이 {vakit} 예배 시간과 겹칩니다.',
      '{vakit} 예배 시간이 일정과 겹칩니다. 먼저 예배드리는 것을 잊지 마세요.',
      '{süre}분 뒤 {vakit} 예배 시간이 일정과 겹칩니다. 예배를 잊지 마세요.',
    ],
  },
  otomatik: {
    cuma: '금요예배를 위한 정오 예배까지 {sure} 남았습니다. 준비하고 성원으로 가세요.',
    camiyeGiris: '{vakit} 예배까지 {sure} 남았습니다.',
    camiyeHazirlan: '준비하고 성원으로 가세요.',
    camiyeYola: '성원으로 가세요.',
    takvimGiris: '캘린더의 일정이 {vakit} 예배 시간과 겹칩니다.',
    takvimOnce: '일정 전에 예배드리는 것을 잊지 마세요.',
    takvimKaplar: '잠시 멈추고 예배드리는 것을 잊지 마세요.',
    yatsi: '잠자리에 들기 전에 밤 예배를 드리세요.',
    muhasebeTek: '오늘 {vakit} 예배가 표시되지 않은 것 같습니다.',
    muhasebeCoklu: cogul({ other: '오늘 예배 {n}번이 표시되지 않은 것 같습니다.' }),
    geceCapasi: '{süre}분 뒤 방해 금지 시간이 시작됩니다. 잠자리에 들기 전에 {vakit} 예배를 드리세요.',
    kuslukSuruyor: '두하 예배 시간입니다.',
    kuslukGirdi: '두하 예배 시간이 되었습니다. 2라크아를 드리기 좋은 때입니다.',
    kuslukBitiyor: cogul({ other: '두하 예배 시간이 {n}분 남았습니다.' }),
    evvabinSuruyor: '아직 아우와빈 예배를 드릴 시간이 있습니다.',
    evvabinGirdi: '아우와빈 예배 시간입니다. 2라크아를 드리기 좋은 때입니다.',
    evvabinKalan: cogul({ other: '아우와빈 예배 시간이 {n}분 남았습니다.' }),
    teheccudSonUcte: '타하주드 예배 시간입니다. 밤의 마지막 3분의 1이 시작되었습니다.',
    teheccudKalan: cogul({ other: '타하주드 예배 시간입니다. 새벽 예배까지 {n}분 남았습니다.' }),
  },
};
