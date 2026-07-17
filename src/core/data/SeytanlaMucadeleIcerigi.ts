/**
 * Muhafiz bildirim/banner icerik havuzu.
 *
 * ── İKİ TÜR İÇERİK VAR, KARIŞTIRMA ──────────────────────────────────────────
 * 1) NASS (`kaynak` DOLU): doğrulanmış ayet/hadis. Künye ekranda gösterilir.
 *    Buraya YALNIZ tam künyesi (kitap + bab/no) doğrulanmış nass girer.
 *    "Hadis-i Şerif" / "Kuran-ı Kerim" gibi ifadeler KÜNYE DEĞİLDİR.
 * 2) KENDİ SÖZÜMÜZ (`kaynak` YOK): motive edici metin. Nass iddiası taşımaz,
 *    künye de gerekmez. Ayet/hadis gibi görünecek şekilde YAZMA.
 *
 * ── HAVUZA İÇERİK EKLERKEN ──────────────────────────────────────────────────
 * • TERK ≠ GECİKME. Bildirimi alan kişi namazı TERK etmiş değil; vaktin
 *   çıkmasına 3-30 dk kala uyarılıyor ve birazdan kılacak. Lafzı "terk eden"
 *   olan nasslar (ör. Buhârî, Mevâkît 34/594 "ikindiyi terk edenin ameli boşa
 *   gider"; Meryem 19:59 "namazı zayi ettiler") SAHİH OLSA BİLE bu kişiye
 *   YANLIŞ HEDEFTİR — havuza girmez. Buhârî'nin kendisi ayrımı yapar: fevt
 *   (kaçırma) hadisi 552'de, terk hadisi 553'te ayrı bablardadır.
 * • VAKTE ÖZGÜ nassı `vakitler` ile kısıtla. Kısıtlamazsan yanlış vakitte
 *   çıkar (yaşandı: "münafıklara en ağır gelen yatsı ve sabah namazıdır"
 *   öğle/ikindi/akşam bildirimlerinde de çıkıyordu).
 * • LAFIZ BÜTÜNLÜĞÜ TUZAĞI: bir nassın kısaltılmış hâli teşvik tonundayken
 *   tam metni tehdit içerebilir (bkz. `sabah-koruma`). Metni "tamamlamaya"
 *   kalkma — kademe kayar.
 * • Kur'an için birebir MEAL alıntılama (telif: mealler işlenme eserdir);
 *   ayetin özetini yaz, künyeye "(özet)" koy.
 *
 * Dayanak: 2026-07-17 iki turlu doğrulama araştırması. Doğrulanamayan maddeler
 * (Buhârî Ezân 34; "Namaz müminin miracıdır"; "Namazı kasten terk eden Allah'ın
 * korumasından uzaklaşır"; "Melekler ikindi vakti toplanır") bilerek DIŞARIDA
 * bırakıldı — yanlış oldukları tespit edilmedi, künyeleri doğrulanamadı.
 * Tahriç edilirlerse eklenebilir.
 */
import type { VakitAdi } from '../types';

export interface MucadeleIcerigi {
    id: string;
    metin: string;
    /**
     * TAM künye (kitap, bab/no). Doluysa ekranda metnin altında gösterilir.
     * YOKSA bu içerik bizim kendi sözümüzdür, nass iddiası taşımaz.
     */
    kaynak?: string;
    /**
     * Gösterilebileceği vakitler. TANIMSIZ = genel (her vakit).
     * Vakte özgü nasslarda MUTLAKA doldur.
     */
    vakitler?: VakitAdi[];
    /** 1: teşvik · 2: uyarı · 3: sert · 4: son çağrı */
    siddetSeviyesi: 1 | 2 | 3 | 4;
}

