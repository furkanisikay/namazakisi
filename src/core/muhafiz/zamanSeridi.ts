/**
 * ZAMAN SERIDI — yerlesim ve metin hesabi (saf; React/store'a bagimsiz).
 *
 * Muhafiz ayar ekraninda yon secicisinin altinda, vaktin BUGUNKU penceresini
 * ve o pencerede hatirlatmalarin nereye dustugunu gosteren seridin verisini
 * uretir. Bilesen (`ZamanSeridi.tsx`) yalniz bunu cizer.
 *
 * NEDEN VAR: kullanici "Vakit cikarken" / "Vakit girer girmez" seceneginin ne
 * demek oldugunu ekranda anlayamiyordu. Iki yon ayni dort adimi tasir; fark
 * adimlarin pencerenin NERESINE dustugudur. Bunu metinle anlatmak yetmedi,
 * resmi gostermek gerekti.
 *
 * VERI TEK KAYNAKTAN: girdi `vakitUyariPlaniOlustur` ciktisidir — "Akisi
 * onizle" modaliyla ayni dizi. Ayri bir "serit mantigi" yok; ekranda gorulen
 * nokta arka planin gercekten planlayacagi dakikadir.
 *
 * EKSEN DOGRUSAL KALIR (bilincli). Logaritmik/segmentli eksen yaz yatsisini
 * (286 dk) kis yatsisiyla (694 dk) ayni gosterir ve "bu adim bugun calismayacak"
 * notuyla celisir. Kis yatsisinda ilk 20 dakikanin seridin %3'u olmasi sorun
 * degil bilgidir: giris yonunde cubuk sol uca yapisik dogar — "girer girmez"in
 * resmi budur.
 */
import type { UyariPlani } from './motorAdaptoru';
import type { PencereYonu } from './pencereTipleri';

/** Bir adimin (kademenin) pencerede ILK tetigi — seritte cubuk olarak cizilir. */
export interface SeritCubugu {
    /** 1 nazik · 2 uyari · 3 sert · 4 acil */
    seviye: number;
    /** Pencere icindeki konum, 0 = giris, 1 = cikis. */
    oran: number;
    /** Tetik aninin vaktin cikisina kalan dakikasi (saat hesabi icin). */
    kalanDk: number;
}

/** Bir adimin TEKRARI — seritte ince cizik olarak cizilir. */
export interface SeritTiki {
    seviye: number;
    oran: number;
    kalanDk: number;
}

export interface SeritDuzeni {
    cubuklar: SeritCubugu[];
    tikler: SeritTiki[];
    /** Ilk uyaridan son uyariya uzanan kapsama bandi (oran). Plan bossa `null`. */
    bant: { bas: number; son: number } | null;
    /** Toplam uyari sayisi (cubuk + tik). */
    uyariSayisi: number;
    /** Ilk ve son uyarinin cikisa kalan dakikasi. Plan bossa `null`. */
    ilkKalanDk: number | null;
    sonKalanDk: number | null;
    /**
     * Son (en sert) adim TEKRARLANIYOR mu? Giris yonunde bu "kilana kadar
     * surer" demektir; tek atislarda (hafif yogunluk) o cumle YALAN olur.
     */
    sonAdimTekrarli: boolean;
}

const sinirla = (x: number): number => Math.min(1, Math.max(0, x));

/**
 * Motor planini serit duzenine cevirir.
 *
 * Konum formulu YONDEN BAGIMSIZDIR: `UyariPlani.kalanDk` daima "cikisa kalan"
 * dakikadir (bildirim `cikis - kalanDk` anina kurulur), dolayisiyla
 * `oran = 1 - kalanDk / pencere`. `olcuDk` burada KULLANILMAZ — giris yonunde
 * o "giristen gecen"dir ve konumu ters cevirir.
 */
