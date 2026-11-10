import {
  ozelSesMi,
  sesKimliginiNormalize,
  sesHashi,
  muhafizKanalIdOlustur,
  muhafizKanaliMi,
  silinebilirMuhafizKanaliMi,
  secilmisSesMi,
  platformdaCalinirMi,
  sesGorunenAdi,
  sesPlatformunuAyarla,
  eklenmisSesleriAyarla,
  cihazdaCalinirMi,
} from '../sesKimligi';
import { VARSAYILAN_SES } from '../matrisTipleri';
import { alarmKanalIdOlustur } from '../alarmYuku';

const SES_A = 'content://media/internal/audio/media/42';
const SES_B = 'content://media/external/audio/media/1337';

describe('sesKimliginiNormalize', () => {
  it('ESKI PALET GOCU BEDAVA: can/melodi/alarm varsayilana duser', () => {
    // Uc id de gercekte AYNI dosyaya (bildirim.mp3) cozuluyordu → sifir regresyon.
    expect(sesKimliginiNormalize('can')).toBe(VARSAYILAN_SES);
    expect(sesKimliginiNormalize('melodi')).toBe(VARSAYILAN_SES);
    expect(sesKimliginiNormalize('alarm')).toBe(VARSAYILAN_SES);
  });

  it('bozuk/eksik degerler varsayilana duser (asla firlatmaz)', () => {
    expect(sesKimliginiNormalize(undefined)).toBe(VARSAYILAN_SES);
    expect(sesKimliginiNormalize(null)).toBe(VARSAYILAN_SES);
    expect(sesKimliginiNormalize('')).toBe(VARSAYILAN_SES);
    expect(sesKimliginiNormalize('   ')).toBe(VARSAYILAN_SES);
  });

  it('content:// URI oldugu gibi korunur', () => {
    expect(sesKimliginiNormalize(SES_A)).toBe(SES_A);
    expect(sesKimliginiNormalize(`  ${SES_A}  `)).toBe(SES_A);
  });
});

describe('ozelSesMi', () => {
  it('yalniz content:// semasi ozel sestir', () => {
    expect(ozelSesMi(SES_A)).toBe(true);
    expect(ozelSesMi(VARSAYILAN_SES)).toBe(false);
    expect(ozelSesMi(undefined)).toBe(false);
  });
});

describe('sesHashi', () => {
  it('kararlidir (ayni girdi -> ayni cikti)', () => {
    expect(sesHashi(SES_A)).toBe(sesHashi(SES_A));
  });

  it('her zaman 8 haneli hex uretir', () => {
    for (const girdi of [SES_A, SES_B, '', 'a', 'x'.repeat(500)]) {
      expect(sesHashi(girdi)).toMatch(/^[0-9a-f]{8}$/);
    }
  });

  it('farkli sesler farkli hash uretir', () => {
    expect(sesHashi(SES_A)).not.toBe(sesHashi(SES_B));
  });
});

describe('muhafizKanalIdOlustur', () => {
  it('VARSAYILAN ses TABAN kanallara esitlenir — mevcut kurulumlarla birebir uyum', () => {
    expect(muhafizKanalIdOlustur(VARSAYILAN_SES, false)).toBe('muhafiz');
    expect(muhafizKanalIdOlustur(VARSAYILAN_SES, true)).toBe('muhafiz_acil');
  });

  it('ESKI palet id de taban kanala duser (goc gerekmez)', () => {
    expect(muhafizKanalIdOlustur('can', false)).toBe('muhafiz');
    expect(muhafizKanalIdOlustur('alarm', true)).toBe('muhafiz_acil');
  });

  it('ozel ses hash ekli kanal uretir', () => {
    expect(muhafizKanalIdOlustur(SES_A, false)).toBe(`muhafiz_${sesHashi(SES_A)}`);
    expect(muhafizKanalIdOlustur(SES_A, true)).toBe(`muhafiz_acil_${sesHashi(SES_A)}`);
  });

  /**
   * MIMARININ TEMEL SOZU: kanal id SESIN fonksiyonudur.
   * Boylece "kanal sesi degistirilemez" ve "silinen kanal tombstone'dan eski
   * ayarlarla dirilir" tuzaklarinin ikisi de dogar dogmaz olur — ayni id'ye
   * farkli ses yazmaya HIC kalkismayiz.
   */
  it('ses degisirse kanal id de DEGISIR (tombstone tuzagi dogmaz)', () => {
    expect(muhafizKanalIdOlustur(SES_A, false)).not.toBe(muhafizKanalIdOlustur(SES_B, false));
  });

  it('KANAL ENFLASYONU YOK: ayni ses hep ayni kanali verir', () => {
    const kanallar = new Set([
      muhafizKanalIdOlustur(SES_A, false),
      muhafizKanalIdOlustur(SES_A, false),
      muhafizKanalIdOlustur(SES_A, false),
    ]);
    expect(kanallar.size).toBe(1);
  });

  it('aciliyet ile ses BAGIMSIZ eksenlerdir (4 kombinasyon = 4 ayri kanal)', () => {
    const hepsi = new Set([
      muhafizKanalIdOlustur(VARSAYILAN_SES, false),
      muhafizKanalIdOlustur(VARSAYILAN_SES, true),
      muhafizKanalIdOlustur(SES_A, false),
      muhafizKanalIdOlustur(SES_A, true),
    ]);
    expect(hepsi.size).toBe(4);
  });
});

