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

/**
 * src/core/types/SeriTipleri.ts > SEVIYE_TANIMLARI'nin kopyasi (betik TS'yi
 * dogrudan yukleyemez). Ayrisirsa zarar sessiz DEGILDIR: yanlis seviye tohumlanir,
 * uygulama kutlama modali acar ve kareler bozuk cikar.
 */
const SEVIYELER = [
    { seviye: 1, minPuan: 0, rank: 'Mübtedi', ikon: '🌙' },
    { seviye: 2, minPuan: 100, rank: 'Tâlip', ikon: '⭐' },
    { seviye: 3, minPuan: 300, rank: 'Sâlik', ikon: '🌟' },
    { seviye: 4, minPuan: 600, rank: 'Mürid', ikon: '💫' },
    { seviye: 5, minPuan: 1000, rank: 'Ârif', ikon: '✨' },
    { seviye: 6, minPuan: 1500, rank: 'Hâfız', ikon: '🏆' },
    { seviye: 7, minPuan: 2500, rank: 'Kâmil', ikon: '👑' },
];

function seviyeBul(puan) {
    let i = 0;
    while (i + 1 < SEVIYELER.length && SEVIYELER[i + 1].minPuan <= puan) i++;
    const sonraki = SEVIYELER[i + 1];
    return { ...SEVIYELER[i], sonrakiMin: sonraki ? sonraki.minPuan : null };
}

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
        // Bonus ACIKCA 0: anahtar yoksa uygulama bir kerelik goc yapar
        // (bonus = eski toplamPuan - eski taban). Android'de ilk acilistan kalan
        // `toplam_kililan_namaz = 0` ile bu 640 - 0 = 640 bonus uretti, toplam
        // 1280 puana cikti ve "Seviye Atladın! Yeni rank: Ârif" modali acildi.
        '@namaz_akisi/bonus_puan': '0',
        // Taze 'guncelleme yok' onbellegi: debug APK hatta yeniden kullanildigi icin
        // surumu cogu zaman en son release'ten eskidir. Onbellek yoksa GitHub kontrolu
        // acilistan birkac saniye sonra 'Yeni Surum Mevcut' penceresini acar, kareyi
        // orter ve sonraki akislarin dokunuslarini yutar (v0.28.3 yayimlaninca yasandi).
        // GuncellemeServisi 6 saatlik onbellek gecerliyken aga hic cikmaz.
        '@namaz_akisi/guncelleme_durumu': JSON.stringify({
            sonKontrolZamani: Date.now(),
            sonSonuc: { guncellemeMevcut: false, bilgi: null },
            ertelenenVersiyon: null,
            ertelemeZamani: null,
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

    // Kaza defteri: bos gelirse ekran "kaza borcunuz yok" der ve ozelligi
    // anlatmaz. Gercekci bir ara durum: borc eklenmis, bir kismi kilinmis.
    const KAZA = [
        ['Sabah', 64],
        ['Öğle', 71],
        ['İkindi', 58],
        ['Akşam', 83],
        ['Yatsı', 60],
        ['Vitir', 47],
    ].map(([namazAdi, tamamlanan]) => ({ namazAdi, toplamBorc: 180, kalanBorc: 180 - tamamlanan, tamamlanan }));
    depo['@namaz_akisi/kaza_durumu'] = JSON.stringify({
        namazlar: KAZA,
        toplamKalan: KAZA.reduce((t, k) => t + k.kalanBorc, 0),
        toplamTamamlanan: KAZA.reduce((t, k) => t + k.tamamlanan, 0),
        gunlukHedef: 5,
        gunlukTamamlanan: 3,
        gunlukHedefTarihi: gun(0),
        toplamGizleMi: false,
        guncellemeTarihi: new Date().toISOString(),
    });

    // Seviye de tohumlanmali: disk bossa uygulama 1. seviyeden basladigini sanar,
    // acilistaki puan hesabi 4. seviyeyi bulunca "Seviye Atladın!" kutlamasi acar.
    // O modaldeki surekli animasyon Android'de `uiautomator dump`'i "could not
    // get idle state" ile dusurur ve erisilebilirlik agaci BOS gelir (yasandi).
    // Puan kayitlardan turetilir: kilinan namaz x 5 (puanlamayiYenidenHesapla).
    const kilinan = GECMIS_GUN * Object.keys(TAM_GUN).length + Object.keys(BUGUN).length;
    const puan = kilinan * 5;
    const seviye = seviyeBul(puan);
    depo.seviye_durumu = JSON.stringify({
        mevcutSeviye: seviye.seviye,
        toplamPuan: puan,
        mevcutSeviyePuani: puan - seviye.minPuan,
        sonrakiSeviyeKalanPuan: seviye.sonrakiMin === null ? 0 : seviye.sonrakiMin - puan,
        rank: seviye.rank,
        rankIkonu: seviye.ikon,
    });
    return depo;
}

module.exports = { tohumVerisi, gun, GECMIS_GUN, SEVIYELER };
