/**
 * "Vakit çıkmadan" (Namaz Muhafızı) ayrıntı sayfası — Hatırlatmalar sayfasından açılır.
 *
 * Sade tasarım (Dalga 3): önce resim, sonra bir cümle, en son ayrıntı.
 *   Üst — düzey seçici (Kapalı · Hafif · Normal · Yoğun · [Kendi ayarınız]); Hatırlatmalar
 *         sayfasıyla AYNI bileşen ve AYNI kanca (`useMuhafizDuzeyi`).
 *   "Kendim ayarlayayım" katı (kapalı başlar) — 5 vakit kartı (dinamik özet) → vakit
 *         açılınca 1..6 hatırlatması (ekle/sil) + "Tüm vakitlere uygula" → adıma dokununca
 *         detay (ne zaman / nasıl / gelişmiş).
 *
 * Yazma yolu: matris `matrisiGuncelle` ile yazılır. Eski `esikler`/`sikliklar`
 * alanlarına DOKUNULMAZ — motor adaptörü (Faz 3) onları matristen devralacak.
 */

import * as React from 'react';
import { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    muhafizAyarlariniGuncelle,
    matrisiGuncelle,
    ozelMatrisYedegiGuncelle,
    HATIRLATMA_PRESETLERI,
} from '../store/muhafizSlice';
import { BildirimModali } from '../components/common/BildirimModali';
import type { MuhafizMatrisi, MuhafizVakti, VakitMuhafizAyari } from '../../core/muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI } from '../../core/muhafiz/matrisTipleri';
import { presetVakteUygula, tumVakitlereUygula, zamanlamaDegistiMi } from '../../core/muhafiz/matrisIslemleri';
import { VakitDuzeyListesi, ortakDuzeyiBul, type VakitDuzeyi } from '../components/hatirlatma/VakitDuzeyListesi';
import { geceSessizliginePencereyiUyarla, geceSessizliginiNormalize } from '../../core/muhafiz/geceSessizligi';
import { eskidenMatriseGoc } from '../../core/muhafiz/muhafizGoc';
import { adimKapaliMi } from '../../core/muhafiz/kanalKumesi';
import { adimEkle, adimSil, adimSilinebilirMi } from '../../core/muhafiz/adimDuzenleme';
import { VAKIT_ADLARI } from '../../core/utils/muhafizMetinYardimcisi';
import { pencereUzunluguDkHesapla } from '../../core/muhafiz/pencereUzunlugu';
import { NamazVaktiHesaplayiciServisi } from '../../domain/services/NamazVaktiHesaplayiciServisi';
import { Logger } from '../../core/utils/Logger';
import { HatirlatmaModulu } from '../components/hatirlatma/HatirlatmaModulu';
import type { AdimRizasi } from '../components/hatirlatma/AdimDetayModal';
import type { HatirlatmaIslemleri } from '../hooks/useHatirlatmaDuzenleyici';
import { vakitPencereTanimi } from '../components/hatirlatma/pencereTanimi';
import { usePlatformYetenekleri } from '../hooks/usePlatformYetenekleri';
import { vaktinYonunuDegistir } from '../../core/muhafiz/matrisIslemleri';
import type { PencereYonu } from '../../core/muhafiz/pencereTipleri';
import { useTurkceTtsDestegi } from '../hooks/useTurkceTtsDestegi';
import { useGenelRiza } from '../hooks/useGenelRiza';
import { useMuhafizPlanlama } from '../hooks/useMuhafizPlanlama';
import { useMuhafizDuzeyi } from '../hooks/useMuhafizDuzeyi';
import { DuzeyOnizlemesi } from '../components/hatirlatma/DuzeyOnizlemesi';
import { DuzeySecici } from '../components/hatirlatma/DuzeySecici';
import { BolumBasligi } from '../components/ortak/BolumBasligi';
import { VurguSaglayici } from '../components/ayar/VurguSaglayici';
import { useVurguKurulumu } from '../components/ayar/useVurguKurulumu';
import { AyarCapasi } from '../components/ayar/AyarCapasi';
import { nafileAyariniGuncelle } from '../store/nafileSlice';
import type { HatirlatmaYogunlugu } from '../store/muhafizSlice';
import type { NafileAyarlari } from '../../core/nafile/nafileTipleri';
import { useBildirimButcesi } from '../hooks/useBildirimButcesi';
import { useButceRehberi } from '../hooks/useButceRehberi';
import { BildirimButceKarti } from '../components/bildirim/BildirimButceKarti';
import type { DefterGirdisi } from '../../core/bildirim/bildirimDefteri';

