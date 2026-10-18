/**
 * Muhafız Ayarları Sayfası — vakit-merkezli (Faz 2).
 *
 * Üç katmanlı progressive disclosure (spec 2026-07-17-muhafiz-ekrani-ve-sesli-uyari):
 *   Katman 1 — ana switch + yoğunluk preset'i + 5 vakit satırı (dinamik özet)
 *   Katman 2 — vakit açılınca o vaktin 1..6 hatırlatması (ekle/sil) + "Tüm vakitlere uygula"
 *   Katman 3 — adıma dokununca detay (kanallar / eşik / sıklık / ses / anons metni)
 *
 * Yazma yolu: matris `matrisiGuncelle` ile yazılır. Eski `esikler`/`sikliklar`
 * alanlarına DOKUNULMAZ — motor adaptörü (Faz 3) onları matristen devralacak.
 */

import * as React from 'react';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Anahtar } from '../components/common/Anahtar';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    muhafizAyarlariniGuncelle,
    matrisiGuncelle,
    ozelMatrisYedegiGuncelle,
    ozelYogunluguGeriYukle,
    HATIRLATMA_PRESETLERI,
} from '../store/muhafizSlice';
import { useFeedback } from '../../core/feedback';
import { useKonumMetni } from '../hooks/useKonumMetni';
import { BildirimModali } from '../components/common/BildirimModali';
import type { MuhafizMatrisi, MuhafizVakti, VakitMuhafizAyari } from '../../core/muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI } from '../../core/muhafiz/matrisTipleri';
import {
    tumVakitlereUygula,
    presetUygula,
    presetSesliIceriyorMu,
    zamanlamaDegistiMi,
} from '../../core/muhafiz/matrisIslemleri';
import { eskidenMatriseGoc } from '../../core/muhafiz/muhafizGoc';
import { matrisGecerliMi } from '../../core/muhafiz/motorAdaptoru';
import { adimKapaliMi } from '../../core/muhafiz/kanalKumesi';
import { adimEkle, adimSil, adimSilinebilirMi } from '../../core/muhafiz/adimDuzenleme';
import { ANONS_SABLONLARI, anonsMetniniCoz } from '../../core/muhafiz/anonsMetni';
import { VAKIT_ADLARI } from '../../core/utils/muhafizMetinYardimcisi';
import {
    sayacBaslangicEsikleriHesapla,
    muhafizUyarilanVakitleriBul,
} from '../../core/utils/vakitSayacYardimcisi';
import { pencereUzunluguDkHesapla } from '../../core/muhafiz/pencereUzunlugu';
import { ArkaplanMuhafizServisi } from '../../domain/services/ArkaplanMuhafizServisi';
import { NamazVaktiHesaplayiciServisi } from '../../domain/services/NamazVaktiHesaplayiciServisi';
import { VakitSayacBildirimServisi } from '../../domain/services/VakitSayacBildirimServisi';
import { Logger } from '../../core/utils/Logger';
import { HatirlatmaModulu } from '../components/hatirlatma/HatirlatmaModulu';
import type { AdimRizasi } from '../components/hatirlatma/AdimDetayModal';
import type { HatirlatmaIslemleri } from '../hooks/useHatirlatmaDuzenleyici';
import { vakitPencereTanimi } from '../components/hatirlatma/pencereTanimi';
import { usePlatformYetenekleri } from '../hooks/usePlatformYetenekleri';
import { vaktinYonunuDegistir } from '../../core/muhafiz/matrisIslemleri';
import type { PencereYonu } from '../../core/muhafiz/pencereTipleri';
import { SesliOnayModal } from './MuhafizAyarlari/SesliOnayModal';
import { YOGUNLUK_BILGILERI } from './MuhafizAyarlari/sabitler';
import { ParcaliSecici } from '../components/hatirlatma/ParcaliSecici';

/** Yoğunluk seçicinin değerleri — üç hazır yoğunluk + kaydedilmiş özel ayar. */
type YogunlukSecimi = PresetYogunlugu | 'ozel';
import { useTurkceTtsDestegi } from '../hooks/useTurkceTtsDestegi';
import { useGenelRiza } from '../hooks/useGenelRiza';
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

/**
 * Ayar değişikliğinden sonra bildirimleri yeniden planlamadan önce beklenen süre.
 * Stepper'a arka arkaya basmak tek planlamaya iner; ekrandan çıkarken bekleyen
 * planlama zaten anında uygulanır.
 */
const YENIDEN_PLANLAMA_GECIKMESI_MS = 1200;

