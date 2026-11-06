import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri 연속 기록; "Allah daim etsin" 하나님께서 꾸준하게 해 주시길. Övgü ve "!" yok. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: '연속 기록이 이어지고 있습니다',
    enUzun: cogul({ other: '최장 연속 기록: {n}일' }),
    gunBuyuk: cogul({ other: '일' }),
    sonrakiHedef: '다음 목표: {hedef}일({durum})',
    kalanGun: cogul({ other: '{n}일 남음' }),
    tamamlandi: '완료',
    paylasErisim: '진행 상황 공유',
    paylasBuyuk: '진행 상황 공유',
  },

  hedefler: {
    ilk_adim: { ad: '첫 주', aciklama: '7일 동안 빠짐없이 예배 드리기', cumle: '첫 주' },
    aliskanlik_ustasi: { ad: '습관의 달인', aciklama: '21일 - 습관이 자리 잡는 기간', cumle: '습관의 달인' },
    kararlilik: { ad: '굳건함', aciklama: '60일 동안 빠짐없이', cumle: '굳건함' },
    efsane: { ad: '전설', aciklama: '90일 - 남다른 인내', cumle: '전설' },
  },

  /** Klasik mertebe adları, harf çevirisiyle (çevrilmez). */
  seviyeler: ['무브타디', '탈리브', '살리크', '무리드', '아리프', '하피즈', '카밀'],

  rozetler: {
    ilk_adim: { ad: '첫걸음', aciklama: '첫 주를 마쳤습니다.', kosul: '7일 연속 기록' },
    aliskanlik_ustasi: {
      ad: '습관의 달인',
      aciklama: '21일 - 습관이 자리 잡는 기간을 마쳤습니다.',
      kosul: '21일 연속 기록',
    },
    kararlilik: { ad: '굳건함', aciklama: '60일 동안 빠짐없이 예배를 드렸습니다.', kosul: '60일 연속 기록' },
    efsane: { ad: '전설', aciklama: '90일 - 남다른 인내를 보였습니다.', kosul: '90일 연속 기록' },
    toparlanma_ustasi: {
      ad: '회복의 달인',
      aciklama: '회복 모드를 3번 마쳤습니다.',
      kosul: '회복 3번',
    },
    mukemmeliyetci: { ad: '완벽주의자', aciklama: '30일 동안 5/5 예배를 드렸습니다.', kosul: '5/5 예배 30일' },
    yuz_namaz: { ad: '예배 100번', aciklama: '모두 합쳐 예배를 100번 드렸습니다.', kosul: '예배 100번 드리기' },
    bin_namaz: { ad: '예배 1000번', aciklama: '모두 합쳐 예배를 1000번 드렸습니다.', kosul: '예배 1000번 드리기' },
  },

  rozetSeviyeleri: { bronz: '브론즈', gumus: '실버', altin: '골드', elmas: '다이아몬드' },

  gunBitis: {
    erken: '일찍 자는 경우',
    varsayilan: '기본 - 대부분의 지역에서 새벽 예배 전',
    gec: '늦게 자는 경우',
  },

  kutlama: {
    rozetEklendi: '🏅 배지 모음에 추가되었습니다',
    paylasin: '공유',
    rozetBaslik: '하나님께서 꾸준하게 해 주시길',
    rozetMesaj: '"{ad}" 배지를 얻었습니다.',
    hedefBaslik: cogul({ other: '{n}일' }),
    hedefMesaj: '"{ad}" 목표를 마쳤습니다. 하나님께서 꾸준하게 해 주시길.',
    yeniRank: '새 레벨: {rank}',
    seviyeBaslik: '새 레벨',
    seviyeMesaj: '이제 "{rank}" 레벨로 이어 갑니다. 하나님께서 꾸준하게 해 주시길.',
    toparlanmaBaslik: '연속 기록이 돌아왔습니다',
    toparlanmaMesaj: cogul({
      other: '{n}일 연속 기록이 멈춘 곳에서 이어집니다. 하나님께서 굳건함을 주시길.',
    }),
    enUzunBaslik: '최장 연속 기록',
    enUzunMesaj: cogul({
      other: '{n}일: 지금까지의 최장 연속 기록입니다. 하나님께서 꾸준하게 해 주시길.',
    }),
  },

  sekme: {
    hataOkunamadi: '지금은 지난 기록을 읽을 수 없습니다.',
    yenidenErisim: '연속 기록 데이터 다시 불러오기',
    yenidenDeneyin: '다시 시도',
    yukleniyor: '연속 기록 데이터를 불러오는 중...',
    gunlukSeri: '일 연속',
    rekor: '최고 기록',
    sozErisim: '{metin} 출처: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: '다음 목표',
    tumu: '모든 배지를 얻었습니다',
    kalan: cogul({ other: '{ad} 배지: {n}일 남음' }),
    tumuErisim: '모든 배지를 얻었습니다. 타스비흐가 가득 찼습니다.',
    erisim: '{ad} 배지: {hedef}일 중 {n}일 완료.',
  },

  gok: {
    gunHarfleri: ['월', '화', '수', '목', '금', '토', '일'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ other: '목표를 달성한 날 {n}일' }),
    besVakit: cogul({ other: '다섯 번의 예배를 모두 드린 날 {n}일' }),
    dondurulmus: cogul({ other: '동결된 날 {n}일' }),
    mevcutSeri: cogul({ other: '현재 연속 기록: {n}일.' }),
  },

  hedefAyar: {
    azalt: '줄이기',
    deger: '값',
    artir: '늘리기',
    esik: cogul({ other: '예배 {n}번' }),
    sifirlaBaslik: '연속 기록 초기화',
    sifirlaMesaj: '모든 연속 기록 데이터(연속 기록, 배지, 점수)가 초기화됩니다. 되돌릴 수 없습니다. 계속할까요?',
    sifirla: '초기화',
    iptal: '취소',
    basarili: '완료',
    sifirlandi: '연속 기록 데이터를 초기화했습니다.',
    hedefAyarlari: '목표 설정',
    tamGunEsigi: '하루 완료 기준',
    tamGunAciklama: '그날이 연속 기록에 포함되려면 하루에 드려야 하는 최소 예배 수를 정합니다',
    sifirlama: '초기화',
    verileriSifirla: '연속 기록 데이터 초기화',
    verileriSifirlaAlt: '모든 연속 기록, 배지, 점수 데이터를 삭제합니다',
  },

  rozetKarti: {
    erisim: '{ad} 배지, {durum}',
    kazanildi: '획득함',
    kilitli: '잠김',
  },

  toparlanma: {
    kartBaslik: '회복 모드',
    kartAltBaslik: '연속 기록을 되찾을 수 있습니다',
    kartMesaj: '{vurgu} 연속 기록을 멈춘 곳에서 이어 갈 수 있습니다.',
    oncekiGun: cogul({ other: '{n}일' }),
    ilerleme: '{hedef}일 중 {tamam}일 완료',
    kalan: cogul({
      other: '앞으로 {n}일 더 다섯 번의 예배를 모두 드리면 연속 기록이 멈춘 곳에서 이어집니다.',
    }),
    bugun: '오늘을 마치면 연속 기록이 멈춘 곳에서 이어집니다.',
    uyari: '날짜가 이어져야 합니다. 중간에 하루라도 빠지면 회복이 처음부터 다시 시작됩니다.',
    kapatErisim: '회복 세부 정보 닫기',
    anladim: '확인',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: '진행 상황 공유',
    hazirDegilBaslik: '이미지가 준비되지 않았습니다',
    hazirDegilMesaj: '이미지가 아직 준비되지 않았습니다. 몇 초 뒤에 다시 시도하세요.',
    olusturulamadiBaslik: '이미지를 만들 수 없습니다',
    olusturulamadiMesaj: '이미지를 만드는 중 문제가 발생했습니다. 다시 시도하세요.',
    kullanilamiyorBaslik: '공유할 수 없음',
    kullanilamiyorMesaj: '이 기기에서는 공유할 수 없습니다.',
    kapat: '닫기',
    hikaye: '스토리에 추가',
    platformlar: 'Instagram, WhatsApp 등에서 공유할 수 있습니다.',
    tamam: '확인',
    seriEnUzun: cogul({ other: '나의 최장 연속 기록: {n}일' }),
    seriZincir: cogul({ other: '일 동안 끊기지 않은 기록' }),
    seriSoz: '"매일의 작은 걸음, 마음의 큰 평안. 🔥"',
    rozetYeni: '새 배지를 얻었습니다',
    rozetSozleri: [
      '오늘 나를 위해 좋은 걸음을 내디뎠습니다 🌟',
      '굳은 마음으로 계속 갑니다. 이 배지는 내 것입니다 💪',
      '아침의 축복을 누렸습니다 🌅',
      '마음을 편하게 해 주는 이 흐름에 함께하고 있습니다 ✨',
      '작은 걸음이 큰 평안을 가져옵니다. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: '새 배지를 얻었습니다',
      hedef_tamamlandi: '목표에 도달했습니다',
      seviye_atlandi: '레벨이 올랐습니다',
      toparlanma_tamamlandi: '다시 제자리로',
      en_uzun_seri: '새 기록',
      varsayilan: '달성',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['주님께서 꾸준하게 해 주시길. 🤲', '작은 걸음이 큰 평안을 가져옵니다. 🍃', '하나님께서 우리 모두에게 굳건함을 주시길. 🌱'],
      hedef_tamamlandi: ['작은 걸음이 큰 평안을 가져옵니다. 🍃', '하나님께서 꾸준하게 해 주시길. 🤲', '매일 한 걸음 더. 🌱'],
      seviye_atlandi: [
        '매일 조금 더, 하나님께서 쉽게 해 주시길. 🍃',
        '하나님께서 꾸준하게 해 주시길. 🤲',
        '여정은 계속됩니다. 🌱',
      ],
      toparlanma_tamamlandi: [
        '중요한 것은 넘어지지 않는 것이 아니라 다시 일어서는 것입니다. 🔄',
        '하나님께서 굳건함을 주시길. 🤲',
        '모든 길은 인내로 걷습니다. 🌱',
      ],
      en_uzun_seri: [
        '매일의 작은 걸음, 마음의 큰 평안. 🍃',
        '하나님께서 꾸준하게 해 주시길. 🤲',
        '주님께서 우리 모두에게 굳건함을 주시길. 🌱',
      ],
    },
  },
};
