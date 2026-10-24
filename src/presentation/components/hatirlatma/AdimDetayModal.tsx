/**
 * ORTAK ADIM DETAY MODALI — birleşik hatırlatma modülü §3.3 (eski `SeviyeDetayModal`).
 *
 * Her hatırlatma yüzeyinde (muhafız, nafile, cuma, camiye gitme, yatış, takvim) AYNI
 * bileşen; farkı `PencereTanimi` taşır. Düzen (ilerleyen açıklama, en fazla iki seviye):
 *
 *   NE ZAMAN  — eşik (hatırlatmanın kimliği; en üstte)
 *   NASIL     — iki BAĞIMSIZ anahtar: Bildirim (+ altında Ses satırı ve Titreşim, yalnız
 *               bildirim açıkken) ve Sesli okuma (+ metin editörü). Eskiden dört kartlı tek
 *               seçimdi ("2 durum için 4 kart"). Son açık kanal kapatılamaz; adımı kapatmanın
 *               yeri listedeki anahtardır (`oncekiKanallar` hafızası orada).
 *   GELİŞMİŞ  — açılır bölüm (kapalı başlar, değiştirilmiş adımda açık): tekrar, ton (yalnız
 *               muhafız), gerçek alarm + kapsamı. Başlık seçimi ÖZETLER — gizli bir seçim
 *               sessiz kalmaz.
 *
 * Rıza modalları (sesli okuma, gerçek alarm) modal AĞACININ İÇİNDE: iOS aynı anda iki
 * kardeş modal sunamaz. Rıza, ilgili adım yazımıyla BİRLİKTE gider (`onDegistir`'in ikinci
 * argümanı) — iki eşzamanlı yazım aynı eski durumu birleştirip birbirini ezerdi.
 *
 * Değişiklikler ANINDA uygulanır; serbest metin yalnız düzenleme bitince yazılır.
 */
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    LayoutAnimation,
} from 'react-native';
import { Anahtar } from '../common/Anahtar';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { useDonanimGeriTusu } from '../../hooks/useDonanimGeriTusu';
import { SayisalSecici } from '../common/SayisalSecici';
import type { AlarmKapsami, SeviyeAyari, SeviyeKademe } from '../../../core/muhafiz/matrisTipleri';
import { SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../../../core/muhafiz/matrisTipleri';
import { adimKapaliMi, kanalAcikMi } from '../../../core/muhafiz/kanalKumesi';
import { ozelSesMi } from '../../../core/muhafiz/sesKimligi';
import { sesSec } from '../../../../modules/expo-countdown-notification/src';
import { OnizlemeSesServisi } from '../../../domain/services/OnizlemeSesServisi';
import { SesSecimSatiri } from './SesSecimSatiri';
import { KanalKarti, AltAnahtarSatiri } from './KanalKarti';
import { useSesDosyasiSecimi } from '../../hooks/useSesDosyasiSecimi';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';
import { SURE } from '../hareket/sureler';
import { varsayilanAnonsMetni } from '../../../core/muhafiz/anonsMetni';
import { esikSinirlariniHesapla, komsuyaKilitliSinirlar } from '../../../core/muhafiz/esikSinirlari';
import { TurkceTtsUyarisi } from './AnonsBilesenleri';
import { AnonsMetniEditoru } from './AnonsMetniEditoru';
import { AdimNotlari, adimNotlariniOlustur } from './AdimNotlari';
import { AlarmOnayModal } from './AlarmOnayModal';
import { AlarmBilgiSatirlari, alarmNotlariniOlustur } from './AlarmBilgiSatirlari';
import { SesliOnayModal } from '../../screens/MuhafizAyarlari/SesliOnayModal';
import { useAlarmIzinleri } from '../../hooks/useAlarmIzinleri';
import { useCihazDurumu } from '../../hooks/useCihazDurumu';
import {
    acilTonSecilebilirMi,
    etkinKademe,
    sesliAnonsGerekliMi,
} from '../../../core/muhafiz/motorAdaptoru';
import { seviyeyiAc, seviyeyiKapat } from '../../../core/muhafiz/seviyeAcKapa';
import { BildirimModali } from '../common/BildirimModali';
import { tonSecimiUygula } from '../../../core/muhafiz/adimDuzenleme';
import {
    SEVIYE_BILGILERI,
    TON_ETIKETLERI,
    acilTonKisitNotu,
    adimBasligiOlustur,
    adimBilgisiAl,
    ALARM_KAPSAMI_SECENEKLERI,
    alarmAciklamasiOlustur,
    gelismisAcikBaslarMi,
    gelismisOzetiOlustur,
    gelismisOzetiVerisi,
    tekrarCumlesiOlustur,
    adimOrnekTetigi,
    adimOnizlemeIcerigi,
    kanalAnahtariniUygula,
    sonAcikAnaKanalMi,
    esikBasligiOlustur,
    esikAciklamasiOlustur,
    esikErisimAdiOlustur,
    esikBirimiOlustur,
    type AnaKanal,
    type PencereTanimi,
} from './pencereTanimi';

import { adimOzetiOlustur } from '../../../core/muhafiz/seviyeOzeti';
import { gercekTekrarDk } from '../../../core/muhafiz/planButcesi';
import { kalanDkAni, saatMetni } from '../../../core/muhafiz/zamanSeridi';
import { KANAL_IKONLARI, OzetCipleri } from './OzetCipleri';
import { AdimOnizlemeKarti } from './AdimOnizlemeKarti';
import { GirisKademesi } from './GirisKademesi';
import { bicim, metin } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

/**
 * Geniş ekranda (iPad, tablet, Fold iç ekranı) sheet tam genişliğe YAYILMAZ: anahtarlar
 * metinden kopar, satırlar okunmaz. Ayar sayfalarının okunabilir sütunuyla aynı ölçü.
 */
const SHEET_AZAMI_GENISLIK = 640;

/** Adım yazımıyla BİRLİKTE kaydedilecek rıza (yüzeyin kendi kaydı). */

const DND_ALANLARI = ['dndErisimi'] as const;

/**
 * Acil ton örneğinin altındaki ek cümle. iPhone'da acil ton Odak'ı/sessizi delmez
 * (`AdimNotlari` bunu zaten söyler) → yok. Android'de Rahatsız Etmeyin'i ancak erişim
 * VERİLMİŞSE deler; erişim yoksa doğrusu söylenir, bilinmiyorsa eski temkinli cümle.
 */
export function acilTonOrnekNotu(ton: string, platform: string, dndErisimi: boolean | null): string {
    if (ton !== 'acil' || platform !== 'android') return '';
    const a = metin().hatirlatma.adim;
    return dndErisimi === false ? a.acilNotDndYok : a.acilNotDnd;
}

export interface AdimRizasi {
    sesliOnayi?: true;
    alarmOnayi?: true;
}

export interface AdimDetayModalProps {
    gorunur: boolean;
    tanim: PencereTanimi;
    /** Pencerenin TUM adimlari — esik sinirlari komsulardan hesaplanir (spec 4.2) */
    seviyeler: SeviyeAyari[];
    indeks: number;
    /** Cihazda Turkce TTS paketi var mi (null = bilinmiyor → uyari gosterilmez) */
    ttsDestekli: boolean | null;
    /** Adım değişikliği; rıza ilk kez verildiyse ikinci argümanla BİRLİKTE gelir. */
    onDegistir: (yeniSeviye: SeviyeAyari, riza?: AdimRizasi) => void;
    onKapat: () => void;
    /**
     * Hatırlatmayı sil (issue #274). Verilmezse "Sil" düğmesi çizilmez —
     * çağıran, son hatırlatmada (en az bir tane kalmalı) bunu geçmez.
     */
    onSil?: () => void;
    /**
     * Gerçek alarm rızası (issue #74) verildi mi? Verilmediyse anahtarı açmak önce
     * `AlarmOnayModal`'ı gösterir; onay `onDegistir(…, { alarmOnayi: true })` ile yazılır.
     */
    alarmOnayiVar?: boolean;
    /**
     * Sesli okuma rızası verildi mi? `false` ise sesli okumayı İLK açmak önce `SesliOnayModal`
     * gösterir (sessiz modu/DND delebilir — bilgilendirilmiş onay). `undefined`: rıza kapısı
     * çağıranda (geriye uyum).
     */
    sesliOnayiVar?: boolean;
    /** Rıza modalının yüzeye özgü metinleri. */
    sesliOnayMetinleri?: { altBaslik?: string; kapatmaNotu?: string };
}

/** Bolum basligi (kucuk, harf arali). */
const BolumBasligi: React.FC<{ metin: string }> = ({ metin }) => {
    const renkler = useRenkler();
    return (
        <Text className="text-[11px] font-semibold tracking-wider mb-2 mt-5" style={{ color: renkler.metinIkincil }}>
            {metin}
        </Text>
    );
};

/** İkon çipi + etiket + açıklama + `Anahtar` — satırın tamamı ≥44dp. */
const AnahtarSatiri: React.FC<{
    ikon: string;
    renk: string;
    etiket: string;
    aciklama?: string;
    deger: boolean;
    onDegis: (v: boolean) => void;
    testID: string;
    devreDisi?: boolean;
    devreDisiNotu?: string;
    girintili?: boolean;
    children?: React.ReactNode;
}> = ({ ikon, renk, etiket, aciklama, deger, onDegis, testID, devreDisi = false, devreDisiNotu, girintili = false, children }) => {
    const renkler = useRenkler();
    return (
        <View
            className="p-3 rounded-2xl border mb-2"
            style={{
                backgroundColor: renkler.arkaplan,
                borderColor: renkler.sinir,
                borderStyle: girintili ? 'dashed' : 'solid',
                marginLeft: girintili ? 20 : 0,
            }}
        >
            <View className="flex-row items-center" style={{ minHeight: 44 }}>
                <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: deger ? `${renk}20` : renkler.sinir }}
                >
                    <FontAwesome5 name={ikon} size={14} color={deger ? renk : renkler.metinIkincil} solid />
                </View>
                <View className="flex-1 pr-3">
                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                        {etiket}
                    </Text>
                    {!!aciklama && (
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            {aciklama}
                        </Text>
                    )}
                </View>
                <Anahtar
                    value={deger}
                    onValueChange={onDegis}
                    disabled={devreDisi}
                    trackColor={{ false: renkler.sinir, true: `${renk}80` }}
                    thumbColor={deger ? renk : '#f4f3f4'}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: deger, disabled: devreDisi }}
                    accessibilityLabel={etiket}
                    accessibilityHint={devreDisi ? devreDisiNotu : undefined}
                    testID={testID}
                />
            </View>
            {devreDisi && !!devreDisiNotu && (
                <Text className="text-[11px] mt-1 leading-4" style={{ color: renkler.metinIkincil }}>
                    {devreDisiNotu}
                </Text>
            )}
            {children}
        </View>
    );
};

