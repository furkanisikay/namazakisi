/**
 * TEK HATIRLATMA DÜZENLEYİCİSİ — birleşik hatırlatma modülü §3 (plan PR-3).
 *
 * Altı yüzey (muhafız vakti, nafile, cuma, camiye gitme, yatış, takvim) aynı durum makinesini
 * ayrı ayrı kopyalıyordu: adım detayı / akış önizlemesi açık mı, adım ekle (ve yeni adımın
 * detayını aç), adım aç/kapa (kanal hafızasıyla), adım değiştir, sil. Bu hook o makinenin
 * TEK kopyasıdır; yüzey yalnız kendi değerini (`deger`), adımlara erişimi ve dönüşümleri
 * (`islemler` — her yüzeyin kısıtlarıyla) ve yazıcısını (`yaz`) verir.
 *
 * RIZA: sesli okuma ve gerçek alarm rızası adım detayının içinde sorulur (`AdimDetayModal`);
 * verilen rıza adım yazımıyla BİRLİKTE `yaz`'a iletilir — iki eşzamanlı yazım aynı eski
 * durumu birleştirip birbirini ezerdi. Rızanın KAYIT YERİ yüzeyindir (muhafız
 * `muhafizSlice.sesliOnayi`, nafile `NafileAyarlari.sesliOnayi`, ek yüzeylerin kendi alanı).
 *
 * BÜTÇE: `yaz` `false` dönerse değişiklik yazılmamıştır (bildirim sınırı rehberi açılmış
 * olabilir); hook o durumda yeni adımın detayını AÇMAZ.
 *
 * Saf mantık (kronoloji, kısıtlar, kanal hafızası) `core/` dosyalarındadır; burada yalnız
 * orkestrasyon durur.
 */
import { useCallback, useState } from 'react';
import type { SeviyeAyari } from '../../core/muhafiz/matrisTipleri';
import type { PencereYonu } from '../../core/muhafiz/pencereTipleri';
import { seviyeyiAc, seviyeyiKapat } from '../../core/muhafiz/seviyeAcKapa';
import type { AdimRizasi } from '../components/hatirlatma/AdimDetayModal';

/** Yüzeyin kendi değeri üzerindeki dönüşümler (kısıtlar yüzeyindir). Değişmezse AYNI referans. */
export interface HatirlatmaIslemleri<T> {
    /** Bir adımın dizisi (kronolojik). */
    adimlar: (deger: T) => SeviyeAyari[];
    ekle: (deger: T) => T;
    guncelle: (deger: T, indeks: number, seviye: SeviyeAyari) => T;
    sil: (deger: T, indeks: number) => T;
}

export interface HatirlatmaDuzenleyiciSecenekleri<T> {
    deger: T;
    yon: PencereYonu;
    islemler: HatirlatmaIslemleri<T>;
    /**
     * Yeni değeri yazar; rıza ilk kez verildiyse aynı yazımla birlikte kaydedilmeli.
     * `false` → yazılmadı (bütçe).
     */
    yaz: (yeni: T, riza: AdimRizasi) => boolean;
    /**
     * Boş sesli okuma metni otomatik cümle mi (ek yüzey/nafile)? Değilse (muhafız) liste
     * anahtarıyla geri açılan sesli adımın kutusu yön-uygun şablonla dolar.
     */
    bosMetinOtomatik: boolean;
    /** Adım detayı açıldı (muhafız: kapanışta sığma simülasyonu için önceki hâli saklar). */
    onDetayAcildi?: () => void;
    /** Adım detayı kapandı (muhafız: sığma simülasyonu; ek yüzey: bekleyen yazımı hemen uygula). */
    onDetayKapandi?: () => void;
}

export interface HatirlatmaDuzenleyici {
    /** Açık adım detayının indeksi; kapalıysa `null`. */
    detay: number | null;
    detayiAc: (indeks: number) => void;
    detayiKapat: () => void;
    onizlemeAcik: boolean;
    onizlemeyiAc: () => void;
    onizlemeyiKapat: () => void;
    /** "+ Hatırlatma ekleyin": yazılırsa yeni adımın detayı açılır. */
    adimEkle: () => void;
    /** Liste satırındaki anahtar (kanal hafızasıyla; `seviyeAcKapa`). */
    adimAcKapa: (indeks: number, acik: boolean) => void;
    adimDegistir: (indeks: number, seviye: SeviyeAyari, riza?: AdimRizasi) => void;
    adimSil: (indeks: number) => void;
}

export function useHatirlatmaDuzenleyici<T>(s: HatirlatmaDuzenleyiciSecenekleri<T>): HatirlatmaDuzenleyici {
    const { deger, yon, islemler, yaz, bosMetinOtomatik, onDetayAcildi, onDetayKapandi } = s;
    const [detay, setDetay] = useState<number | null>(null);
    const [onizlemeAcik, setOnizlemeAcik] = useState(false);

    const detayiAc = useCallback(
        (indeks: number) => {
            onDetayAcildi?.();
            setDetay(indeks);
        },
        [onDetayAcildi]
    );

    const detayiKapat = useCallback(() => {
        setDetay(null);
        onDetayKapandi?.();
    }, [onDetayKapandi]);

    const adimEkle = useCallback(() => {
        const yeni = islemler.ekle(deger);
        if (yeni === deger) return; // sınırda — eklenecek yer yok
        if (!yaz(yeni, {})) return;
        // Yeni adımın detayını aç: dizide eski eşiklerde olmayan tek adım.
        const eskiEsikler = new Set(islemler.adimlar(deger).map((a) => a.esikDk));
        const indeks = islemler.adimlar(yeni).findIndex((a) => !eskiEsikler.has(a.esikDk));
        if (indeks >= 0) detayiAc(indeks);
    }, [deger, islemler, yaz, detayiAc]);

    const adimAcKapa = useCallback(
        (indeks: number, acik: boolean) => {
            const mevcut = islemler.adimlar(deger)[indeks];
            if (!mevcut) return;
            const seviye = acik ? seviyeyiAc(mevcut, yon, !bosMetinOtomatik) : seviyeyiKapat(mevcut);
            if (seviye === mevcut) return; // zaten istenen durumda — gereksiz yazım yok
            yaz(islemler.guncelle(deger, indeks, seviye), {});
        },
        [deger, islemler, yaz, yon, bosMetinOtomatik]
    );

    const adimDegistir = useCallback(
        (indeks: number, seviye: SeviyeAyari, riza?: AdimRizasi) => {
            if (!islemler.adimlar(deger)[indeks]) return;
            yaz(islemler.guncelle(deger, indeks, seviye), riza ?? {});
        },
        [deger, islemler, yaz]
    );

    const adimSil = useCallback(
        (indeks: number) => {
            setDetay(null);
            const yeni = islemler.sil(deger, indeks);
            // Kapanış kancası ÇAĞRILMAZ: silme kendi yazımıdır (muhafızın sığma simülasyonu
            // silinen adımı geri getirmesin — eskiden de silme simülasyonu atlıyordu).
            if (yeni !== deger) yaz(yeni, {});
        },
        [deger, islemler, yaz]
    );

    return {
        detay,
        detayiAc,
        detayiKapat,
        onizlemeAcik,
        onizlemeyiAc: useCallback(() => setOnizlemeAcik(true), []),
        onizlemeyiKapat: useCallback(() => setOnizlemeAcik(false), []),
        adimEkle,
        adimAcKapa,
        adimDegistir,
        adimSil,
    };
}