/**
 * FAZ 6 — TITRESIM DE KANAL OZELLIGIDIR.
 *
 * Android'de titresim de (ses gibi) kanal olusturulduktan SONRA degistirilemez →
 * kanal id artik (ses + titresim) fonksiyonudur. Ama TABAN kanal istisnasi (B9)
 * korunur: varsayilan ses + varsayilan titresim hala `muhafiz`/`muhafiz_acil`
 * kanallarina duser, cunku o kanallar mevcut cihazlarda ZATEN kurulu ve
 * kullanicinin tercihleri (titresim/onem/DND) orada birikmis durumda.
 */
describe('muhafizKanalIdOlustur — titresim ekseni (Faz 6)', () => {
  it('UC DURUM: varsayilan+varsayilan taban · varsayilan+titresim hash · ayni ses farkli titresim FARKLI id', () => {
    // 1) varsayilan ses + varsayilan titresim -> TABAN kanal
    expect(muhafizKanalIdOlustur(VARSAYILAN_SES, false, false)).toBe('muhafiz');
    expect(muhafizKanalIdOlustur(VARSAYILAN_SES, true, false)).toBe('muhafiz_acil');

    // 2) varsayilan ses + OZEL titresim -> taban esleme BOZULUR, hash'li kanal
    expect(muhafizKanalIdOlustur(VARSAYILAN_SES, false, true)).toMatch(/^muhafiz_[0-9a-f]{8}$/);
    expect(muhafizKanalIdOlustur(VARSAYILAN_SES, true, true)).toMatch(
      /^muhafiz_acil_[0-9a-f]{8}$/
    );

    // 3) AYNI ses + FARKLI titresim -> FARKLI id (yoksa ayni sesi paylasan iki
    //    hucreden biri sessizce yanlis titresim davranisi alirdi)
    expect(muhafizKanalIdOlustur(SES_A, false, true)).not.toBe(
      muhafizKanalIdOlustur(SES_A, false, false)
    );
  });

  /**
   * GERIYE UYUMLULUK NOBETCISI — bu testin kirilmasi, sahadaki her kullanicinin
   * kanal id'sinin degismesi demektir: eski kanal oksuz kalir (GC siler), yenisi
   * sifir tercihle kurulur ve kullanicinin o kanalda biriktirdigi ayarlar gider.
   */
  it('MEVCUT KULLANICININ KANAL IDsi DEGISMEZ: titresim kapaliyken hash girdisi SADECE sestir', () => {
    expect(muhafizKanalIdOlustur(SES_A, false, false)).toBe(`muhafiz_${sesHashi(SES_A)}`);
    expect(muhafizKanalIdOlustur(SES_A, true, false)).toBe(`muhafiz_acil_${sesHashi(SES_A)}`);
    // Parametre HIC verilmemis eski cagiranlar da ayni id'yi almali.
    expect(muhafizKanalIdOlustur(SES_A, false)).toBe(muhafizKanalIdOlustur(SES_A, false, false));
    expect(muhafizKanalIdOlustur(VARSAYILAN_SES, false)).toBe('muhafiz');
  });

  it('KANAL ENFLASYONU: kanal sayisi = benzersiz (ses, titresim, aciliyet) kombinasyonu', () => {
    const hepsi = new Set([
      muhafizKanalIdOlustur(VARSAYILAN_SES, false, false),
      muhafizKanalIdOlustur(VARSAYILAN_SES, false, true),
      muhafizKanalIdOlustur(VARSAYILAN_SES, true, false),
      muhafizKanalIdOlustur(VARSAYILAN_SES, true, true),
      muhafizKanalIdOlustur(SES_A, false, false),
      muhafizKanalIdOlustur(SES_A, false, true),
      // tekrarlar yeni kanal ACMAZ
      muhafizKanalIdOlustur(SES_A, false, true),
      muhafizKanalIdOlustur(VARSAYILAN_SES, false, true),
    ]);
    expect(hepsi.size).toBe(6);
  });

  it('titresimli kanallar da GC uzayindadir (taban kanallar korunur)', () => {
    expect(muhafizKanaliMi(muhafizKanalIdOlustur(VARSAYILAN_SES, false, true))).toBe(true);
    expect(silinebilirMuhafizKanaliMi(muhafizKanalIdOlustur(VARSAYILAN_SES, false, true))).toBe(
      true
    );
    expect(silinebilirMuhafizKanaliMi(muhafizKanalIdOlustur(VARSAYILAN_SES, false, false))).toBe(
      false
    );
  });
});