export function seritDuzeniHesapla(
    plan: readonly UyariPlani[],
    pencereUzunluguDk: number
): SeritDuzeni {
    if (!Number.isFinite(pencereUzunluguDk) || pencereUzunluguDk <= 0 || plan.length === 0) {
        return {
            cubuklar: [],
            tikler: [],
            bant: null,
            uyariSayisi: 0,
            ilkKalanDk: null,
            sonKalanDk: null,
            sonAdimTekrarli: false,
        };
    }

    // Kronolojik sira = cikisa kalan dakika AZALAN.
    const sirali = [...plan].sort((a, b) => b.kalanDk - a.kalanDk);

    const gorulen = new Set<number>();
    const cubuklar: SeritCubugu[] = [];
    const tikler: SeritTiki[] = [];
    const tetikSayisi = new Map<number, number>();

    for (const uyari of sirali) {
        const oran = sinirla(1 - uyari.kalanDk / pencereUzunluguDk);
        tetikSayisi.set(uyari.seviye, (tetikSayisi.get(uyari.seviye) ?? 0) + 1);
        if (gorulen.has(uyari.seviye)) {
            tikler.push({ seviye: uyari.seviye, oran, kalanDk: uyari.kalanDk });
        } else {
            gorulen.add(uyari.seviye);
            cubuklar.push({ seviye: uyari.seviye, oran, kalanDk: uyari.kalanDk });
        }
    }

    const ilk = sirali[0];
    const son = sirali[sirali.length - 1];
    const enSertSeviye = Math.max(...sirali.map((u) => u.seviye));

    return {
        cubuklar,
        tikler,
        bant: {
            bas: sinirla(1 - ilk.kalanDk / pencereUzunluguDk),
            son: sinirla(1 - son.kalanDk / pencereUzunluguDk),
        },
        uyariSayisi: sirali.length,
        ilkKalanDk: ilk.kalanDk,
        sonKalanDk: son.kalanDk,
        sonAdimTekrarli: (tetikSayisi.get(enSertSeviye) ?? 0) > 1,
    };
}

/**
 * Cubuklarin piksel konumlarini, ust uste binmeyecek sekilde yayar.
 *
 * NEDEN: cikis yonunde 45/25/10/3 dk, 694 dk'lik kis yatsisinda seridin sag
 * ucundaki ~20 px'e sikisir; cubuklar ust uste binerse kac adim oldugu okunmaz.
 *
 * ITME YONU CAPADAN UZAGADIR: cikista capa sag uc (cikis) → cubuklar SOLA
 * itilir; giriste capa sol uc (giris) → SAGA itilir. Capaya en yakin cubuk
 * yerinde kalir. Itme yalniz CUBUKLARA uygulanir; tikler gercek yerindedir.
 *
 * DURUSTLUK SINIRI: itilen cubuk gercek dakikasindan birkac piksel sapabilir.
 * Saat etiketleri her zaman gercek degeri yazar; cubuk "sira ve yaklasik yer"dir.
 */
export function cubukKonumlariniYay(
    oranlar: readonly number[],
    genislikPx: number,
    minAralikPx: number,
    yon: PencereYonu
): number[] {
    const hamPx = oranlar.map((o) => sinirla(o) * genislikPx);
    const sonuc = [...hamPx];
    const sira = hamPx.map((_, i) => i);

    if (yon === 'girisindenItibaren') {
        sira.sort((a, b) => hamPx[a] - hamPx[b]);
        for (let k = 1; k < sira.length; k++) {
            const onceki = sonuc[sira[k - 1]];
            if (sonuc[sira[k]] - onceki < minAralikPx) sonuc[sira[k]] = onceki + minAralikPx;
        }
        const tasma = sonuc[sira[sira.length - 1]] - genislikPx;
        if (tasma > 0) for (let k = 0; k < sonuc.length; k++) sonuc[k] = Math.max(0, sonuc[k] - tasma);
    } else {
        sira.sort((a, b) => hamPx[b] - hamPx[a]);
        for (let k = 1; k < sira.length; k++) {
            const onceki = sonuc[sira[k - 1]];
            if (onceki - sonuc[sira[k]] < minAralikPx) sonuc[sira[k]] = onceki - minAralikPx;
        }
        const tasma = -sonuc[sira[sira.length - 1]];
        if (tasma > 0) for (let k = 0; k < sonuc.length; k++) sonuc[k] = Math.min(genislikPx, sonuc[k] + tasma);
    }
    return sonuc;
}