export const SEYTANLA_MUCADELE_ICERIGI: MucadeleIcerigi[] = [
    // ── Seviye 1: teşvik ────────────────────────────────────────────────────
    {
        id: 'berdeyn',
        metin: 'İki serinliği — sabahı ve ikindiyi — kılan cennete girer.',
        kaynak: 'Buhârî, Mevâkîtü\'s-salât 26; Müslim, Mesâcid 215',
        vakitler: ['imsak', 'ikindi'], // "berdeyn" = sabah + ikindi. Başka vakitte KULLANILAMAZ.
        siddetSeviyesi: 1,
    },
    {
        id: 'sabah-koruma',
        // LAFIZ BÜTÜNLÜĞÜ: Diyanet'in kısalttığı bu cümle teşvik tonundadır.
        // Tam metnin devamı cehennem tehdidi içerir → metni UZATMA.
        metin: 'Sabah namazını kılan, Allah\'ın koruması altındadır.',
        kaynak: 'Müslim, Mesâcid 262',
        vakitler: ['imsak'],
        siddetSeviyesi: 1,
    },
    {
        id: 'hud-114',
        // Meal ALINTISI değil, ayetin özeti (telif).
        metin: 'Kur\'an, gündüzün iki ucunda ve gecenin ilk saatlerinde namazı emreder; iyilikler kötülükleri giderir.',
        kaynak: 'Hûd sûresi 114 (özet)',
        siddetSeviyesi: 1, // genel
    },
    {
        id: 'firsat',
        metin: 'Vakit daralmaya başladı, fırsat varken kıl.',
        siddetSeviyesi: 1, // kendi sözümüz
    },

    // ── Seviye 2: uyarı ─────────────────────────────────────────────────────
    {
        id: 'ikindi-fevt',
        // FEVT (kaçırma) nassı, TERK değil → gecikmiş kullanıcıya uygun.
        metin: 'İkindiyi kaçıran, ailesini ve malını yitirmiş gibidir.',
        kaynak: 'Buhârî, Mevâkîtü\'s-salât 14; Müslim, Mesâcid 200',
        vakitler: ['ikindi'],
        siddetSeviyesi: 2,
    },
    {
        id: 'sona-birakma',
        metin: 'Namazı sona bırakma; şimdi kılmak için vakit uygun.',
        siddetSeviyesi: 2, // kendi sözümüz
    },

    // ── Seviye 3: sert ──────────────────────────────────────────────────────
    {
        id: 'fisilti',
        metin: 'Şeytan şu an sana "Sonra kılarsın" diye fısıldıyor. Onu dinleme!',
        siddetSeviyesi: 3, // kendi sözümüz
    },
    {
        id: 'omur',
        metin: 'Vakit geçiyor, ömür bitiyor. Bu namaz son namazın olabilir.',
        siddetSeviyesi: 3, // kendi sözümüz
    },
    {
        id: 'keske',
        metin: 'Birkaç dakika sonra "keşke" demek yerine şimdi kalk.',
        siddetSeviyesi: 3, // kendi sözümüz
    },

    // ── Seviye 4: son çağrı ─────────────────────────────────────────────────
    {
        id: 'namaza-dur',
        // "secdeye kapan" DEĞİL: secde namazın içindeki rükün, başlangıcı değil.
        metin: 'Hemen namaza dur — sonra kaza etmek zorunda kalırsın.',
        siddetSeviyesi: 4, // kendi sözümüz
    },
    {
        id: 'son-dakika',
        metin: 'Son dakikalar. Bırak elindekini, namaza dur.',
        siddetSeviyesi: 4, // kendi sözümüz
    },
];

/**
 * Verilen vakit ve seviye icin uygun icerikler.
 * Vakte ozgu nasslar yalniz kendi vakitlerinde, genel icerikler her vakitte cikar.
 */
export function uygunIcerikleriBul(
    vakit: VakitAdi,
    seviye: 1 | 2 | 3 | 4
): MucadeleIcerigi[] {
    return SEYTANLA_MUCADELE_ICERIGI.filter(
        (i) =>
            i.siddetSeviyesi === seviye &&
            (i.vakitler === undefined || i.vakitler.includes(vakit))
    );
}

/**
 * Bildirim govdesi metni: icerik + (varsa) kunye.
 * Kunye YALNIZ dogrulanmis nasslarda vardir; kendi sozumuzde yoktur.
 */
export function icerikMetniOlustur(icerik: MucadeleIcerigi): string {
    return icerik.kaynak ? `${icerik.metin}\n— ${icerik.kaynak}` : icerik.metin;
}