export const AdimDetayModal: React.FC<AdimDetayModalProps> = ({
    gorunur,
    tanim,
    seviyeler,
    indeks,
    ttsDestekli,
    onDegistir,
    onKapat,
    onSil,
    alarmOnayiVar = false,
    sesliOnayiVar,
    sesliOnayMetinleri,
}) => {
    const renkler = useRenkler();
    const sozluk = useMetin();
    const mh = sozluk.hatirlatma;
    const ortakMetin = sozluk.ortak;
    const ma = mh.adim;
    const mp = mh.pencere;
    const seviye = seviyeler[indeks];
    /** Gerçek alarm rıza modalı açık mı (anahtar ilk kez açılırken). */
    const [alarmOnayAcik, setAlarmOnayAcik] = useState(false);
    /** Sesli okuma rızası bekleyen adım (onaylanınca yazılır). */
    const [sesliBekleyen, setSesliBekleyen] = useState<SeviyeAyari | null>(null);
    /** Son açık kanal kapatılırken "hatırlatma kapansın mı?" onayı. */
    const [kapatOnayi, setKapatOnayi] = useState(false);
    const alarmAcikMi = gorunur && kanalAcikMi(seviye?.kanallar, 'alarm');
    // iOS'ta AlarmKit durumu rıza modalının metnini de belirler → adım detayı açıkken okunur.
    const alarmIzinleri = useAlarmIzinleri(
        gorunur &&
            tanim.alarmSecilebilir === true &&
            (tanim.yetenekler.platform === 'ios' || alarmAcikMi),
        tanim.yetenekler.platform
    );
    // Rahatsız Etmeyin erişimi: acil ton örneğindeki "delebilir" cümlesi yalnız erişim
    // varken doğrudur (Android `setBypassDnd` erişimsiz sessizce yok sayılır).
    const { durum: cihaz } = useCihazDurumu(DND_ALANLARI, gorunur && tanim.yetenekler.platform === 'android');
    const iosSurum = cihaz.surum?.platform === 'ios' ? cihaz.surum.ana : null;

    const [metinTaslak, setMetinTaslak] = useState(seviye?.anonsMetni ?? '');
    /** Ses secici acik mi? Cift dokunusa karsi butonu kilitler (bkz. `sesiSec`). */
    const [seciciAcik, setSeciciAcik] = useState(false);
    const dosyaSecimi = useSesDosyasiSecimi();
    // Pencere ölçüsü HOOK'tan: modül yükünde okunan `Dimensions` iPad'de döndürme/bölünmüş
    // ekranda bayatlardı.
    const { height: pencereYuksekligi } = useWindowDimensions();
    const hareketAzalt = useHareketAzalt();
    /**
     * Kanal/tekrar anahtarı açılıp kapanınca alt ayarlar ÖLÇÜLÜ genişler (olayla başlar,
     * ~220 ms, yalnız düzen + opaklık). "Animasyonları azalt"ta anında.
     */
    const genislet = () => {
        if (!hareketAzalt) LayoutAnimation.configureNext(LayoutAnimation.create(SURE.giris, 'easeInEaseOut', 'opacity'));
    };
    const genisleyerekYaz = (yeni: SeviyeAyari, riza?: AdimRizasi) => {
        genislet();
        if (riza) onDegistir(yeni, riza);
        else onDegistir(yeni);
    };
    /** Gelişmiş bölüm açık mı? Değiştirilmiş adımda açık başlar. */
    const [gelismisAcik, setGelismisAcik] = useState(() =>
        seviye ? gelismisAcikBaslarMi(seviye, tanim, seviyeler) : false
    );

    // Modal acilinca / baska adima gecince taslagi tazele
    useEffect(() => {
        if (gorunur) setMetinTaslak(seviye?.anonsMetni ?? '');
    }, [gorunur, tanim.kaynak, indeks, seviye?.anonsMetni]);

    // Başka adıma geçince Gelişmiş'in açıklığı o adıma göre yeniden kurulur — yalnız
    // adım/yüzey değişiminde (her değişiklikte değil: kullanıcı kapatmış olabilir).
    const acilistaGelismis = seviye ? gelismisAcikBaslarMi(seviye, tanim, seviyeler) : false;
    const gelismisAnahtari = `${gorunur}|${tanim.kaynak}|${indeks}`;
    const [sonGelismisAnahtari, setSonGelismisAnahtari] = useState(gelismisAnahtari);
    if (sonGelismisAnahtari !== gelismisAnahtari) {
        setSonGelismisAnahtari(gelismisAnahtari);
        setGelismisAcik(acilistaGelismis);
    }

    // "Dinle" ile baslatilan ses modal kapaninca DEVAM ETMEMELI.
    useEffect(() => {
        if (gorunur) return;
        OnizlemeSesServisi.temizle();
    }, [gorunur]);
    useEffect(() => () => OnizlemeSesServisi.temizle(), []);

    const metniYaz = useCallback(
        (metin: string) => {
            if (!seviye) return;
            if (metin !== seviye.anonsMetni) onDegistir({ ...seviye, anonsMetni: metin });
        },
        [seviye, onDegistir]
    );

    const kapat = useCallback(() => {
        metniYaz(metinTaslak);
        onKapat();
    }, [metniYaz, metinTaslak, onKapat]);

    useDonanimGeriTusu(gorunur, kapat);

    if (!seviye) return null;

    const bilgi = adimBilgisiAl(tanim, seviye, indeks);
    const adimBasligi = adimBasligiOlustur(tanim, seviye, indeks);
    // Ekranda görünen ton = motorun kullandığı ton (acil kısıtı dahil).
    const etkinTon = etkinKademe(seviye, tanim.yon);
    const acilSecilebilir = acilTonSecilebilirMi(seviye.esikDk, tanim.yon);
    // Sabit sınırlı yüzeyde de seçici KOMŞU adımlara kilitlenir: iki adım aynı eşiğe çekilip
    // biri normalize'da sessizce düşmesin (metniyle birlikte).
    const sinirlar = tanim.esikSinirlari
        ? komsuyaKilitliSinirlar(tanim.esikSinirlari, seviyeler, indeks, tanim.esikAdimDk)
        : esikSinirlariniHesapla(seviyeler, indeks, {
              pencereUzunluguDk: tanim.pencereUzunluguDk,
              yon: tanim.yon,
          });
    const notlar = adimNotlariniOlustur(seviye, seviyeler, {
        pencereAdi: tanim.baslikKucuk,
        pencereUzunluguDk: tanim.pencereUzunluguDk,
        yon: tanim.yon,
        yetenekler: tanim.yetenekler,
    });
    const kapaliMi = adimKapaliMi(seviye.kanallar);
    const bildirimliMi = kanalAcikMi(seviye.kanallar, 'bildirim');
    const titresimliMi = kanalAcikMi(seviye.kanallar, 'titresim');
    const alarmliMi = kanalAcikMi(seviye.kanallar, 'alarm');
    const sesliMi = sesliAnonsGerekliMi(seviye.kanallar);
    // "Tekrarla" anahtarı GERÇEK tekrardan beslenir (çip ile aynı kapı `gercekTekrarDk`): hazır
    // düzeylerin tek atış türevi `herDk = esikDk` ikinci tetik doğurmaz → anahtar KAPALI görünür.
    // Açmak makul varsayılanı yazar, kapatmak 'birkez' yazar; yalnız görüntü yazılmaz (plan aynı).
    const tekrarliMi =
        seviye.siklik !== 'birkez' &&
        gercekTekrarDk(seviye, seviyeler, tanim.yon, tanim.pencereUzunluguDk) !== null;
    const tekrarDk = tekrarliMi && seviye.siklik !== 'birkez' ? seviye.siklik.herDk : tanim.varsayilanTekrarDk;

    /**
     * Ana kanal anahtarı (Bildirim / Sesli okuma). Sesli okuma İLK açılırken (rıza kaydı
     * yoksa) önce `SesliOnayModal`; "Sesli olmadan" ve geri tuşu hiçbir şey yazmaz.
     */
    const anaKanaliAyarla = (kanal: AnaKanal, acik: boolean) => {
        const kanallar = kanalAnahtariniUygula(seviye.kanallar, kanal, acik);
        if (kanallar === seviye.kanallar) return;
        // Muhafızda boş metin SESSİZDİR → sesli açılırken kutu yön-uygun şablonla dolar.
        // Ek yüzeylerde/nafilede boş metin OTOMATİK cümledir → kutu boş kalır.
        const doldur = !tanim.bosMetinOtomatik && kanal === 'sesli' && acik && !seviye.anonsMetni;
        const anonsMetni = doldur ? varsayilanAnonsMetni(tanim.yon) : seviye.anonsMetni;
        const yeni: SeviyeAyari = { ...seviye, kanallar, anonsMetni };
        if (kanal === 'sesli' && acik && sesliOnayiVar !== true) {
            setSesliBekleyen(yeni);
            return;
        }
        if (doldur) setMetinTaslak(anonsMetni);
        genisleyerekYaz(yeni);
    };

    /**
     * Karodaki ana kanal anahtarı. SON açık ana kanal da kapatılabilir (görsel inceleme
     * 2026-10: devre dışı anahtar + "listedeki anahtarı kullanın" cümlesi kafa karıştırıyordu):
     * önce kısa bir onay, onaylanınca adım listedeki anahtarla AYNI yoldan kapanır
     * (`seviyeyiKapat` — kanal hafızası korunur, "Açın" geri getirir).
     */
    const anaKanalDegis = (kanal: AnaKanal, acik: boolean) => {
        if (!acik && sonAcikAnaKanalMi(seviye.kanallar, kanal)) {
            setKapatOnayi(true);
            return;
        }
        anaKanaliAyarla(kanal, acik);
    };
    /** Gelişmiş'te yalnız SERTLİK kaldı (persona: ton adları jargon, hazır düzey zaten kurar). */
    const gelismisVar = tanim.tonSecilebilir === true;

    /** Titreşim: bildirimin alt özelliği (bağımsız kanal; yalnız bildirim açıkken görünür). */
    const titresimiAyarla = (acik: boolean) => {
        const kanallar = { ...seviye.kanallar };
        if (acik) kanallar.titresim = true;
        else delete kanallar.titresim;
        genisleyerekYaz({ ...seviye, kanallar });
    };

    /**
     * GERÇEK ALARM aç/kapat (issue #74). AÇMAK rıza ister — kayıt yoksa önce
     * `AlarmOnayModal`; "Vazgeç" hiçbir şey yazmaz. KAPATMAK rıza istemez.
     */
    const alarmiYaz = (acik: boolean, riza?: AdimRizasi) => {
        const kanallar = { ...seviye.kanallar };
        if (acik) kanallar.alarm = true;
        else delete kanallar.alarm;
        genislet();
        onDegistir({ ...seviye, kanallar }, riza);
    };
    /** Alarm kapsamı (#74): "ilk" alanı SİLER (yokluğu "ilk" demektir). */
    const alarmKapsaminiYaz = (kapsam: AlarmKapsami) => {
        if ((seviye.alarmKapsami ?? 'ilk') === kapsam) return;
        if (kapsam === 'hepsi') {
            onDegistir({ ...seviye, alarmKapsami: 'hepsi' });
            return;
        }
        const { alarmKapsami: _eski, ...kalan } = seviye;
        onDegistir(kalan);
    };
    const alarmiAyarla = (acik: boolean) => {
        if (acik && !alarmOnayiVar) {
            setAlarmOnayAcik(true);
            return;
        }
        alarmiYaz(acik);
    };

    /**
     * Tekrarın TEK satırlık canlı cümlesi (anahtarın altında). Seçilen aralık sonraki
     * hatırlatmadan önce ikinci tetik doğurmuyorsa bunu söyler (sessiz sapma yok).
     */
    const tekrarCumlesi = tekrarCumlesiOlustur(
        seviye,
        tekrarliMi ? gercekTekrarDk(seviye, seviyeler, tanim.yon, tanim.pencereUzunluguDk) : null,
        indeks === seviyeler.length - 1,
        tanim.tonSecilebilir === true
    );

    /** Tekrar anahtarı ("Tekrarla"): açık = `{ herDk }`, kapalı = tek atış. */
    const tekrariAyarla = (acik: boolean) =>
        genisleyerekYaz({ ...seviye, siklik: acik ? { herDk: tekrarDk } : 'birkez' });

    /**
     * Ton seçimi (issue #274). Aciliyet tonla birlikte yazılır: yalnız ACİL ton
     * acil kanaldan (en üst önem) gider.
     */
    const tonSec = (kademe: SeviyeKademe) => {
        // Seçili çipe (etkin ton) dokunmak eski kaydın aciliyetini düşürmez.
        const yeni = tonSecimiUygula(seviye, kademe, tanim.yon);
        if (yeni) onDegistir(yeni);
    };

    /**
     * Sistem ses secicisini acar. IZIN ISTEMEZ (RingtoneManager). Vazgecilirse mevcut
     * secim BOZULMADAN kalir. Cift dokunus korumasi: native tek slotlu promise tutar.
     */
    const sesiSec = async () => {
        if (seciciAcik) return;
        setSeciciAcik(true);
        try {
            const secilen = await sesSec(ozelSesMi(seviye.bildirimSesi) ? seviye.bildirimSesi : null, ma.sesSeciciBaslik);
            if (!secilen) return;
            onDegistir({ ...seviye, bildirimSesi: secilen.uri, sesAdi: secilen.ad });
        } finally {
            setSeciciAcik(false);
        }
    };

    /**
     * "Kendi dosyanızdan seçin" (Android 10+): Samsung'un ses seçicisi kullanıcının kendi
     * dosyasını eklemiyor. Dosya kalıcı bildirim sesi olur (bkz. `useSesDosyasiSecimi`).
     */
    const dosyadanSec = async () => {
        if (seciciAcik) return;
        const secilen = await dosyaSecimi.sec();
        if (!secilen) return;
        onDegistir({ ...seviye, bildirimSesi: secilen.uri, sesAdi: secilen.ad || undefined });
    };

    const gelismisOzeti = gelismisOzetiOlustur(seviye, tanim, seviyeler);
    const gelismisVerisi = gelismisOzetiVerisi(seviye, tanim, seviyeler);
    const ozet = adimOzetiOlustur(seviye, tanim.yon, { kardesler: seviyeler, pencereUzunluguDk: tanim.pencereUzunluguDk });
    // Canlı önizleme: adımın ilk tetiği motorun planından, metin yüzeyin üreticisinden.
    const ornek = adimOrnekTetigi(tanim, seviyeler, indeks);
    const onizleme = adimOnizlemeIcerigi(tanim, ornek.tetik);
    // Saat yalnız GERÇEK plan tetiğinden (örnek tetiğin saati uydurma olurdu).
    const onizlemeSaati =
        tanim.pencere && ornek.plandan ? saatMetni(kalanDkAni(tanim.pencere.bitis, ornek.tetik.kalanDk)) : null;

    return (
        <Modal visible={gorunur} animationType="slide" transparent statusBarTranslucent onRequestClose={kapat}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                {/* Backdrop — absolute sibling: ic ScrollView scroll'unu takmaz */}
                <TouchableWithoutFeedback onPress={kapat}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                </TouchableWithoutFeedback>

                <View
                    style={{
                        backgroundColor: renkler.kartArkaplan,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        height: pencereYuksekligi * 0.85,
                        width: '100%',
                        maxWidth: SHEET_AZAMI_GENISLIK,
                        alignSelf: 'center',
                        paddingBottom: 24,
                    }}
                >
                    {/* Handle */}
                    <View className="items-center pt-3 pb-1">
                        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: renkler.sinir }} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                    >
                        {/* Başlık = ZAMAN (stepper'la canlı değişir); altında pencere ve sıra. */}
                        <View className="flex-row items-center mt-2 mb-1">
                            <View
                                className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                style={{ backgroundColor: `${bilgi.renk}20` }}
                            >
                                <FontAwesome5 name={bilgi.ikon} size={17} color={bilgi.renk} solid />
                            </View>
                            <View className="flex-1">
                                <Text
                                    className="text-lg font-bold"
                                    style={{ color: renkler.metin }}
                                    accessibilityRole="header"
                                >
                                    {kapaliMi ? adimBasligi : ozet.zaman}
                                </Text>
                                <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                    {/* Ton adı başlıkta YAZILMAZ (jargon); sertlik "Gelişmiş"te seçilir. */}
                                    {tanim.tonSecilebilir
                                        ? bicim(ma.altBaslikVakit, { ad: tanim.baslik, adim: adimBasligi })
                                        : tanim.baslik}
                                </Text>
                            </View>
                            <TouchableOpacity
                                className="w-11 h-11 items-center justify-center"
                                onPress={kapat}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={ma.kapat}
                            >
                                <FontAwesome5 name="times" size={18} color={renkler.metinIkincil} />
                            </TouchableOpacity>
                        </View>

                        {kapaliMi ? (
                            /* Kapalı adım: tek anlamlı eylem onu açmak (liste anahtarıyla aynı yol). */
                            <View className="items-center py-10">
                                <FontAwesome5 name="bell-slash" size={34} color={renkler.metinIkincil} />
                                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                                    {bicim(ma.kapaliMetin, { ad: tanim.baslik })}
                                    {/* Sahip: kullanılmayan adım kapalı durmasın, silinsin. */}
                                    {onSil ? ma.kapaliSil : ''}
                                </Text>
                                <TouchableOpacity
                                    className="flex-row items-center justify-center rounded-2xl mt-4 px-6"
                                    style={{ minHeight: 48, backgroundColor: renkler.birincil }}
                                    onPress={() => onDegistir(seviyeyiAc(seviye, tanim.yon, !tanim.bosMetinOtomatik))}
                                    activeOpacity={0.8}
                                    accessibilityRole="button"
                                    accessibilityLabel={bicim(ma.acinEtiket, { adim: adimBasligi })}
                                    testID="adim-ac-dugmesi"
                                >
                                    <FontAwesome5 name="bell" size={13} color="#FFFFFF" solid style={{ marginRight: 8 }} />
                                    <Text className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                                        {ma.acin}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {/* ── CANLI ÖNİZLEME — imza öğesi ── */}
                                <GirisKademesi sira={0} style={{ marginTop: 12 }}>
                                    <AdimOnizlemeKarti
                                        icerik={onizleme}
                                        kanallar={seviye.kanallar}
                                        ozetKanallari={ozet.kanallar}
                                        bildirimSesi={seviye.bildirimSesi}
                                        renk={bilgi.renk}
                                        ikon={tanim.ikon}
                                        saat={onizlemeSaati}
                                        not={tanim.tonSecilebilir ? acilTonOrnekNotu(etkinTon, tanim.yetenekler.platform, cihaz.dndErisimi) : ''}
                                    />
                                </GirisKademesi>

                                {/* ── NE ZAMAN ── */}
                                <GirisKademesi sira={1}>
                                <BolumBasligi metin={tanim.esikBasligi ?? esikBasligiOlustur(tanim.yon)} />
                                <View
                                    className="flex-row items-center justify-between p-3.5 rounded-2xl border"
                                    style={{ backgroundColor: renkler.arkaplan, borderColor: renkler.sinir }}
                                >
                                    <View className="flex-1 pr-3">
                                        <Text className="text-sm font-medium" style={{ color: renkler.metin }} numberOfLines={2}>
                                            {tanim.esikAciklamasi ?? esikAciklamasiOlustur(tanim.yon)}
                                        </Text>
                                        <Text className="text-[11px] mt-0.5" style={{ color: renkler.metinIkincil }}>
                                            {bicim(ma.aralik, { min: sinirlar.min, max: sinirlar.max })}
                                        </Text>
                                    </View>
                                    <SayisalSecici
                                        deger={seviye.esikDk}
                                        min={sinirlar.min}
                                        max={sinirlar.max}
                                        adim={tanim.esikAdimDk}
                                        birim={tanim.esikBirimi ?? esikBirimiOlustur(tanim.yon)}
                                        onChange={(val) => onDegistir({ ...seviye, esikDk: val })}
                                        renk={bilgi.renk}
                                        degerGenisligi={92}
                                        aciklama={tanim.esikErisimAdi ?? esikErisimAdiOlustur(tanim.yon)}
                                    />
                                </View>

                                {/* Faz 0: pencereye sigmayan / seyreltilen adim uyarisi */}
                                <AdimNotlari notlar={notlar} />
                                {/* TEKRAR — muhafızın EN önemli ayarı "Gelişmiş"ten buraya taşındı
                                    (persona: P8 "çok bildirim" diyen azaltmayı, P3 tekrarı arıyordu ve
                                    Gelişmiş'i açmıyordu). Tanıdık kontrol: anahtar + aralık; canlı cümle. */}
                                {tanim.siklikSecimiVar !== false && (
                                    <View className="mt-2">
                                        <AnahtarSatiri
                                            ikon="redo"
                                            renk={bilgi.renk}
                                            etiket={ma.tekrarla}
                                            aciklama={tekrarCumlesi}
                                            deger={tekrarliMi}
                                            onDegis={tekrariAyarla}
                                            testID="adim-tekrar-anahtari"
                                        >
                                            {tekrarliMi && (
                                                <View className="flex-row items-center justify-between mt-2">
                                                    <Text className="text-sm font-medium flex-1 pr-3" style={{ color: renkler.metin }}>
                                                        {ma.her}
                                                    </Text>
                                                    <SayisalSecici
                                                        deger={tekrarDk}
                                                        min={tanim.tekrarMinDk}
                                                        max={tanim.tekrarMaxDk}
                                                        adim={1}
                                                        birim={ma.dakikadaBir}
                                                        onChange={(val) => onDegistir({ ...seviye, siklik: { herDk: val } })}
                                                        renk={bilgi.renk}
                                                        degerGenisligi={96}
                                                        aciklama={ma.tekrarAraligi}
                                                    />
                                                </View>
                                            )}
                                        </AnahtarSatiri>
                                    </View>
                                )}
                                </GirisKademesi>

                                {/* ── NASIL ── kanal kartları: her kanal KENDİ alt ayarlarını taşır (ilerleyen
                                    açıklama). Kapalı kanalın gövdesi çizilmez; açılınca kart ölçülü
                                    genişler (`genislet`). iOS'ta ses/titreşim yok → Bildirim kartı başlıktır. */}
                                {tanim.kanalSecimiVar && (
                                    <GirisKademesi sira={2}>
                                        <BolumBasligi metin={ma.nasil} />
                                        <View style={{ rowGap: 8 }}>
                                            <KanalKarti
                                                ikon={KANAL_IKONLARI.bildirim}
                                                renk={bilgi.renk}
                                                etiket={mp.bildirimEtiketi}
                                                ipucu={mp.bildirimAciklamasi}
                                                deger={bildirimliMi}
                                                onDegis={(v) => anaKanalDegis('bildirim', v)}
                                                testID="adim-bildirim-anahtari"
                                                kartTestID="adim-bildirim-karti"
                                            >
                                                {tanim.sesSecimiVar ? (
                                                    <SesSecimSatiri
                                                        bildirimSesi={seviye.bildirimSesi}
                                                        sesAdi={seviye.sesAdi}
                                                        seciliyor={seciciAcik}
                                                        onSec={() => {
                                                            void sesiSec();
                                                        }}
                                                        onDinle={() => {
                                                            void OnizlemeSesServisi.bildirimSesiniCal(seviye.bildirimSesi);
                                                        }}
                                                        onDosyadanSec={
                                                            dosyaSecimi.destekleniyor ? () => void dosyadanSec() : undefined
                                                        }
                                                        dosyaAktariliyor={dosyaSecimi.seciliyor}
                                                        onVarsayilanaDon={() =>
                                                            onDegistir({ ...seviye, bildirimSesi: VARSAYILAN_SES, sesAdi: undefined })
                                                        }
                                                    />
                                                ) : null}
                                                {/* TİTREŞİM — bildirimin alt özelliği, bağımsız anahtar (çip değil).
                                                    PLATFORM KAPISI: iOS'ta haptik sistem ayarıdır. */}
                                                {tanim.titresimSecilebilir ? (
                                                    <View className={tanim.sesSecimiVar ? 'mt-1' : ''}>
                                                        <AltAnahtarSatiri
                                                            ikon={KANAL_IKONLARI.titresim}
                                                            renk={bilgi.renk}
                                                            etiket={mp.titresimEtiketi}
                                                            ipucu={mp.titresimAciklamasi}
                                                            deger={titresimliMi}
                                                            onDegis={titresimiAyarla}
                                                            testID="adim-titresim-anahtari"
                                                        />
                                                    </View>
                                                ) : null}
                                            </KanalKarti>

                                            <KanalKarti
                                                ikon={KANAL_IKONLARI.sesli}
                                                renk={bilgi.renk}
                                                etiket={mp.sesliEtiketi}
                                                ipucu={mp.sesliAciklamasi}
                                                deger={sesliMi}
                                                onDegis={(v) => anaKanalDegis('sesli', v)}
                                                testID="adim-sesli-anahtari"
                                                kartTestID="adim-sesli-karti"
                                            >
                                                {/* iOS'ta useTurkceTtsDestegi null döner → bant çizilmez. */}
                                                <TurkceTtsUyarisi destekli={ttsDestekli} />
                                                <AnonsMetniEditoru
                                                    tanim={tanim}
                                                    seviye={seviye}
                                                    taslak={metinTaslak}
                                                    onTaslak={setMetinTaslak}
                                                    onCommit={metniYaz}
                                                />
                                            </KanalKarti>

                                            {/* GERÇEK ALARM (issue #74) — onay akışı aynı (`alarmiAyarla` →
                                                `AlarmOnayModal`). KAPSAM: alan yalnız "hepsi" iken yazılır. */}
                                            {tanim.alarmSecilebilir === true && (
                                                <KanalKarti
                                                    ikon={KANAL_IKONLARI.alarm}
                                                    renk={bilgi.renk}
                                                    etiket={mp.alarmEtiketi}
                                                    ipucu={alarmAciklamasiOlustur(alarmliMi ? seviye.alarmKapsami : undefined)}
                                                    deger={alarmliMi}
                                                    onDegis={alarmiAyarla}
                                                    testID="adim-alarm-anahtari"
                                                    kartTestID="adim-alarm-karti"
                                                >
                                                    <View testID="adim-alarm-ayrinti">
                                                        <Text className="text-xs mb-2 leading-4" style={{ color: renkler.metinIkincil }}>
                                                            {alarmAciklamasiOlustur(seviye.alarmKapsami)}
                                                        </Text>
                                                        <View className="flex-row gap-2">
                                                            {ALARM_KAPSAMI_SECENEKLERI.map((s) => {
                                                                const secili = (seviye.alarmKapsami ?? 'ilk') === s.kapsam;
                                                                return (
                                                                    <TouchableOpacity
                                                                        key={s.kapsam}
                                                                        testID={`alarm-kapsami-${s.kapsam}`}
                                                                        className="flex-1 flex-row items-center justify-center py-2.5 px-2 rounded-2xl border"
                                                                        style={{
                                                                            minHeight: 44,
                                                                            backgroundColor: secili ? `${bilgi.renk}15` : renkler.kartArkaplan,
                                                                            borderColor: secili ? bilgi.renk : renkler.sinir,
                                                                            borderWidth: secili ? 2 : 1,
                                                                        }}
                                                                        onPress={() => alarmKapsaminiYaz(s.kapsam)}
                                                                        activeOpacity={0.7}
                                                                        accessibilityRole="button"
                                                                        accessibilityState={{ selected: secili }}
                                                                        accessibilityLabel={bicim(ma.alarmKapsamEtiket, { etiket: s.etiket })}
                                                                    >
                                                                        <FontAwesome5
                                                                            name={s.ikon}
                                                                            size={12}
                                                                            color={secili ? bilgi.renk : renkler.metinIkincil}
                                                                            style={{ marginRight: 6 }}
                                                                        />
                                                                        <Text
                                                                            className="text-xs font-semibold"
                                                                            style={{ color: secili ? bilgi.renk : renkler.metin }}
                                                                        >
                                                                            {s.etiket}
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            })}
                                                        </View>
                                                        {seviye.alarmKapsami === 'hepsi' && (
                                                            <Text className="text-xs mt-2" style={{ color: renkler.metinIkincil }}>
                                                                {mp.alarmKapsamiNotu}
                                                                {tanim.yetenekler.platform === 'ios' && alarmIzinleri.alarmKit === 'izinli'
                                                                    ? ` ${mp.iosAlarmKapsamiNotu}`
                                                                    : ''}
                                                            </Text>
                                                        )}
                                                        <AlarmBilgiSatirlari
                                                            notlar={alarmNotlariniOlustur({
                                                                platform: tanim.yetenekler.platform,
                                                                tamEkran: alarmIzinleri.tamEkran,
                                                                tamAlarm: alarmIzinleri.tamAlarm,
                                                                alarmKit: alarmIzinleri.alarmKit,
                                                                iosSurum,
                                                            })}
                                                            onIzinAyari={() => void alarmIzinleri.ayariAc()}
                                                            onAlarmIzni={() => void alarmIzinleri.izinIste()}
                                                            onTamAlarm={() => void alarmIzinleri.tamAlarmAyariAc()}
                                                        />
                                                    </View>
                                                </KanalKarti>
                                            )}
                                        </View>
                                    </GirisKademesi>
                                )}

{/* ── GELİŞMİŞ ── açılır bölüm (aynı sayfa — yeni bir gezinme seviyesi değil) */}
                                {gelismisVar && (<GirisKademesi sira={3}>
                                <TouchableOpacity
                                    className="flex-row items-center mt-4 py-2"
                                    style={{ minHeight: 48 }}
                                    onPress={() => setGelismisAcik((a) => !a)}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityState={{ expanded: gelismisAcik }}
                                    accessibilityLabel={gelismisOzeti ? bicim(ma.gelismisEtiketOzet, { ozet: gelismisOzeti }) : ma.gelismisEtiket}
                                    testID="adim-gelismis"
                                >
                                    <FontAwesome5
                                        name={gelismisAcik ? 'chevron-down' : 'chevron-right'}
                                        size={12}
                                        color={renkler.metinIkincil}
                                        style={{ width: 18 }}
                                    />
                                    {/* Başlık solda, seçim özeti (çip) AYNI satırda sağda. */}
                                    <Text
                                        className="text-[11px] font-semibold tracking-wider flex-1"
                                        style={{ color: renkler.metinIkincil }}
                                    >
                                        {ma.gelismis}
                                    </Text>
                                    {gelismisOzeti ? (
                                        // Seçim varsa ikon çipiyle özetlenir (tam cümle etikette).
                                        <OzetCipleri
                                            kanallar={[]}
                                            renk={bilgi.renk}
                                            tekrarDk={gelismisVerisi.tekrarDk}
                                            ton={gelismisVerisi.ton ? SEVIYE_BILGILERI[gelismisVerisi.ton] : undefined}
                                            boyut="kucuk"
                                            testID="adim-gelismis-ozet"
                                        />
                                    ) : (
                                        <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                                            {ma.sertlik}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                {gelismisAcik && (
                                    <GirisKademesi sira={0} ilkBeklemeMs={0}>
                                    <View testID="adim-gelismis-icerik">
                                        {/* Ton (issue #274) — yalnız muhafız */}
                                        {tanim.tonSecilebilir && (
                                            <>
                                                <Text
                                                    className="text-[11px] font-semibold tracking-wider mb-2 mt-2"
                                                    style={{ color: renkler.metinIkincil }}
                                                >
                                                    {ma.sertlikBuyuk}
                                                </Text>
                                                <View className="flex-row gap-1.5">
                                                    {SEVIYE_KADEMELERI.map((kademe) => {
                                                        const tonBilgi = SEVIYE_BILGILERI[kademe];
                                                        const secili = etkinTon === kademe;
                                                        const devreDisi = kademe === 'acil' && !acilSecilebilir;
                                                        return (
                                                            <TouchableOpacity
                                                                key={kademe}
                                                                className="flex-1 items-center justify-center py-2 rounded-2xl border"
                                                                style={{
                                                                    minHeight: 48,
                                                                    opacity: devreDisi ? 0.4 : 1,
                                                                    backgroundColor: secili ? `${tonBilgi.renk}15` : renkler.arkaplan,
                                                                    borderColor: secili ? tonBilgi.renk : renkler.sinir,
                                                                    borderWidth: secili ? 2 : 1,
                                                                }}
                                                                disabled={devreDisi}
                                                                onPress={() => tonSec(kademe)}
                                                                activeOpacity={0.7}
                                                                accessibilityRole="button"
                                                                accessibilityState={{ selected: secili, disabled: devreDisi }}
                                                                accessibilityLabel={bicim(ma.sertlikEtiket, { ton: TON_ETIKETLERI[kademe] })}
                                                            >
                                                                <FontAwesome5
                                                                    name={tonBilgi.ikon}
                                                                    size={13}
                                                                    color={secili ? tonBilgi.renk : renkler.metinIkincil}
                                                                    solid
                                                                />
                                                                <Text className="text-xs font-semibold mt-1" style={{ color: renkler.metin }}>
                                                                    {TON_ETIKETLERI[kademe]}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                                {!acilSecilebilir && (
                                                    <Text className="text-xs mt-2 leading-4" style={{ color: renkler.metinIkincil }}>
                                                        {acilTonKisitNotu(tanim.yon)}
                                                    </Text>
                                                )}
                                                {/* Tonun örneği artık üstteki canlı önizlemede: başlık seçilen
                                                    tonla anında değişir (ayrı bir örnek kutusu yok). */}
                                                <View className="h-2" />
                                            </>
                                        )}

                                    </View>
                                    </GirisKademesi>
                                )}
                                </GirisKademesi>)}
                            </>
                        )}

                        {/* ── Sil (issue #274) — en az bir hatırlatma kalır ── */}
                        {onSil && (
                            <TouchableOpacity
                                className="flex-row items-center justify-center rounded-2xl mt-6"
                                style={{
                                    minHeight: 48,
                                    backgroundColor: renkler.arkaplan,
                                    borderWidth: 1,
                                    borderColor: renkler.sinir,
                                }}
                                onPress={onSil}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={bicim(ma.silEtiket, { adim: adimBasligi })}
                            >
                                <FontAwesome5 name="trash-alt" size={13} color={renkler.metinIkincil} style={{ marginRight: 8 }} />
                                <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                    {ma.sil}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>

                {/* Gerçek alarm rızası — modal AĞACININ İÇİNDE (iOS iki kardeş modal sunamaz).
                    Onay rızayı adım yazımıyla BİRLİKTE yazar VE anahtarı açar. */}
                {alarmOnayAcik && (
                    <AlarmOnayModal
                        gorunur
                        platform={tanim.yetenekler.platform}
                        alarmKit={alarmIzinleri.alarmKit}
                        iosSurum={iosSurum}
                        tamEkran={alarmIzinleri.tamEkran}
                        onOnayla={() => {
                            setAlarmOnayAcik(false);
                            if (tanim.yetenekler.platform !== 'ios') {
                                alarmiYaz(true, { alarmOnayi: true });
                                return;
                            }
                            // iOS: sistem alarm izni (AlarmKit) anahtar YAZILMADAN ÖNCE istenir —
                            // matris değişince ekranın planlaması izin sonucuyla koşsun.
                            void alarmIzinleri.izinIste(false).finally(() => alarmiYaz(true, { alarmOnayi: true }));
                        }}
                        onIptal={() => setAlarmOnayAcik(false)}
                    />
                )}

                {/* Son kanal kapatma onayı — modal ağacının içinde (iOS iki kardeş modal sunamaz). */}
                {kapatOnayi && (
                    <BildirimModali
                        gorunur
                        tip="bilgi"
                        baslik={ma.kapatOnayBaslik}
                        mesaj={ma.kapatOnayMesaj}
                        birincilEtiket={ortakMetin.kapatin}
                        birincilIkon="bell-slash"
                        onBirincil={() => {
                            setKapatOnayi(false);
                            onDegistir(seviyeyiKapat(seviye));
                        }}
                        onKapat={() => setKapatOnayi(false)}
                        kapatEtiketi={ma.vazgec}
                    />
                )}

                {/* Sesli okuma rızası — aynı gerekçeyle modal ağacının içinde. Reddedilirse ve
                    geri tuşunda HİÇBİR ŞEY yazılmaz (adım kurulu kanallarıyla kalır). */}
                {sesliBekleyen && (
                    <SesliOnayModal
                        gorunur
                        altBaslik={sesliOnayMetinleri?.altBaslik ?? bicim(ma.sesliAltBaslik, { ad: tanim.baslik })}
                        kapatmaNotu={sesliOnayMetinleri?.kapatmaNotu ?? ma.sesliKapatmaNotu}
                        ornekMetin={
                            sesliBekleyen.anonsMetni
                                ? tanim.anonsCoz(sesliBekleyen.anonsMetni, sesliBekleyen)
                                : tanim.otomatikAnons?.(sesliBekleyen) ?? ''
                        }
                        ttsDestekli={ttsDestekli}
                        onOnayla={() => {
                            const yeni = sesliBekleyen;
                            setSesliBekleyen(null);
                            setMetinTaslak(yeni.anonsMetni);
                            genisleyerekYaz(yeni, { sesliOnayi: true });
                        }}
                        onSessizUygula={() => setSesliBekleyen(null)}
                        onIptal={() => setSesliBekleyen(null)}
                    />
                )}
            </View>
        </Modal>
    );
};
