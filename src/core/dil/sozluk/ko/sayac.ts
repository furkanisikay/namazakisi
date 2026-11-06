import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: '예배 카운트다운',
    kanalAciklama: '예배 시간이 끝나기 전 카운트다운 알림',
    baslik: '⏱️ {ad} 예배',
    govde: '{ad} 예배 시간이 곧 끝납니다.',
  },
  canli: {
    vakitGovde: '{ad} 예배 시간 종료까지 남은 시간',
    cumaBaslik: '🕌 금요예배',
    cumaGovde: '정오 예배(설교)까지 남은 시간',
    nafileGovde: '{ad} 예배 시간 종료까지 남은 시간',
  },
  iftar: {
    kanal: '이프타르 카운트다운',
    kanalAciklama: '이프타르 시간까지의 카운트다운 알림',
    baslik: '🌙 이프타르 카운트다운',
    govde: '아잔을 듣기 전에는 단식을 깨지 마세요.',
    girdiBaslik: '🌙 이프타르 시간입니다',
    girdiGovde: '복된 이프타르 되세요.',
    girdiUzun: '복된 이프타르 되세요.\n\n⚠️ 아잔을 듣기 전에는 단식을 깨지 마세요. 두아(기도)할 때 저희도 기억해 주세요.',
  },
  sahur: {
    kanal: '수후르 카운트다운',
    kanalAciklama: '수후르가 끝나는 시간(새벽 예배)까지의 카운트다운 알림',
    baslik: '🌙 수후르 카운트다운',
    govde: '아직 먹고 마실 수 있습니다. 곧 단식이 시작됩니다.',
    girdiBaslik: '🌙 수후르 시간이 끝났습니다',
    girdiGovde: '단식 의도(니야)를 하실 때입니다.',
    girdiUzun: '새벽 예배 시간이 되었습니다. 단식 의도(니야)를 잊지 마세요.\n\n⚠️ 이제 새벽 예배를 드릴 수 있습니다. 두아(기도)할 때 저희도 기억해 주세요.',
  },
  seri: {
    kanal: '연속 기록 카운트다운',
    kanalAciklama: '연속 기록 하루가 끝날 때까지의 카운트다운',
    baslik: '🔥 연속 기록이 끊길 수 있습니다',
    govde: '오늘의 예배를 아직 다 드리지 않았습니다. 연속 기록을 지키세요.',
    girdiBaslik: '🔥 연속 기록 하루가 끝났습니다',
    girdiGovde: '새로운 하루가 시작되었습니다.',
  },
};