/**
 * Bildirim sınırı rehberinin geri alma yedeği (Fable: `butceYedegi`). Öneri
 * matrisi, yoğunluğu (zamanlama değişince 'ozel'e döner), özel yedeği
 * (`matrisiYaz` onu da ezer) ve nafile ufkunu değiştirebilir — hepsi geri gelir.
 */
interface ButceYedegi {
    matris: MuhafizMatrisi;
    yogunluk: HatirlatmaYogunlugu;
    ozelMatrisYedegi?: MuhafizMatrisi;
    nafileGunuGunune: boolean;
}

type PresetYogunlugu = 'hafif' | 'normal' | 'yogun';

export const MuhafizAyarlariSayfasi: React.FC = () => {
    return (
        <VurguSaglayici>
            <MuhafizAyarlariIcerik />
        </VurguSaglayici>
    );
};

/**
 * İçerik bileşeni `VurguSaglayici` altında yaşar — `useVurguKurulumu()`
 * yalnızca sağlayıcı içinde çağrılabilir.
 */
const MuhafizAyarlariIcerik: React.FC = () => {
    const renkler = useRenkler();
    const scrollRef = useVurguKurulumu();
    const dispatch = useAppDispatch();
    const muhafizAyarlari = useAppSelector((state) => state.muhafiz);
    const konumAyarlari = useAppSelector((state) => state.konum);
    const sayacAyarlari = useAppSelector((state) => state.vakitSayac?.ayarlar);
    // TEK RIZA (Dalga 3): sesli okuma / gerçek alarm onayı tüm hatırlatmalar için ortak.
    const genelRiza = useGenelRiza();

    const [acikVakit, setAcikVakit] = useState<MuhafizVakti | null>(null);
    const [tumuneOnayi, setTumuneOnayi] = useState<MuhafizVakti | null>(null);
    // "Kendim ayarlayayım" katı: vakit vakit adımlar gelişmiştir → kapalı başlar; kendi
    // ayarı olan kullanıcı (yoğunluk 'ozel') onu zaten kullandığı için açık başlar.
    const [kendimAcik, setKendimAcik] = useState(muhafizAyarlari.yogunluk === 'ozel');
    const kendimOzeti =
        muhafizAyarlari.yogunluk === 'ozel'
            ? 'Kendi ayarınız kullanılıyor'
            : 'Her vakti ayrı ayarlayın';
    /** Adım detayı açılırken matris + yoğunluk (kapanışta sığma simülasyonu için). */
    const detayOncesiRef = useRef<{
        matris: MuhafizMatrisi;
        yogunluk: HatirlatmaYogunlugu;
        ozelMatrisYedegi?: MuhafizMatrisi;
    } | null>(null);
    const nafileAyarlari = useAppSelector((state) => state.nafile?.ayarlar) as NafileAyarlari | undefined;

    // Faz 5: cihazda Türkçe konuşma paketi yoksa sesli modlarda kibar uyarı
    // gösterilir (engelleme YOK — ayar yine kaydedilir).
    const ttsDestekli = useTurkceTtsDestegi();
    // Platform bilgisi ekrana BURADAN girer ve `PencereTanimi` uzerinden
    // bilesenlere tasinir; hicbir hatirlatma bileseni `Platform.OS` okumaz.
    const yetenekler = usePlatformYetenekleri();

    // Matris Faz 1'de opsiyonel (eski kayıtlarda olmayabilir) → göçle türet.
    const matris: MuhafizMatrisi = useMemo(
        () => muhafizAyarlari.matris ?? eskidenMatriseGoc(muhafizAyarlari),
        [muhafizAyarlari]
    );

    /**
     * Vakitlerin BUGÜNKÜ pencere uzunlukları (dk) — eşik tavanı buradan gelir (Faz 0).
     *
     * Sabit 120 dk tavan vakitlerin gerçek süresini yok sayıyordu: yatsı kışın
     * ~11 saat sürer (kullanıcı 3 saat önceden hatırlatılamıyordu), sabah vakti
     * ise çoğu gün 1,5 saati bulmaz (kurulabilen 120 dk'lık adım hiç çalışmazdı).
     *
     * Konum/vakit hesabı yoksa (`getGunlukVakitler` null) harita BOŞ kalır ve
     * ekran eski davranışa döner — yanlış alarm vermektense sessiz kalırız.
     */
    const { vakitPencereleri: hamPencereler, vakitPencereAnlari: hamAnlar } = useMemo(() => {
        const bos = {
            vakitPencereleri: {} as Partial<Record<MuhafizVakti, number>>,
            vakitPencereAnlari: {} as Partial<Record<MuhafizVakti, { baslangic: Date; bitis: Date }>>,
        };
        try {
            const hesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
            const bugun = new Date();
            const vakitler = hesaplayici.getGunlukVakitler(bugun);
            if (!vakitler) return bos;

            // Yatsı penceresi YARININ imsağına kadar sürer (gece yarısını aşar).
            const yarin = new Date(bugun);
            yarin.setDate(yarin.getDate() + 1);
            const yarinVakitleri = hesaplayici.getGunlukVakitler(yarin);

            // Giriş/çıkış ANLARI zaman şeridinin saat etiketleri içindir. Yarının
            // imsağı alınamazsa yatsının bitişi sarma kuralıyla (uzunluktan) türetilir.
            const anlar: Record<MuhafizVakti, { baslangic: Date; bitis: Date }> = {
                imsak: { baslangic: vakitler.imsak, bitis: vakitler.gunes },
                ogle: { baslangic: vakitler.ogle, bitis: vakitler.ikindi },
                ikindi: { baslangic: vakitler.ikindi, bitis: vakitler.aksam },
                aksam: { baslangic: vakitler.aksam, bitis: vakitler.yatsi },
                yatsi: { baslangic: vakitler.yatsi, bitis: yarinVakitleri?.imsak ?? vakitler.imsak },
            };
            const uzunluklar = {} as Record<MuhafizVakti, number>;
            for (const vakit of MUHAFIZ_VAKITLERI) {
                uzunluklar[vakit] = pencereUzunluguDkHesapla(anlar[vakit].baslangic, anlar[vakit].bitis);
                // Bitiş başlangıçtan önceyse (sarma) şerit için gerçek anı kur.
                if (anlar[vakit].bitis.getTime() <= anlar[vakit].baslangic.getTime()) {
                    anlar[vakit] = {
                        baslangic: anlar[vakit].baslangic,
                        bitis: new Date(anlar[vakit].baslangic.getTime() + uzunluklar[vakit] * 60000),
                    };
                }
            }
            return { vakitPencereleri: uzunluklar, vakitPencereAnlari: anlar };
        } catch (hata) {
            Logger.warn('MuhafizAyarlari', 'Vakit pencereleri hesaplanamadi', hata);
            return bos;
        }
    }, []);

    /**
     * GECE SESSİZLİĞİ — YATSI ÇAPASI: motor yatsıyı etkin pencereyle (`geceSessizliginePencereyiUyarla`)
     * planladığı için ekran da (eşik tavanı, zaman şeridi, akış önizlemesi) AYNI pencereyi kullanır;
     * yoksa şerit imsağa kala uyarı gösterirken telefon 23:00'e kala konuşurdu. Yatsı sessizlikten
     * sonra giriyorsa (`yatsiDustu`) satır bunu söyler.
     */
    const geceSessizligi = geceSessizliginiNormalize(muhafizAyarlari.geceSessizligi);
    const { vakitPencereleri, vakitPencereAnlari, yatsiDustu } = useMemo(() => {
        const yatsi = hamAnlar.yatsi;
        if (!yatsi || !geceSessizligi?.aktif) return { vakitPencereleri: hamPencereler, vakitPencereAnlari: hamAnlar, yatsiDustu: false };
        const b = yatsi.baslangic;
        const tarih = `${b.getFullYear()}-${String(b.getMonth() + 1).padStart(2, '0')}-${String(b.getDate()).padStart(2, '0')}`;
        const etkin = geceSessizliginePencereyiUyarla(geceSessizligi, { vakit: 'yatsi', tarih, giris: b, cikis: yatsi.bitis });
        if (!etkin) return { vakitPencereleri: hamPencereler, vakitPencereAnlari: hamAnlar, yatsiDustu: true };
        return {
            vakitPencereleri: { ...hamPencereler, yatsi: pencereUzunluguDkHesapla(b, etkin.cikis) },
            vakitPencereAnlari: { ...hamAnlar, yatsi: { baslangic: b, bitis: etkin.cikis } },
            yatsiDustu: false,
        };
    }, [hamPencereler, hamAnlar, geceSessizligi]);

    /**
     * Ekranda yapılan değişikliği GERÇEK plana yansıtır (debounce'lu; çıkışta hemen) —
     * Hatırlatmalar sayfasıyla AYNI kanca (`useMuhafizPlanlama`, gerekçe orada).
     */
    const { planlamayiKuyrugaAl } = useMuhafizPlanlama({
        aktif: muhafizAyarlari.aktif,
        matris,
        koordinatlar: konumAyarlari.koordinatlar,
        sayacAyarlari,
    });

    /** Düzey seçimi (kapalı / hafif / normal / yoğun / kendi ayarınız) — Hatırlatmalar sayfasıyla ortak. */
    const duzey = useMuhafizDuzeyi(planlamayiKuyrugaAl);

    /**
     * Matrisi yaz + spec 4.1: elle ZAMANLAMA (eşik/sıklık) değişikliği yoğunluğu
     * 'ozel' yapar. Mod/ses/anons değişikliği yoğunluğu değiştirmez.
     */
    const matrisiYaz = useCallback(
        (yeni: MuhafizMatrisi) => {
            dispatch(matrisiGuncelle(yeni));
            if (muhafizAyarlari.yogunluk !== 'ozel' && zamanlamaDegistiMi(matris, yeni)) {
                dispatch(muhafizAyarlariniGuncelle({ yogunluk: 'ozel' }));
            }
            // Elle yapılan HER değişiklik yedeklenir — zamanlama olsun (yoğunluk
            // 'ozel'e döner) olmasın (kanal/ses/anons; yoğunluk preset kalır, spec 4.1).
            // Kanal/ses değişikliğini yedeklemezsek sonraki preset dokunuşu onu UYARISIZ
            // siler ve "Özel" seçeneği de görünmediği için geri dönüş kalmaz.
            // (Preset uygulaması `matrisiYaz`'dan GEÇMEZ → yedeği ezmez.)
            dispatch(ozelMatrisYedegiGuncelle(yeni));
            planlamayiKuyrugaAl();
        },
        [dispatch, matris, muhafizAyarlari.yogunluk, planlamayiKuyrugaAl]
    );

    /**
     * BİLDİRİM SINIRI REHBERİ (issue #298). Sayı gerçek plan üreticilerinin
     * kuru çalışmasından gelir; öneriler tek dokunuşla uygulanır ve geri alınır.
     */
    const butce = useBildirimButcesi();
    const rehber = useButceRehberi<ButceYedegi>(butce, {
        yaz: (hedef: DefterGirdisi) => {
            const hedefMatris = hedef.muhafiz?.matris;
            if (hedefMatris && hedefMatris !== matris) matrisiYaz(hedefMatris);
            const hedefGunuGunune = hedef.nafile?.gunuGununeKur === true;
            if (nafileAyarlari && hedefGunuGunune !== (nafileAyarlari.gunuGununeKur === true)) {
                dispatch(nafileAyariniGuncelle({ gunuGununeKur: hedefGunuGunune }));
            }
        },
        yedekAl: () => ({
            matris,
            yogunluk: muhafizAyarlari.yogunluk,
            ozelMatrisYedegi: muhafizAyarlari.ozelMatrisYedegi,
            nafileGunuGunune: nafileAyarlari?.gunuGununeKur === true,
        }),
        geriYukle: (yedek) => {
            dispatch(matrisiGuncelle(yedek.matris));
            dispatch(muhafizAyarlariniGuncelle({ yogunluk: yedek.yogunluk }));
            // KOŞULSUZ: yedek yoksa açıkça temizlenir (öneri `matrisiYaz` ile yedek
            // yazmış olabilir; buradaki kapanış o yazımı görmeyecek kadar bayat olabilir).
            dispatch(ozelMatrisYedegiGuncelle(yedek.ozelMatrisYedegi));
            if (nafileAyarlari && yedek.nafileGunuGunune !== (nafileAyarlari.gunuGununeKur === true)) {
                dispatch(nafileAyariniGuncelle({ gunuGununeKur: yedek.nafileGunuGunune }));
            }
            planlamayiKuyrugaAl();
        },
    });

    /**
     * Yön değişiminin SONUCU (saf — dispatch yok). Hem gerçek değişim hem de "?"
     * modalının diğer yönü önizlemesi AYNI hesaptan geçer; ayrışırlarsa modal,
     * kullanıcı dokununca gerçekte olacak olandan farklı bir resim gösterirdi.
     */
    const yonDegisiminiHesapla = useCallback(
        (vakit: MuhafizVakti, yon: PencereYonu) => {
            const yogunluk = muhafizAyarlari.yogunluk;
            // Çıkışa dönerken taban tablo: kullanıcının preset'i; 'ozel'/bilinmeyen
            // ise 'normal'. (Giriş tarafını `vaktinYonunuDegistir` kendi seçer.)
            const cikisZamanlamasi = (
                yogunluk in HATIRLATMA_PRESETLERI
                    ? HATIRLATMA_PRESETLERI[yogunluk as PresetYogunlugu]
                    : HATIRLATMA_PRESETLERI.normal
            ).seviyeler;
            return vaktinYonunuDegistir(matris[vakit], vakit, yon, cikisZamanlamasi, yogunluk);
        },
        [matris, muhafizAyarlari.yogunluk]
    );

    /**
     * Pencere yönünü değiştirir.
     *
     * `vaktinYonunuDegistir` ÜÇ İŞİ ATOMİK yapar — üçü de zorunlu:
     *  1. **Metin çevirisi.** Hücrede duran otomatik doldurulmuş çıkış dilli şablon
     *     ("… vakti çıkıyor, son {süre} dakika") yön girişe çevrilince "son 42
     *     dakika" diye seslendirilir. Yalnız havuzdaki bir şablonla BİREBİR eşleşen
     *     metin çevrilir; kullanıcının kendi yazdığına dokunulmaz.
     *  2. **Zamanlamayı hedef yöne göre yeniden kurma.** Eskiden yapılmıyordu ve
     *     yaşanmış hata buydu: çıkış eşikleri (45/25/10/3) giriş yönünde kalınca
     *     eskalasyon TERSİNE dönüyor, en büyük eşikten sonra motor tümden susuyordu.
     *  3. **Ayrılan yönün zamanlamasını yedekleme** — geri dönülünce kaybolmasın.
     *
     * `yon` alanını da fonksiyon yazar; burada AYRICA yazılmaz.
     *
     * `matrisiYaz`'DAN GEÇMEZ (bilinçli): o yol zamanlama değişikliğini görüp
     * yoğunluğu 'ozel' yapardı. Oysa yön değişimi preset'in KENDİ giriş varyantını
     * yazıyor — matris hâlâ o preset'tir. 'ozel'e düşseydi preset çipi söner ve
     * preset'e dönüş "özel ayarlarınız kaybolacak" onayı isterdi (kaybolacak bir
     * şey yokken). Yedek + planlama yine yazılır.
     */
    const yonDegistir = useCallback(
        (vakit: MuhafizVakti, yon: PencereYonu) => {
            const yeniVakit = yonDegisiminiHesapla(vakit, yon);
            if (yeniVakit === matris[vakit]) return; // değişen bir şey yok

            const yeniMatris = { ...matris, [vakit]: yeniVakit };
            dispatch(matrisiGuncelle(yeniMatris));
            dispatch(ozelMatrisYedegiGuncelle(yeniMatris));
            planlamayiKuyrugaAl();
        },
        [dispatch, matris, yonDegisiminiHesapla, planlamayiKuyrugaAl]
    );

    /**
     * Vaktin adım dönüşümleri — birleşik hatırlatma modülü (`useHatirlatmaDuzenleyici`) bunları
     * çağırır. Ekle / sil (issue #274) ZAMANLAMA değişikliğidir (`zamanlamaDegistiMi`) →
     * `matrisiYaz` yoğunluğu 'ozel' yapar, özel yedeği yazar, planı debounce'la tazeler.
     * `guncelle` vaktin `yon` alanını TAŞIR (`...v`): yalnız `seviyeler` yazılsaydı bir adımı
     * düzenlemek yönü SESSİZCE varsayılana döndürürdü.
     */
    const vakitIslemleri = useMemo(() => {
        const sonuc = {} as Record<MuhafizVakti, HatirlatmaIslemleri<VakitMuhafizAyari>>;
        for (const vakit of MUHAFIZ_VAKITLERI) {
            sonuc[vakit] = {
                adimlar: (v) => v.seviyeler,
                ekle: (v) => adimEkle(v, vakitPencereleri[vakit]),
                guncelle: (v, i, seviye) => ({ ...v, seviyeler: v.seviyeler.map((x, j) => (j === i ? seviye : x)) }),
                sil: (v, i) => adimSil(v, i),
            };
        }
        return sonuc;
    }, [vakitPencereleri]);

    /**
     * Modülün yazıcısı. YAPISAL ARTIŞ (adım ekleme, kapalı adımı açma — liste anahtarı ya da
     * detaydaki "Açın") ANINDA sığma simülasyonundan geçer (issue #298): sığmayan hatırlatma
     * EKLENMEZ, rehber nedenini gösterir. Detaydaki diğer değişiklikler (ör. tekrarı
     * sıklaştırmak) kapanışta simüle edilir (`detayKapandi`). Kanal değişikliği zamanlama
     * değildir → yoğunluk 'ozel'e düşmez (`matrisiYaz` karar verir). Rıza (sesli / alarm)
     * yalnız onay modalında verilir ve `muhafizSlice`'a yazılır.
     */
    const vakitYaz = useCallback(
        (vakit: MuhafizVakti, yeni: VakitMuhafizAyari, riza: AdimRizasi): boolean => {
            const eski = matris[vakit].seviyeler;
            const artis =
                yeni.seviyeler.length > eski.length ||
                yeni.seviyeler.some((x, i) => !!eski[i] && adimKapaliMi(eski[i].kanallar) && !adimKapaliMi(x.kanallar));
            const yeniMatris = { ...matris, [vakit]: yeni };
            if (artis && !rehber.degisikligiDene({ matris: yeniMatris })) return false;
            // Rıza (tek rıza, Dalga 3) ORTAK kayda gider; yüzeyin kendi alanına yazılmaz.
            genelRiza.ver(riza);
            matrisiYaz(yeniMatris);
            return true;
        },
        [matris, matrisiYaz, rehber, genelRiza]
    );

    /** Adım detayı açıldı — kapanışta sığma simülasyonu için önceki hâli sakla. */
    const detayAcildi = useCallback(() => {
        detayOncesiRef.current = {
            matris,
            yogunluk: muhafizAyarlari.yogunluk,
            ozelMatrisYedegi: muhafizAyarlari.ozelMatrisYedegi,
        };
    }, [matris, muhafizAyarlari.yogunluk, muhafizAyarlari.ozelMatrisYedegi]);

    /**
     * Detay kapanışı = planlama anı. Modalda yapılan değişiklik sınırı aşırıyorsa geri alınır
     * ve rehber açılır; öneriyle yer açılınca değişiklik öneriyle birlikte yazılır.
     */
    const detayKapandi = useCallback(() => {
        const once = detayOncesiRef.current;
        detayOncesiRef.current = null;
        if (!once || once.matris === matris) return;
        const sigdi = rehber.degisikligiDene(
            { matris },
            { once: { matris: once.matris }, baslik: 'Bu değişiklik sığmıyor' }
        );
        if (sigdi) return;
        dispatch(matrisiGuncelle(once.matris));
        // `matrisiYaz` her dokunuşta özel yedeği de yazdı — reddedilen değişiklik orada kalmasın.
        // Koşulsuz: önceden yedek yoksa açıkça temizlenir.
        dispatch(ozelMatrisYedegiGuncelle(once.ozelMatrisYedegi));
        if (once.yogunluk !== muhafizAyarlari.yogunluk) {
            dispatch(muhafizAyarlariniGuncelle({ yogunluk: once.yogunluk }));
        }
        planlamayiKuyrugaAl();
    }, [matris, rehber, dispatch, muhafizAyarlari.yogunluk, planlamayiKuyrugaAl]);

    /**
     * VAKİT BAŞINA DÜZEY: hazır düzey YALNIZ o vakte uygulanır (`presetVakteUygula`; yön,
     * ses, anons, gerçek alarm korunur). Sesli adım rıza yoksa bildirimle kurulur. Yapısal
     * artış (adım sayısı) sığma simülasyonundan geçer. Genel düzey türetilir: beş vakit
     * aynı hazır düzeydeyse o, değilse "Kendi ayarınız" (önceki matris özel yedeğe yazılır).
     */
    const vakitDuzeyiSec = useCallback(
        (vakit: MuhafizVakti, d: VakitDuzeyi) => {
            const yeniVakit = presetVakteUygula(matris[vakit], vakit, HATIRLATMA_PRESETLERI[d].seviyeler, genelRiza.sesli, d);
            const yeni = { ...matris, [vakit]: yeniVakit };
            if (yeniVakit.seviyeler.length > matris[vakit].seviyeler.length && !rehber.degisikligiDene({ matris: yeni })) return;
            dispatch(matrisiGuncelle(yeni));
            const ortak = ortakDuzeyiBul(yeni) ?? 'ozel';
            if (ortak !== muhafizAyarlari.yogunluk) dispatch(muhafizAyarlariniGuncelle({ yogunluk: ortak }));
            dispatch(ozelMatrisYedegiGuncelle(yeni));
            planlamayiKuyrugaAl();
        },
        [dispatch, genelRiza.sesli, matris, muhafizAyarlari.yogunluk, planlamayiKuyrugaAl, rehber]
    );

    const tumVakitlereUygulaOnayla = useCallback(() => {
        if (!tumuneOnayi) return;
        matrisiYaz(tumVakitlereUygula(matris, tumuneOnayi));
        setTumuneOnayi(null);
    }, [tumuneOnayi, matris, matrisiYaz]);

    return (
        <>
            <ScrollView ref={scrollRef} className="flex-1 p-4" style={{ backgroundColor: renkler.arkaplan }}>
                {/* ── DÜZEY (kapalı + yoğunluk) — Hatırlatmalar sayfasıyla AYNI seçici ── */}
                <AyarCapasi id="muhafizAnaSwitch">
                <AyarCapasi id="muhafizYogunluk">
                <View className="mt-2 mb-4">
                    <BolumBasligi metin="Ne kadar hatırlatalım?" />
                    <DuzeySecici
                        secili={duzey.secili}
                        onSec={duzey.sec}
                        ozelGoster={duzey.ozelVar}
                        // Sesli onay modalla alınır (TEK RIZA); ayrı bilgi maddesi gerekmez.
                        sesliBilgiGoster={false}
                        sesliIzinVar={genelRiza.sesli}
                        eskiDuzey={duzey.eskiDuzey}
                        testID="muhafiz-duzey"
                    />
                    {/* Görsel anlatı: seçilen düzeyin uyarıları zaman rayında — girişte ve
                        düzey değişince BİR KEZ oynar (ayar ekranında döngü yok). */}
                    {duzey.secili !== 'ozel' ? <DuzeyOnizlemesi seviyeler={duzey.onizlemeSeviyeleri} duzey={duzey.secili} sesliAcik={duzey.sesliAcik} testID="muhafiz-duzey-onizlemesi" /> : null}
                </View>
                </AyarCapasi>
                </AyarCapasi>

                {/* ── BİLDİRİM SINIRI (issue #298) — üstte tek kart ── */}
                <BildirimButceKarti ozet={butce.ozet} onPress={rehber.karttanAc} />

                {muhafizAyarlari.aktif && (
                    <>
                        {/* ── VAKİT VAKİT — tek vakte düzey (ayrıntıya girmeden). Orta katman:
                            "Kendim ayarlayayım" açılınca vakit kartları onun yerini alır. ── */}
                        {!kendimAcik ? (
                            <>
                                <BolumBasligi metin="Vakit vakit" />
                                <VakitDuzeyListesi
                                    matris={matris}
                                    onSec={vakitDuzeyiSec}
                                    geceSessiz={geceSessizligi?.aktif === true}
                                    yatsiDustu={yatsiDustu}
                                />
                            </>
                        ) : null}

                        {/* ── KENDİM AYARLAYAYIM — vakit vakit adımlar (gelişmiş katı) ──
                            Kapalı başlar (kendi ayarınız varken açık); kapalıyken özet görünür. */}
                        <TouchableOpacity
                            testID="kendim-ayarlayayim"
                            className="flex-row items-center p-4 rounded-2xl border mb-3"
                            style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir, minHeight: 56 }}
                            onPress={() => setKendimAcik((a) => !a)}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityState={{ expanded: kendimAcik }}
                            accessibilityLabel={`Kendim ayarlayayım. ${kendimOzeti}`}
                        >
                            <View
                                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                style={{ backgroundColor: `${renkler.birincil}20` }}
                            >
                                <FontAwesome5 name="sliders-h" size={16} color={renkler.birincil} solid />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                                    Kendim ayarlayayım
                                </Text>
                                <Text className="text-sm mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    {kendimOzeti}
                                </Text>
                            </View>
                            <FontAwesome5 name={kendimAcik ? 'chevron-up' : 'chevron-down'} size={13} color={renkler.metinIkincil} />
                        </TouchableOpacity>

                        {kendimAcik && MUHAFIZ_VAKITLERI.map((vakit) => (
                            <HatirlatmaModulu<VakitMuhafizAyari>
                                key={vakit}
                                tanim={vakitPencereTanimi(
                                    vakit,
                                    matris[vakit].yon,
                                    vakitPencereleri[vakit],
                                    yetenekler,
                                    vakitPencereAnlari[vakit]
                                )}
                                deger={matris[vakit]}
                                islemler={vakitIslemleri[vakit]}
                                yaz={(yeni, riza) => vakitYaz(vakit, yeni, riza)}
                                ttsDestekli={ttsDestekli}
                                sesliOnayiVar={genelRiza.sesli}
                                alarmOnayiVar={genelRiza.alarm}
                                sesliOnayMetinleri={{ altBaslik: `${VAKIT_ADLARI[vakit]} vaktinde sesli okuma` }}
                                silinebilirMi={adimSilinebilirMi}
                                adimAnahtari="herZaman"
                                onDetayAcildi={detayAcildi}
                                onDetayKapandi={detayKapandi}
                                acikMi={acikVakit === vakit}
                                onAcKapa={() => setAcikVakit((onceki) => (onceki === vakit ? null : vakit))}
                                onTumPencerelereUygula={() => setTumuneOnayi(vakit)}
                                onYonDegistir={(yon) => yonDegistir(vakit, yon)}
                                // Yalnız AÇIK kart için hesaplanır (tek kart açık olabilir).
                                karsiYonAyari={
                                    acikVakit === vakit
                                        ? yonDegisiminiHesapla(
                                            vakit,
                                            matris[vakit].yon === 'girisindenItibaren'
                                                ? 'cikisaDogru'
                                                : 'girisindenItibaren'
                                        )
                                        : undefined
                                }
                            />
                        ))}
                    </>
                )}

                <View className="h-10" />
            </ScrollView>

            {/* Sesli okuma onayı (TEK RIZA) — düzey seçiminden. */}
            {duzey.modal}

            {/* Bildirim sınırı rehberi: sayfa + GERİ AL şeridi */}
            {rehber.ogeler}

            {/* Tüm vakitlere uygula onayı (spec 3.3 {vakit} ipucu) */}
            <BildirimModali
                gorunur={tumuneOnayi !== null}
                tip="bilgi"
                baslik={tumuneOnayi ? `${VAKIT_ADLARI[tumuneOnayi]} ayarları kopyalansın mı?` : ''}
                mesaj={
                    tumuneOnayi
                        ? `${VAKIT_ADLARI[tumuneOnayi]} vaktinin tüm hatırlatmaları diğer vakitlere kopyalanır. Sesli okuma metnine vakit adını elle yazdıysanız, diğer vakitlerde de o ad okunur.`
                        : ''
                }
                birincilEtiket="Tümüne uygula"
                birincilIkon="clone"
                onBirincil={tumVakitlereUygulaOnayla}
                onKapat={() => setTumuneOnayi(null)}
                kapatEtiketi="Vazgeç"
            />
        </>
    );
};
