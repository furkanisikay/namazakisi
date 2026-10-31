import type { Sozluk } from '../tr';

/**
 * Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). Seferîlik 여행,
 * kasr "줄여서 드리기" (4:101 "예배를 줄여서 드린다면"), cem "합쳐서 드리기"; rekât 라크아 (KMF).
 */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: '하나피', safii: '샤피이' },
  kaynaklar: {
    vatan: '여행과 관련한 고향, 거주지, 임시 체류(튀르키예어)',
    cem: '예배를 합쳐서 드릴 수 있나요?(튀르키예어)',
    baslangic: '여행은 언제 시작되나요?(튀르키예어)',
    ziyaret: '부모님이 사는 도시를 방문하는 사람은 여행자인가요?(튀르키예어)',
  },
  bilgiNotu:
    '이것은 판결이 아니라 정보입니다. 여행자에 해당하는지는 여행의 목적과 기간, 그리고 의도에 따라 달라집니다.',
  baslik: '여행 중인 것 같습니다',
  mesafeSatiri: '거주지에서 직선거리로 약 {km}km 떨어져 있습니다. {mezhep} 학파에 대한 Diyanet의 안내:',
  maddeler: {
    hanefi: [
      '하나피 학파에서 여행 거리는 약 90km입니다. 목적지에서 15일 미만 머물 의도가 있는 사람은 여행자에 해당합니다.',
      '여행자는 4라크아 의무 예배를 2라크아로 줄여서 드립니다(카스르).',
      '하나피 학파에서 두 예배를 합쳐서 드리는 것(잠으)은 하지 중 아라파트와 무즈달리파에서만 허용됩니다. Diyanet의 안내에 따르면 여행처럼 큰 사정이 있을 때는 다른 학파의 견해를 따를 수도 있습니다.',
    ],
    safii: [
      '샤피이 학파에서도 여행 거리는 약 90km입니다. 도착일과 출발일을 빼고 목적지에 머무는 기간이 4일 미만이면 여행 규정이 계속 적용됩니다.',
      '여행자는 4라크아 의무 예배를 2라크아로 줄여서 드립니다(카스르).',
      '샤피이 학파에서 여행은 정오 예배와 오후 예배, 저녁 예배와 밤 예배를 합쳐서 드릴 수 있는(잠으) 정당한 사정입니다.',
    ],
  },
  ozetAcik: '켜짐 · {mezhep}',
  ozetKapali: '꺼짐',
  baglantiAcilamadi: '링크를 열 수 없습니다. 인터넷 연결을 확인하세요.',
  ikametGuncellendi: '거주지를 업데이트했습니다',
  ikametKaydedilemedi: '거주지를 저장할 수 없습니다',
  kartiKapatin: '여행 카드 닫기',
  burasiEvimErisim: '이곳이 집입니다. 거주지로 저장',
  burasiEvim: '이곳이 집입니다',
  diyanetteOkuyunErisim: '브라우저에서 Diyanet 파트와 읽기',
  diyanetteOkuyun: 'Diyanet에서 읽기',
  sayfa: {
    kayitliKonum: '저장된 위치',
    henuzKaydedilmedi: '아직 저장되지 않았습니다. 처음 정한 위치가 거주지로 간주됩니다',
    buradasiniz: '지금 이곳에 있습니다',
    uzaktasiniz: '지금 직선거리로 약 {km}km 떨어져 있습니다',
    konumBilinmiyor: '아직 위치를 알 수 없습니다. 먼저 위치를 선택하세요',
    giris:
      '거주지에서 약 {km}km 떨어지면 Diyanet 파트와를 요약한 짧은 정보 카드가 홈 화면에 나타납니다. 카드는 여행마다 한 번 나타나며 알림은 보내지 않습니다.',
    bilgiKarti: '정보 카드',
    kartBaslik: '여행 정보 카드',
    gosterilir: '홈 화면에 표시',
    gosterilmez: '표시 안 함',
    mezhepNotu: '카드는 선택한 학파를 따릅니다. 설정 › 예배 시간에서 선택할 수 있습니다.',
    ikametYeri: '거주지',
    ikametYapErisim: '현재 위치를 거주지로 저장',
    ikametYap: '현재 위치를 거주지로 설정',
    kaynaklar: '출처(Diyanet 종교최고위원회)',
    kaynakErisim: '{etiket}. 브라우저에서 열립니다',
    /** Türkçe dışında gösterilmez (yalnız Türkiye'deki hizmet). */
    fetvaHatti: '궁금한 점은 Diyanet의 190 파트와 상담 전화로 문의할 수 있습니다.',
  },
};