/** `HH:mm` (yerel saat). Intl'e bagli degil — Hermes'te ICU varligi garanti degil. */
export function saatMetni(tarih: Date): string {
    const iki = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${iki(tarih.getHours())}:${iki(tarih.getMinutes())}`;
}

/** Cikisa `kalanDk` kala dusen an. */
export function kalanDkAni(bitis: Date, kalanDk: number): Date {
    return new Date(bitis.getTime() - kalanDk * 60000);
}

export interface SeritCumlesiGirdisi {
    duzen: SeritDuzeni;
    yon: PencereYonu;
    bitis: Date;
    /** Tum adimlar kapali mi? (plan bosluğunun sebebini ayirt etmek icin) */
    tumAdimlarKapali: boolean;
    /** Verilirse ve vakit su an suruyorsa siradaki hatirlatma eklenir. */
    simdi?: Date;
    baslangic?: Date;
}

/**
 * Seridin altindaki tek cumle.
 *
 * TURKCE EK TUZAGI: "04:26'da / 05:08'e" gibi saate eklenen hal ekleri sayinin
 * OKUNUSUNA gore degisir ("'de" mi "'da" mi, "'te" mi) ve dogru uretmek bir
 * sayi→soz tablosu ister. Cumle bu yuzden saatleri EKSIZ, iki noktadan sonra
 * yazar: "ilk hatırlatma 04:26, sonuncusu 05:08".
 */
export function seritCumlesiOlustur(g: SeritCumlesiGirdisi): string {
    const { duzen, yon, bitis } = g;

    if (duzen.uyariSayisi === 0 || duzen.ilkKalanDk === null || duzen.sonKalanDk === null) {
        return g.tumAdimlarKapali
            ? 'Tüm adımlar kapalı — bu vakitte hatırlatma almazsınız.'
            : 'Bugün bu vakitte hatırlatma planlanmıyor.';
    }

    const ilk = saatMetni(kalanDkAni(bitis, duzen.ilkKalanDk));
    const son = saatMetni(kalanDkAni(bitis, duzen.sonKalanDk));
    const sayi = `toplam ${duzen.uyariSayisi} uyarı`;

    let cumle: string;
    if (yon === 'girisindenItibaren') {
        cumle = duzen.sonAdimTekrarli
            ? `Vakit girince başlar: ilk hatırlatma ${ilk}, kılana kadar ${sayi}.`
            : `Vakit girince başlar: ilk hatırlatma ${ilk}, sonuncusu ${son} — ${sayi}.`;
    } else {
        cumle =
            duzen.uyariSayisi === 1
                ? `Bugün tek hatırlatma: ${ilk}.`
                : `Bugün ilk hatırlatma ${ilk}, sonuncusu ${son} — ${sayi}.`;
    }

    const sirada = siradakiHatirlatma(g);
    return sirada ? `${cumle} Sıradaki: ${sirada}.` : cumle;
}

/** Vakit su an suruyorsa siradaki hatirlatmanin saati; degilse `null`. */
function siradakiHatirlatma(g: SeritCumlesiGirdisi): string | null {
    if (!g.simdi || !g.baslangic) return null;
    const simdiMs = g.simdi.getTime();
    if (simdiMs < g.baslangic.getTime() || simdiMs >= g.bitis.getTime()) return null;

    const gelecek = [...g.duzen.cubuklar, ...g.duzen.tikler]
        .map((u) => kalanDkAni(g.bitis, u.kalanDk).getTime())
        .filter((ms) => ms > simdiMs)
        .sort((a, b) => a - b);
    return gelecek.length > 0 ? saatMetni(new Date(gelecek[0])) : null;
}

/** Vakit su an bu pencerenin icinde mi? Evetse imlecin orani. */
export function simdiOrani(baslangic: Date, bitis: Date, simdi: Date): number | null {
    const bas = baslangic.getTime();
    const bit = bitis.getTime();
    const s = simdi.getTime();
    if (bit <= bas || s < bas || s >= bit) return null;
    return (s - bas) / (bit - bas);
}

/** Ekran okuyucu etiketi — seridin tek erisilebilirlik dugumu. */
export function seritErisimEtiketi(
    pencereAdi: string,
    baslangic: Date,
    bitis: Date,
    cumle: string
): string {
    return `${pencereAdi} bugün ${saatMetni(baslangic)} ile ${saatMetni(bitis)} arasında. ${cumle}`;
}
