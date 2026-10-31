import type { Sozluk } from '../tr';

/** Kıble 예배 방향 (KMF vakit sayfası ve meal 2:142–144), Kâbe 카으바 (meal 5:97). */
export const kible: Sozluk['kible'] = {
  baslik: '예배 방향',
  yon: {
    hizali: '예배 방향을 바라보고 있습니다',
    arkada: '예배 방향이 뒤쪽에 있습니다. 뒤로 돌아서세요',
    sagda: '예배 방향이 오른쪽으로 {derece}° 있습니다',
    solda: '예배 방향이 왼쪽으로 {derece}° 있습니다',
  },
  harf: { kuzey: '북', dogu: '동', guney: '남', bati: '서' },
  sekme: {
    pusula: '나침반',
    pusulaErisim: '나침반 모드',
    pusulaAciklama: '카으바 표시가 위쪽 홈에 닿으면 예배 방향을 바라보고 있는 것입니다.',
    kamera: '카메라',
    kameraErisim: '카메라 모드',
    kameraAciklama: '휴대전화를 세워서 드세요. 예배 방향에 카으바 표시가 나타납니다.',
  },
  sayfa: {
    baslatiliyor: '나침반을 시작하는 중…',
    izinKapali: '위치 권한이 꺼져 있습니다. 방향을 찾으려면 위치가 필요합니다.',
  },
  hata: {
    izinGerekli: '예배 방향을 찾으려면 위치 권한이 필요합니다.',
    konumServisi: '위치 서비스에 연결할 수 없습니다. 기기의 위치 설정을 확인하세요.',
    baslatilamadi: '예배 방향 서비스를 시작할 수 없습니다.',
  },
  pusula: {
    ufuk: '지평선',
    konumAliniyor: '위치를 가져오는 중…',
    hazirlaniyor: '나침반을 준비하는 중…',
    kuzeydenAci: '예배 방향은 북쪽에서 {derece}°입니다',
    kabeUzakta: '카으바까지 {mesafe}',
    kuzeydenSaatYonu: '북쪽에서 시계 방향',
    kuzeyden: '북쪽에서 {derece}°',
    kabeUzaktaKuzeyden: '카으바까지 {mesafe}, 북쪽에서 {derece}°',
    pusulaErisim: '예배 방향 나침반. {cumle}',
    pusulaYok: '이 기기에는 나침반이 없습니다. 북쪽을 기준으로 방향을 보여 드립니다.',
    kayiyorsa: '방향이 어긋나면 휴대전화를 공중에서 8자로 움직이세요.',
    kamerayla: '카메라로 보기',
  },
  kamera: {
    pusulayiKullanin: '나침반 사용',
    kullanilamiyorBaslik: '이 휴대전화에서는 카메라 보기를 사용할 수 없습니다',
    kullanilamiyorMetin:
      '휴대전화를 세워서 들면 센서가 믿을 만한 방향을 주지 않습니다. 나침반은 여전히 방향을 올바르게 보여 줍니다.',
    izinBaslik: '카메라로 예배 방향 보기',
    izinMetin:
      '휴대전화를 세워서 들고 주위를 둘러보세요. 예배 방향에 카으바 표시가 나타납니다. 카메라 권한이 필요하며, 화면은 녹화되지 않고 휴대전화 밖으로 나가지 않습니다.',
    kamerayiAcin: '카메라 켜기',
    izinKapaliBaslik: '카메라 권한이 꺼져 있습니다',
    izinKapaliMetin: '카메라 보기를 쓰려면 설정에서 카메라 접근을 허용할 수 있습니다. 나침반은 권한 없이도 작동합니다.',
    ayarlariAcin: '설정 열기',
    acilamadiBaslik: '카메라를 열 수 없습니다',
    acilamadiMetin: '지금은 카메라를 사용할 수 없습니다. 나침반으로 예배 방향을 찾을 수 있습니다.',
    hesaplaniyor: '방향을 찾는 중…',
    dikTutun: '휴대전화를 세워서 드세요',
  },
  kalibrasyon: {
    tesekkurErisim: '감사합니다. 이제 방향이 더 정확합니다',
    tesekkur: '감사합니다. 이제 방향이 더 정확합니다 ✓',
    baslik: '나침반 보정',
    sallayin: '휴대전화를 공중에서 8자로 움직이세요.',
    metal: '금속 물체와 자석 케이스에서 멀리하세요.',
    dogruluk: '정확도',
    simdiDegil: '나중에',
  },
};
