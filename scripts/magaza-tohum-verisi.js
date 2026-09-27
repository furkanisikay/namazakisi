/**
 * Magaza ekran goruntuleri icin ortak tohum verisi.
 *
 * iOS (simulator-tohumla.js) ve Android (android-ekranlari-cek.js) AYNI veriyi
 * kullanir — ayrisirlarsa iki magazanin kareleri farkli seri/vakit gosterir ve
 * bunu kimse fark etmez.
 *
 * Konum MANUEL moda alinir: boylece kare cekerken konum izni diyalogu cikmaz.
 * Muhafiz diskten ACIK gelir: anahtari dokunarak acmak iki platformda da
 * guvenilmez (iOS'ta `idb ui tap` UISwitch'i toggle etmiyor).
 */

const gun = (geriGun) => {
    const d = new Date();
    d.setDate(d.getDate() - geriGun);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const TAM_GUN = { Sabah: true, 'Öğle': true, 'İkindi': true, 'Akşam': true, 'Yatsı': true };
// Bugun kismen kilinmis: ana ekranda hem isaretli hem bekleyen vakit gorunsun.
const BUGUN = { Sabah: true, 'Öğle': true, 'İkindi': true };
const GECMIS_GUN = 25;

const KONUM = {
    konumModu: 'manuel',
    seciliSehirId: '34',
    seciliIlId: 34,
    seciliIlceId: null,
    seciliIlAdi: 'İstanbul',
    seciliIlceAdi: '',
    gpsAdres: null,
    koordinatlar: { lat: 41.0082, lng: 28.9784 },
    sonGpsGuncellemesi: null,
    akilliTakipAktif: false,
    takipHassasiyeti: 'dengeli',
};

/** AsyncStorage anahtar -> ham string deger. */
function tohumVerisi() {
    const depo = {
        '@namaz_akisi/ilk_kurulum_tamamlandi': 'true',
        '@namaz_akisi/konum_ayarlari': JSON.stringify(KONUM),
        // Gun-bazli kayitlar dogrudan yazildigi icin eski blob gocunu ATLA.
        '@namaz_akisi/namaz_gun_migrasyon_tamam': '1',
        // `matris` bilincli YAZILMAZ: yukleme thunk'i eksik matrisi varsayilan
        // preset'ten turetir.
        muhafiz_ayarlari: JSON.stringify({
            aktif: true,
            yogunluk: 'normal',
            gelismisMod: false,
            presetGocuYapildi: true,
        }),
        // Seri YOL-BAGIMLIDIR: kayitlardan turetilmez, diskte tutulur.
        // Tohumlanmazsa kayitlar dolu olsa bile baslik cipi "0 Gün" gosterir.
        seri_durumu: JSON.stringify({
            mevcutSeri: GECMIS_GUN,
            enUzunSeri: GECMIS_GUN,
            sonTamGun: gun(1),
            seriBaslangici: gun(GECMIS_GUN),
            toparlanmaDurumu: null,
            dondurulduMu: false,
            dondurulmaTarihi: null,
            sonGuncelleme: new Date().toISOString(),
        }),
    };

    depo[`namaz_gun_${gun(0)}`] = JSON.stringify(BUGUN);
    for (let i = 1; i <= GECMIS_GUN; i++) depo[`namaz_gun_${gun(i)}`] = JSON.stringify(TAM_GUN);
    return depo;
}

module.exports = { tohumVerisi, gun, GECMIS_GUN };
