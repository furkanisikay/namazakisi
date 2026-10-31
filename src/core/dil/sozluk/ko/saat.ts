import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: '휴대전화에서',
    telefonAciklama: '새벽 예배 알람과 타하주드 깨우기가 휴대전화에서 울립니다.',
    saatBaslik: '시계에서 조용히',
    saatAciklama:
      '손목만 진동하므로 옆에서 자는 사람을 깨우지 않습니다. 시계에서 끄지 않으면 {dk}분 뒤에 휴대전화가 대신 울립니다. 시계에 Namaz Akışı가 없거나 최신 버전이 아니면 매일 아침 휴대전화가 {dk}분 늦게 울립니다.',
    saatAciklamaIos:
      '손목만 진동하므로 옆에서 자는 사람을 깨우지 않습니다. 시계에서 끄지 않으면 {dk}분 뒤에 iPhone이 대신 울립니다.',
    ikisiBaslik: '둘 다에서',
    ikisiAciklama: '시계와 휴대전화가 함께 울리며, 시계에서 끄면 휴대전화도 조용해집니다.',
    ikisiAciklamaIos: '시계와 iPhone이 함께 울리며, 시계에서 끄면 iPhone도 조용해집니다.',
  },
  anons: {
    otomatikBaslik: '휴대전화에서, 휴대전화가 멀리 있으면 시계에서',
    otomatikAciklama:
      '휴대전화가 가까이 있으면 휴대전화가 소리 내어 읽고 시계는 일부러 조용히 있습니다(두 기기가 같은 문장을 읽지 않도록). 휴대전화가 멀리 있으면 시계가 소리 내어 읽습니다.',
    saatBaslik: '시계에서만',
    saatAciklama:
      '항상 시계가 소리 내어 읽고 휴대전화는 조용히 있습니다. 시계가 충전 중이거나 휴대전화에 연결되어 있지 않거나 Namaz Akışı가 없으면 아무것도 읽지 않습니다. 이것이 싫다면 첫 번째 옵션을 사용하세요.',
    telefonBaslik: '휴대전화에서만',
    telefonAciklama: '시계는 소리를 내지 않습니다.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Apple Watch에 Namaz Akışı가 설치되어 있으면 iPhone과 일을 나눠 맡습니다. 여기에서 깨우기가 울릴 곳을 선택합니다.',
    giris:
      '시계에 Namaz Akışı가 설치되어 있으면 휴대전화와 일을 나눠 맡습니다. 여기에서 깨우기가 울릴 곳과 알림을 소리 내어 읽을 곳을 선택합니다.',
    uyandirmaBaslik: '깨우기는 어디에서 울릴까요?',
    uyandirmaNotu:
      '깨우기는 "시간 종료 전" 알림에서 새벽 예배용으로 켜는 실제 알람과, 임의예배에서 켜는 타하주드 깨우기입니다.',
    uyandirmaNotuIos:
      'watchOS는 시계 앱이 열려 있을 때만 무음 알람을 설정할 수 있습니다. 하루에 한 번 시계에서 Namaz Akışı를 열면 그때 다음 깨우기가 설정됩니다. 시계가 충전 중이거나 앱을 열지 않았다면 iPhone의 대체 알람이 울립니다.',
    uyandirmaNotuAndroid: '시계는 충전 중에는 울리지 않으며, 대신 휴대전화가 울립니다.',
    muhafizAyarlari: '"시간 종료 전" 설정 열기',
    nafileAyarlari: '임의예배 설정 열기',
    bilektenBaslik: '손목에서 할 수 있는 일',
    bilektenIos: [
      'iPhone이 멀리 있으면 알림이 시계에서 울리며, 둘 다에서 울리지는 않습니다.',
      '드린 예배를 손목에서 표시하면 iPhone에 기록됩니다.',
      'Digital Crown으로 타스비흐를 세고, 시계에서 예배 방향을 찾습니다.',
    ],
    anonsBaslik: '소리 내어 읽기는 어디에서 할까요?',
    anonsNotu:
      '소리 내어 읽기가 켜진 알림만 읽습니다. 두 기기가 같은 문장을 함께 읽지 않습니다. 성원에 있거나 예배 모드가 켜져 있을 때도 시계는 조용히 있습니다. 시계에 스피커나 음성 합성 엔진, 앱 언어의 음성이 없으면 진동만 합니다. Namaz Akışı 시계 앱의 "소리 테스트"로 시계 소리를 바로 확인할 수 있습니다.',
    bilekten: [
      '시계의 버튼으로 예배 모드를 켜고 끌 수 있습니다(예배 시간이 끝날 때까지, 최대 30분).',
      '성원에서는 시계에 상태가 표시되며, "성원이 아닙니다"와 "성원에 있나요?"에 손목에서 답할 수 있습니다.',
      '시계에 맞지 않는 화면(보충 예배 기록, 성원에 있어요, 설정)은 "휴대전화에서 열기"로 휴대전화에서 열립니다.',
    ],
    namazModuNotu: '시계에서 예배 모드를 켜려면 먼저 휴대전화에서 한 번 켜세요.',
    namazModuAyarlari: '예배 모드 설정 열기',
  },
  sayfa: {
    akilliSaat: '스마트워치',
    appleWatchOzet: '깨우기가 울리는 곳',
    saatOzet: '깨우기가 울리고 소리 내어 읽는 곳',
    canliEtkinlikler: '실시간 현황',
    canliSayaclar: '실시간 카운트다운',
    geriSayim: '카운트다운',
    gelismisErisim: '고급. 자동화와 예배 드렸어요를 표시하는 앱',
    gelismis: '고급',
    otomasyonlar: '자동화',
    otomasyonBaslik: '자동화와 함께 사용',
    otomasyonOzet: '삼성 모드 및 루틴, Tasker, MacroDroid',
    kildimBaslik: '예배 드렸어요를 표시하는 앱',
    kildimOzet: '허용한 앱',
  },
};