describe('muhafizKanaliMi / silinebilirMuhafizKanaliMi', () => {
  it('muhafiz kanal uzayini tanir', () => {
    expect(muhafizKanaliMi('muhafiz')).toBe(true);
    expect(muhafizKanaliMi('muhafiz_acil')).toBe(true);
    expect(muhafizKanaliMi(muhafizKanalIdOlustur(SES_A, false))).toBe(true);
    expect(muhafizKanaliMi(muhafizKanalIdOlustur(SES_A, true))).toBe(true);
  });

  it('muhafiz disi kanallara ASLA dokunmaz (vakit sayaci, iftar, varsayilan...)', () => {
    for (const yabanci of ['vakit_bildirim', 'vakit_sayac', 'iftar_sayac_v2', 'default']) {
      expect(muhafizKanaliMi(yabanci)).toBe(false);
      expect(silinebilirMuhafizKanaliMi(yabanci)).toBe(false);
    }
  });

  it('TABAN kanallar cop toplamada ASLA silinmez (kullanici tercihleri orada birikmis)', () => {
    expect(silinebilirMuhafizKanaliMi('muhafiz')).toBe(false);
    expect(silinebilirMuhafizKanaliMi('muhafiz_acil')).toBe(false);
  });

  it('hash li kanallar silinebilir', () => {
    expect(silinebilirMuhafizKanaliMi(muhafizKanalIdOlustur(SES_A, false))).toBe(true);
    expect(silinebilirMuhafizKanaliMi(muhafizKanalIdOlustur(SES_A, true))).toBe(true);
  });
});