/** Ayarlar stack'i tiplenmemiş; `any` yerine ihtiyaç duyulan minimum yüzey. */
type AyarNavigasyonu = { navigate: (ekran: string) => void };

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
    const navigation = useNavigation() as unknown as AyarNavigasyonu;
    const { butonTiklandiFeedback } = useFeedback();
    const muhafizAyarlari = useAppSelector((state) => state.muhafiz);
    const konumAyarlari = useAppSelector((state) => state.konum);
    const sayacAyarlari = useAppSelector((state) => state.vakitSayac?.ayarlar);
    const konumMetni = useKonumMetni(konumAyarlari);
    // TEK RIZA (Dalga 3): sesli okuma / gerçek alarm onayı tüm hatırlatmalar için ortak.
    const genelRiza = useGenelRiza();

    const [acikVakit, setAcikVakit] = useState<MuhafizVakti | null>(null);
    const [presetOnayi, setPresetOnayi] = useState<PresetYogunlugu | null>(null);
    const [sesliOnayi, setSesliOnayi] = useState<PresetYogunlugu | null>(null);
    const [tumuneOnayi, setTumuneOnayi] = useState<MuhafizVakti | null>(null);
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
    const { vakitPencereleri, vakitPencereAnlari } = useMemo(() => {
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
     * Planlamada kullanılan güncel değerler. Debounce edilen geri çağrı kapanış
     * (closure) değil REF okur — gecikme boyunca değişen ayar kaybolmasın.
     */
    const planlamaVerisiRef = useRef({
        aktif: muhafizAyarlari.aktif,
        matris,
        koordinatlar: konumAyarlari.koordinatlar,
        sayacAyarlari,
    });
    planlamaVerisiRef.current = {
        aktif: muhafizAyarlari.aktif,
        matris,
        koordinatlar: konumAyarlari.koordinatlar,
        sayacAyarlari,
    };

    /**
     * Ekranda yapılan değişikliği GERÇEK plana yansıtır.
     *
     * NEDEN ZORUNLU: bildirimler vakit başına ÖNCEDEN planlanır ve kanal kimliği
     * seçilen sesin fonksiyonudur. Yeniden planlamazsak kullanıcı sesi/eşiği
     * değiştirip uygulamayı kapattığında o günün kalan bildirimleri ESKİ kanaldan
     * ESKİ sesle çalar → "ayarım kaydedilmedi" hissi.
     *
     * Vakit sayacı da yeniden kurulur: bastırma listesi (`muhafizUyarilanVakitler`)
     * ve sayaç başlangıç eşiği matristen türer; eksik geçilirse sayaç bastırması bozulur.
     */
    const yenidenPlanla = useCallback(async () => {
        const { aktif, matris: guncelMatris, koordinatlar, sayacAyarlari: sayac } =
            planlamaVerisiRef.current;
        try {
            await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({
                aktif,
                koordinatlar,
                matris: guncelMatris,
            });
            await VakitSayacBildirimServisi.getInstance().yapilandirVePlanla({
                aktif: sayac?.aktif === true,
                koordinatlar,
                baslangicEsikleri: sayacBaslangicEsikleriHesapla(
                    sayac?.sayacBaslangicSeviyesi,
                    guncelMatris
                ),
                muhafizAktif: aktif,
                muhafizUyarilanVakitler: muhafizUyarilanVakitleriBul(guncelMatris),
            });
        } catch (hata) {
            Logger.error('MuhafizAyarlari', 'Bildirimler yeniden planlanamadi', hata);
        }
    }, []);

    const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bekleyenPlanlamaRef = useRef(false);

    /** Değişikliği kuyruğa alır (debounce) — her dokunuşta planlama yapılmaz. */
    const planlamayiKuyrugaAl = useCallback(() => {
        bekleyenPlanlamaRef.current = true;
        if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
        zamanlayiciRef.current = setTimeout(() => {
            zamanlayiciRef.current = null;
            bekleyenPlanlamaRef.current = false;
            void yenidenPlanla();
        }, YENIDEN_PLANLAMA_GECIKMESI_MS);
    }, [yenidenPlanla]);

    // Ekrandan çıkışta bekleyen planlama varsa HEMEN uygula — kullanıcı ayarı
    // değiştirip geri tuşuna basabilir; bekleyen iş sessizce kaybolmamalı.
    useEffect(
        () => () => {
            if (zamanlayiciRef.current) clearTimeout(zamanlayiciRef.current);
            if (bekleyenPlanlamaRef.current) {
                bekleyenPlanlamaRef.current = false;
                void yenidenPlanla();
            }
        },
        [yenidenPlanla]
    );

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
     * Preset'i yazar. `sesliIzinVar` false ise SESLİ kanal kapanır (bildirim kanalı
     * açık kalır) — preset yine tümüyle uygulanır (kullanıcı hiçbir adımı kaybetmez).
     */
    const presetiUygula = useCallback(
        async (yogunluk: PresetYogunlugu, sesliIzinVar: boolean) => {
            await butonTiklandiFeedback();
            // Özelden çıkılıyorsa mevcut matrisi yedekle — matrisiYaz zaten sürekli
            // günceller ama eski/göçmüş kayıtlarda yedek eksik olabilir (güvenlik ağı).
            if (muhafizAyarlari.yogunluk === 'ozel') {
                dispatch(ozelMatrisYedegiGuncelle(matris));
            }
            const preset = HATIRLATMA_PRESETLERI[yogunluk];
            // Preset artık zamanlamanın YANI SIRA kanalları + aciliyeti de yazar;
            // korunan tek kullanıcı verisi anons metnidir.
            // `yogunluk` GEÇİLİR: giriş yönlü vakitler çıkış tablosunu değil kendi
            // yön tablosunu almalı, yoksa preset kartı ters eskalasyonu geri getirir.
            dispatch(
                matrisiGuncelle(presetUygula(matris, preset.seviyeler, sesliIzinVar, yogunluk))
            );
            dispatch(muhafizAyarlariniGuncelle({ yogunluk }));
            // Onay yalnız VERİLDİĞİNDE kalıcılaşır (ORTAK kayda — tek rıza); "sesli
            // olmadan uygula" bir daha sorulmasını engellemez (bilinçli).
            if (sesliIzinVar && !genelRiza.sesli) genelRiza.ver({ sesliOnayi: true });
            planlamayiKuyrugaAl();
        },
        [butonTiklandiFeedback, dispatch, matris, muhafizAyarlari.yogunluk, genelRiza, planlamayiKuyrugaAl]
    );

    /**
     * Preset uygulamasının son kapısı: sesli içeren bir yoğunluk İLK kez
     * seçiliyorsa önce bilgilendirme + onay modalı çıkar.
     */
    const presetiBaslat = useCallback(
        (yogunluk: PresetYogunlugu) => {
            const sesliVar = presetSesliIceriyorMu(HATIRLATMA_PRESETLERI[yogunluk].seviyeler);
            if (sesliVar && !genelRiza.sesli) {
                setSesliOnayi(yogunluk);
                return;
            }
            void presetiUygula(yogunluk, sesliVar);
        },
        [genelRiza.sesli, presetiUygula]
    );

    const yogunlukSec = useCallback(
        (yogunluk: PresetYogunlugu) => {
            if (yogunluk === muhafizAyarlari.yogunluk) {
                // ZATEN SEÇİLİ preset: normalde yapılacak bir şey yok. TEK istisna,
                // sesli içeren bir yoğunlukta sesli onayının hiç verilmemiş olması —
                // bu durumda kartın altyazısı "sesli" der ama hücreler 'bildirim'e
                // düşmüştür ve sessiz dönseydik kullanıcının sesliyi açmasının yolu
                // KALMAZDI (tek kaçış başka bir preset'e geçip zamanlamayı ezmek).
                const sesliVar = presetSesliIceriyorMu(HATIRLATMA_PRESETLERI[yogunluk].seviyeler);
                if (sesliVar && !genelRiza.sesli) setSesliOnayi(yogunluk);
                return;
            }
            // Elle ayarlanmış zamanlama varsa (yogunluk === 'ozel') önce onay iste.
            if (muhafizAyarlari.yogunluk === 'ozel') {
                setPresetOnayi(yogunluk);
                return;
            }
            presetiBaslat(yogunluk);
        },
        [muhafizAyarlari.yogunluk, genelRiza.sesli, presetiBaslat]
    );

    /** Onay modalındaki örnek okunuş — seçilen preset'in sesli adımının eşiğiyle. */
    const sesliOrnekMetni = useMemo(() => {
        if (!sesliOnayi) return '';
        const adimlar = HATIRLATMA_PRESETLERI[sesliOnayi].seviyeler;
        // Örnek, preset'in SESLİ ilk adımının eşiğiyle (yoksa son adım).
        const sesliAdim = adimlar.find((a) => a.kanallar.sesli) ?? adimlar[adimlar.length - 1];
        return anonsMetniniCoz(ANONS_SABLONLARI[0], 'ogle', sesliAdim.esikDk);
    }, [sesliOnayi]);

    /** "Özel" seçeneğine dönüş: yedeklenen matrisi geri yükler (onay istemez — veri kaybı yok). */
    const ozelSec = useCallback(() => {
        if (muhafizAyarlari.yogunluk === 'ozel') return;
        void butonTiklandiFeedback();
        dispatch(ozelYogunluguGeriYukle());
        planlamayiKuyrugaAl();
    }, [muhafizAyarlari.yogunluk, butonTiklandiFeedback, dispatch, planlamayiKuyrugaAl]);

    const tumVakitlereUygulaOnayla = useCallback(() => {
        if (!tumuneOnayi) return;
        matrisiYaz(tumVakitlereUygula(matris, tumuneOnayi));
        setTumuneOnayi(null);
    }, [tumuneOnayi, matris, matrisiYaz]);

    /** Son GPS güncelleme zamanının kısa metni */
    const sonGuncellemeKisaMetin = (): string | null => {
        if (konumAyarlari.konumModu !== 'oto' || !konumAyarlari.sonGpsGuncellemesi) {
            return null;
        }
        const farkMs = Date.now() - new Date(konumAyarlari.sonGpsGuncellemesi).getTime();
        const farkDakika = Math.floor(farkMs / (1000 * 60));
        const farkSaat = Math.floor(farkMs / (1000 * 60 * 60));
        const farkGun = Math.floor(farkMs / (1000 * 60 * 60 * 24));

        if (farkDakika < 1) return 'Az önce';
        if (farkDakika < 60) return `${farkDakika} dk önce`;
        if (farkSaat < 24) return `${farkSaat} sa önce`;
        return `${farkGun} gün önce`;
    };

    const ozelMi = muhafizAyarlari.yogunluk === 'ozel';

    return (
        <>
            <ScrollView ref={scrollRef} className="flex-1 p-4" style={{ backgroundColor: renkler.arkaplan }}>
                {/* ── ANA SWITCH ── */}
                <AyarCapasi id="muhafizAnaSwitch">
                <View
                    className="flex-row items-center justify-between p-5 rounded-2xl border-2 mb-4 mt-2"
                    style={{
                        backgroundColor: muhafizAyarlari.aktif ? renkler.birincil : renkler.kartArkaplan,
                        borderColor: muhafizAyarlari.aktif ? renkler.birincil : renkler.sinir,
                    }}
                >
                    <View className="flex-row items-center flex-1">
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center mr-4"
                            style={{ backgroundColor: muhafizAyarlari.aktif ? 'rgba(255,255,255,0.2)' : renkler.sinir }}
                        >
                            <FontAwesome5
                                name={muhafizAyarlari.aktif ? 'shield-alt' : 'moon'}
                                size={24}
                                color={muhafizAyarlari.aktif ? '#FFF' : renkler.metinIkincil}
                                solid
                            />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="text-xl font-bold"
                                style={{ color: muhafizAyarlari.aktif ? '#FFF' : renkler.metin }}
                            >
                                Namaz Muhafızı
                            </Text>
                            <Text
                                className="text-sm mt-0.5"
                                style={{ color: muhafizAyarlari.aktif ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil }}
                            >
                                {muhafizAyarlari.aktif ? 'Hatırlatmalar aktif' : 'Hatırlatmalar kapalı'}
                            </Text>
                        </View>
                    </View>
                    <Anahtar
                        value={muhafizAyarlari.aktif}
                        onValueChange={(val) => {
                            dispatch(muhafizAyarlariniGuncelle({ aktif: val }));
                            planlamayiKuyrugaAl();
                        }}
                        trackColor={{ false: renkler.sinir, true: 'rgba(255,255,255,0.3)' }}
                        thumbColor={muhafizAyarlari.aktif ? '#FFF' : '#f4f3f4'}
                        accessibilityLabel="Namaz Muhafızı"
                    />
                </View>
                </AyarCapasi>

                {/* ── KAPALI DURUM ── */}
                {!muhafizAyarlari.aktif && (
                    <View
                        className="items-center p-10 rounded-2xl border"
                        style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
                    >
                        <FontAwesome5 name="bed" size={48} color={renkler.metinIkincil} />
                        <Text className="text-base text-center mt-3" style={{ color: renkler.metinIkincil }}>
                            Muhafız kapalı. Namaz vakitleri hatırlatılmayacak.
                        </Text>
                    </View>
                )}

                {/* ── BİLDİRİM SINIRI (issue #298) — üstte tek kart ── */}
                <BildirimButceKarti ozet={butce.ozet} onPress={rehber.karttanAc} />

                {muhafizAyarlari.aktif && (
                    <>
                        {/* ── KONUM ── */}
                        <TouchableOpacity
                            className="flex-row items-center justify-between p-3.5 rounded-xl border mb-4"
                            style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
                            onPress={() => navigation.navigate('KonumAyarlari')}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={`Konum: ${konumMetni}. Konum ayarlarını açın.`}
                        >
                            <View className="flex-row items-center flex-1">
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: `${renkler.birincil}15` }}
                                >
                                    <FontAwesome5
                                        name={konumAyarlari.konumModu === 'oto' ? 'satellite-dish' : 'map-marker-alt'}
                                        size={16}
                                        color={renkler.birincil}
                                        solid
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[11px] font-medium tracking-wider" style={{ color: renkler.metinIkincil }}>
                                        KONUM {sonGuncellemeKisaMetin() && `• ${sonGuncellemeKisaMetin()}`}
                                    </Text>
                                    <Text className="text-base font-semibold mt-0.5" style={{ color: renkler.metin }}>
                                        {konumMetni}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-center">
                                {konumAyarlari.akilliTakipAktif && konumAyarlari.konumModu === 'oto' && (
                                    <View
                                        className="w-7 h-7 rounded-full items-center justify-center mr-1.5"
                                        style={{ backgroundColor: `${renkler.basarili}20` }}
                                    >
                                        <FontAwesome5 name="compass" size={12} color={renkler.basarili} />
                                    </View>
                                )}
                                <View
                                    className="px-2.5 py-1 rounded-lg mr-2"
                                    style={{
                                        backgroundColor: konumAyarlari.konumModu === 'oto'
                                            ? `${renkler.basarili}20`
                                            : `${renkler.bilgi}20`,
                                    }}
                                >
                                    <Text
                                        className="text-xs font-bold"
                                        style={{ color: konumAyarlari.konumModu === 'oto' ? renkler.basarili : renkler.bilgi }}
                                    >
                                        {konumAyarlari.konumModu === 'oto' ? 'GPS' : 'Manuel'}
                                    </Text>
                                </View>
                                <FontAwesome5 name="chevron-right" size={14} color={renkler.metinIkincil} />
                            </View>
                        </TouchableOpacity>

                        {/* ── YOĞUNLUK PRESET'İ ── */}
                        <AyarCapasi id="muhafizYogunluk">
                        <View
                            className="rounded-2xl border p-4 mb-4"
                            style={{ backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir }}
                        >
                            <View className="flex-row items-center mb-1">
                                <FontAwesome5 name="sliders-h" size={14} color={renkler.metinIkincil} solid />
                                <Text
                                    className="text-[11px] font-semibold tracking-wider ml-2 flex-1"
                                    style={{ color: renkler.metinIkincil }}
                                >
                                    HATIRLATMA YOĞUNLUĞU
                                </Text>
                                {ozelMi && (
                                    <View className="px-2 py-0.5 rounded-lg" style={{ backgroundColor: `${renkler.birincil}20` }}>
                                        <Text className="text-[11px] font-bold" style={{ color: renkler.birincil }}>
                                            Özel
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-xs mb-3" style={{ color: renkler.metinIkincil }}>
                                {ozelMi
                                    ? 'Zamanlamayı vakit vakit kendiniz ayarladınız.'
                                    : 'Tüm vakitlerin zamanlamasını tek dokunuşla ayarlayın.'}
                            </Text>

                            {/* Parçalı kısa seçici (eskiden üç büyük kart); seçili yoğunluğun
                                açıklaması altında TEK satır. "Özel" yalnız GEÇERLİ bir özel yedek
                                VARSA görünür — bozuk yedek dokunuşta matrise yazılır ve ekran her
                                açılışta çökerdi. */}
                            <ParcaliSecici<YogunlukSecimi>
                                secenekler={[
                                    ...YOGUNLUK_BILGILERI.map(({ id, etiket, ikon }) => ({
                                        deger: id as YogunlukSecimi,
                                        etiket,
                                        ikon,
                                        erisimEtiketi: `${etiket} yoğunluk — ${HATIRLATMA_PRESETLERI[id].aciklama}`,
                                    })),
                                    ...(matrisGecerliMi(muhafizAyarlari.ozelMatrisYedegi)
                                        ? [
                                            {
                                                deger: 'ozel' as YogunlukSecimi,
                                                etiket: 'Özel',
                                                ikon: 'sliders-h',
                                                erisimEtiketi: 'Özel yoğunluk — kaydedilmiş ayarlarınıza dönün',
                                            },
                                        ]
                                        : []),
                                ]}
                                secili={muhafizAyarlari.yogunluk as YogunlukSecimi}
                                onSec={(deger) => (deger === 'ozel' ? ozelSec() : yogunlukSec(deger))}
                            />
                            <Text testID="yogunluk-aciklamasi" className="text-xs mt-2" style={{ color: renkler.metinIkincil }}>
                                {ozelMi
                                    ? 'Kaydedilmiş özel ayarlarınız.'
                                    : (HATIRLATMA_PRESETLERI[muhafizAyarlari.yogunluk as PresetYogunlugu]?.aciklama ?? '')}
                            </Text>
                        </View>
                        </AyarCapasi>

                        {/* ── VAKİT LİSTESİ (Katman 1) ── */}
                        <View className="flex-row items-center mb-2 px-1">
                            <FontAwesome5 name="list-ul" size={13} color={renkler.metinIkincil} solid />
                            <Text
                                className="text-[11px] font-semibold tracking-wider ml-2"
                                style={{ color: renkler.metinIkincil }}
                            >
                                VAKİTLER
                            </Text>
                        </View>
                        <Text className="text-xs mb-3 px-1" style={{ color: renkler.metinIkincil }}>
                            Her vakti ayrı ayrı ayarlayabilirsiniz. Bir vakte dokunarak adımlarını görün.
                        </Text>

                        {MUHAFIZ_VAKITLERI.map((vakit) => (
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

            {/* Preset onayı — elle ayarlanmış zamanlama bu hazır yoğunluğa döner, ama
                kaybolmaz: yedeklenir ve "Özel"e dönünce geri gelir. */}
            <BildirimModali
                gorunur={presetOnayi !== null}
                tip="bilgi"
                baslik="Özel ayarlarınız hazır yoğunluğa dönecek"
                mesaj="Her adımın süresi, tekrar sıklığı ve uyarı biçimi (sesli / yalnız bildirim) seçtiğiniz hazır yoğunluğun değerlerine döner. Seçtiğiniz bildirim sesleri ve anons metinleriniz korunur. Özel ayarlarınız saklanacak; istediğinizde Özel'e dönüp kaldığınız yerden devam edebilirsiniz."
                birincilEtiket="Uygula"
                birincilIkon="check"
                onBirincil={() => {
                    if (presetOnayi) presetiBaslat(presetOnayi);
                    setPresetOnayi(null);
                }}
                onKapat={() => setPresetOnayi(null)}
                kapatEtiketi="Vazgeç"
            />

            {/* Sesli anons ilk-kez onayı — sessiz mod/DND delineceği için tek seferlik
                bilgilendirme. Reddedilirse preset sesli hücreler olmadan uygulanır. */}
            {sesliOnayi && (
                <SesliOnayModal
                    gorunur
                    yogunlukEtiketi={
                        YOGUNLUK_BILGILERI.find((y) => y.id === sesliOnayi)?.etiket ?? ''
                    }
                    ornekMetin={sesliOrnekMetni}
                    ttsDestekli={ttsDestekli}
                    onOnayla={() => {
                        void presetiUygula(sesliOnayi, true);
                        setSesliOnayi(null);
                    }}
                    onSessizUygula={() => {
                        void presetiUygula(sesliOnayi, false);
                        setSesliOnayi(null);
                    }}
                    onIptal={() => setSesliOnayi(null)}
                />
            )}

            {/* Bildirim sınırı rehberi: sayfa + GERİ AL şeridi */}
            {rehber.ogeler}

            {/* Tüm vakitlere uygula onayı (spec 3.3 {vakit} ipucu) */}
            <BildirimModali
                gorunur={tumuneOnayi !== null}
                tip="bilgi"
                baslik={tumuneOnayi ? `${VAKIT_ADLARI[tumuneOnayi]} ayarları kopyalansın mı?` : ''}
                mesaj={
                    tumuneOnayi
                        ? `${VAKIT_ADLARI[tumuneOnayi]} vaktinin tüm adım ayarları diğer vakitlere kopyalanır. Anons metinlerinde vakit adını elle yazdıysanız {vakit} yer tutucusunu kullanmanızı öneririz.`
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
