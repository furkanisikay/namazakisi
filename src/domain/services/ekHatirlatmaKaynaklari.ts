/**
 * EK HATIRLATMA KAYNAKLARI — muhafızla AYNI kanal uzayını paylaşan yüzeylerin
 * adım dizileri (ortak hatırlatma yüzeyleri, plan §4.3).
 *
 * Nafile (#273), cuma ve sonraki yüzeyler bildirimlerini muhafızın kanal uzayından
 * (`muhafiz` tabanı / ses + titreşim hash'li `muhafiz_<hash8>`) ve gerçek alarm kanal
 * uzayından (`namaz_alarm` / `namaz_alarm_<hash8>`) gönderir. ÇÖP TOPLAMA yalnız
 * muhafızın işidir (`MuhafizKanalServisi.hazirla`, `AndroidMuhafizTeslimcisi`); her
 * muhafız turu bu listedeki HER yüzeyin kanallarını korumalı, yoksa kullanıcının ses
 * ya da titreşim seçtiği yüzeyin kanalı her 15 dk silinir ve Android 8+ o bildirimi
 * HİÇ göstermez. Yeni yüzey buraya bir kaynak ekler; ikinci bir toplayıcı YAZILMAZ.
 *
 * Kaynaklar DİSKTEN okur (arka plan görevinde yüzey servisi aynı süreçte hiç
 * çalışmamış olabilir) ve HAM ayarı verir; sesler `MuhafizKanalServisi` içinde
 * yüzeyin kendi turuyla AYNI doğrulamadan geçer (kanal id paritesi). Okuma hatası
 * FIRLATIR → çağıran o turda toplamayı atlar (bilinmeyeni silmek yerine öksüzü
 * bir tur daha tutmak yeğdir).
 */
import type { SeviyeAyari } from '../../core/muhafiz/matrisTipleri';
import type { PencereYonu } from '../../core/muhafiz/pencereTipleri';
import { LocalNafileServisi } from '../../data/local/LocalNafileServisi';
import { LocalCumaHatirlatmaServisi } from '../../data/local/LocalCumaHatirlatmaServisi';

/** Bir yüzeyin AÇIK adım dizisi. */
export interface EkAdimDizisi {
    yon: PencereYonu;
    adimlar: SeviyeAyari[];
    /**
     * Bildirim kanalı ORTAK uzaydan mı? (Uyandırmalı teheccüd kendi `nafile_uyandirma`
     * kanalından gider → kanal korumasına girmez; gerçek alarm kanalları yine girer.)
     */
    kanalKullanir: boolean;
}

export interface EkHatirlatmaKaynagi {
    /** Tanı/log adı. */
    ad: string;
    /** Diskten YALNIZ açık dizileri okur. Okuma hatası fırlatır. */
    diziler(): Promise<EkAdimDizisi[]>;
}

const nafileKaynagi: EkHatirlatmaKaynagi = {
    ad: 'nafile',
    diziler: async () => {
        // KATI okuma: disk okunamazsa fırlatır → o turda çöp toplama yapılmaz.
        const a = await LocalNafileServisi.getAyarlarKati();
        const sonuc: EkAdimDizisi[] = [];
        for (const g of [a.hatirlatmalar.kusluk, a.hatirlatmalar.evvabin]) {
            if (g.aktif) sonuc.push({ yon: g.yon, adimlar: g.adimlar, kanalKullanir: true });
        }
        if (a.teheccud.aktif) {
            sonuc.push({ yon: a.teheccud.yon, adimlar: a.teheccud.adimlar, kanalKullanir: !a.teheccud.uyandirma });
        }
        return sonuc;
    },
};

/** Cuma (#173): tek adım dizisi, yön sabit (öğle girişine kalan). KATI okuma: disk okunamazsa fırlatır. */
const cumaKaynagi: EkHatirlatmaKaynagi = {
    ad: 'cuma',
    diziler: async () => {
        const a = await LocalCumaHatirlatmaServisi.getAyarlarKati();
        return a.aktif ? [{ yon: 'cikisaDogru', adimlar: a.adimlar, kanalKullanir: true }] : [];
    },
};

/** Kayıtlı kaynaklar — yeni yüzey (camiye gitme, yatış, takvim) buraya EKLENİR. */
const KAYNAKLAR: readonly EkHatirlatmaKaynagi[] = [nafileKaynagi, cumaKaynagi];

/** Kayıtlı kaynaklar (sıra önemsiz). */
export function ekHatirlatmaKaynaklari(): readonly EkHatirlatmaKaynagi[] {
    return KAYNAKLAR;
}

/** Tüm kaynakların açık dizileri. Bir kaynak okunamazsa FIRLATIR. */
export async function ekAdimDizileriniOku(): Promise<EkAdimDizisi[]> {
    const sonuc: EkAdimDizisi[] = [];
    for (const k of KAYNAKLAR) sonuc.push(...(await k.diziler()));
    return sonuc;
}