describe('iPhone ses kimlikleri (paket:/dosya:) — ANDROID KANAL KIMLIGI DEGISMEZ', () => {
  const PAKET = 'paket:zil';
  const DOSYA = 'dosya:kullanici_ses_0123abcd.caf';

  it('NOBETCI: iPhone kimligi Android kanal kimligine GIRMEZ (yedek Android\'e tasininca taban kanal)', () => {
    for (const k of [PAKET, DOSYA]) {
      expect(ozelSesMi(k)).toBe(false);
      expect(sesKimliginiNormalize(k)).toBe(VARSAYILAN_SES);
      expect(muhafizKanalIdOlustur(k, false, false)).toBe('muhafiz');
      expect(muhafizKanalIdOlustur(k, true, false)).toBe('muhafiz_acil');
      expect(muhafizKanalIdOlustur(k, false, true)).toBe(muhafizKanalIdOlustur(VARSAYILAN_SES, false, true));
      expect(alarmKanalIdOlustur(k)).toBe('namaz_alarm');
    }
  });

  it('secilmisSesMi iki platformun secimini de tanir; varsayilan ve bozuk kimlik secim degildir', () => {
    expect(secilmisSesMi(SES_A)).toBe(true);
    expect(secilmisSesMi(PAKET)).toBe(true);
    expect(secilmisSesMi(DOSYA)).toBe(true);
    expect(secilmisSesMi(VARSAYILAN_SES)).toBe(false);
    expect(secilmisSesMi('paket:yok')).toBe(false);
    expect(secilmisSesMi('dosya:../x.caf')).toBe(false);
    expect(secilmisSesMi(undefined)).toBe(false);
  });

  it('platformdaCalinirMi: baska platformun kimligi burada varsayilan calar', () => {
    expect(platformdaCalinirMi(SES_A, 'android')).toBe(true);
    expect(platformdaCalinirMi(PAKET, 'android')).toBe(false);
    expect(platformdaCalinirMi(DOSYA, 'android')).toBe(false);
    expect(platformdaCalinirMi(PAKET, 'ios')).toBe(true);
    expect(platformdaCalinirMi(DOSYA, 'ios')).toBe(true);
    expect(platformdaCalinirMi(SES_A, 'ios')).toBe(false);
  });

  describe('ad üreticisi CİHAZA göre (çalan sesin adı)', () => {
    afterEach(() => {
      sesPlatformunuAyarla('android');
      eklenmisSesleriAyarla(null);
    });

    it('iPhone: paket sesinin adı SÖZLÜKTEN (kayıtlı ad yok sayılır); dosyanın adı kullanıcının dosya adı', () => {
      sesPlatformunuAyarla('ios');
      expect(sesGorunenAdi(PAKET, 'eski ad')).toBe('Sakin zil');
      expect(sesGorunenAdi('paket:sabah')).toBe('Sabah');
      expect(sesGorunenAdi(DOSYA, 'Ezan')).toBe('Ezan');
      expect(sesGorunenAdi(DOSYA)).toBe('Seçtiğiniz ses');
      expect(sesGorunenAdi(VARSAYILAN_SES)).toBe('Uygulama sesi');
    });

    it('Android: iPhone yedeğinden gelen paket/dosya sesi VARSAYILANIN adını alır (çalan odur)', () => {
      sesPlatformunuAyarla('android');
      expect(sesGorunenAdi(PAKET)).toBe('Uygulama sesi');
      expect(sesGorunenAdi(DOSYA, 'Ezan')).toBe('Uygulama sesi');
      expect(sesGorunenAdi(PAKET, undefined, 'Telefonun bildirim sesi')).toBe('Telefonun bildirim sesi');
      // Android'in kendi sesi BİREBİR (kanal adları da buradan beslenir).
      expect(sesGorunenAdi(SES_A, 'Melodi')).toBe('Melodi');
      expect(sesGorunenAdi(SES_A)).toBe('Seçtiğiniz ses');
    });

    it('iPhone: content:// sesi varsayılan adını alır', () => {
      sesPlatformunuAyarla('ios');
      expect(sesGorunenAdi(SES_A, 'Melodi')).toBe('Uygulama sesi');
      expect(sesGorunenAdi(SES_A, 'Melodi', 'Telefonun bildirim sesi')).toBe('Telefonun bildirim sesi');
    });

    it('iPhone: eklenen dosyalar LİSTESİNDE olmayan dosya (silinmiş) varsayılan sayılır; liste okunmadıysa çalınır kabul', () => {
      sesPlatformunuAyarla('ios');
      expect(cihazdaCalinirMi(DOSYA)).toBe(true);
      eklenmisSesleriAyarla(['kullanici_ses_ffffffff.caf']);
      expect(cihazdaCalinirMi(DOSYA)).toBe(false);
      expect(sesGorunenAdi(DOSYA, 'Ezan')).toBe('Uygulama sesi');
      eklenmisSesleriAyarla(['kullanici_ses_0123abcd.caf']);
      expect(cihazdaCalinirMi(DOSYA)).toBe(true);
      expect(sesGorunenAdi(DOSYA, 'Ezan')).toBe('Ezan');
      expect(cihazdaCalinirMi(PAKET)).toBe(true);
    });

    it('varsayılan ses yüzeyin varsayılan adını alır (kayıtlı ad yoksa)', () => {
      expect(sesGorunenAdi(VARSAYILAN_SES, undefined, 'Telefonun bildirim sesi')).toBe('Telefonun bildirim sesi');
      expect(sesGorunenAdi(VARSAYILAN_SES)).toBe('Uygulama sesi');
    });
  });
});
