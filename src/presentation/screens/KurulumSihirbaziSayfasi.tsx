/**
 * Kurulum sihirbazı — 5 adım (sade tasarım, Dalga 2; sahip onaylı):
 *   Hoş geldiniz · Konum · Bildirim · Hatırlatma düzeyi (+ sade görünüm) · Hazır.
 *
 * Kaldırılan adımlar (tema, vakit bildirimi seçimi, muhafız tanıtımı, özel gün, pil)
 * VARSAYILANLARIYLA yazılır ya da sonradan bağlamında sorulur (pil: kurulum sağlığı
 * kartı). Kurallar:
 *  - Tema token'larıyla çizilir (sabit beyaz/degrade yok); koyu temada koyudur.
 *  - İzin ÖNCE okunur: zaten verilmişse soru sorulmaz, adım "✓ … verildi" durumuyla geçer.
 *    İzin akışı `useIzinAkisi` (istek → durum YENİDEN okunur → verildi / tekrarDene / ayarlar).
 *  - Otomatik ilerleme YOK: her adımdan kullanıcı "Devam edin" ile çıkar.
 *  - Konum kendi adımında (alınınca/seçilince) yazılır; geri kalan ayarlar son düğmede.
 *    Yalnız `ILK_KURULUM_TAMAMLANDI` yazımı ölümcüldür (hata ekranda, "Tekrar deneyin");
 *    vakit bildirimi ve sade görünüm yazımı başarısızsa loglanıp geçilir — kullanıcı
 *    kurulumda takılı kalmasın. "Kaydedildi" denmez, kayıt bitince ana ekrana geçilir.
 *  - Düzey adımı varsayılanları (persona çalışması 2026-10-19): sesli okuma KAPALI başlar
 *    ve yalnız ayrı kartında AÇIKÇA açılırsa (açıklama kartta yazılıyken) rıza yazılır;
 *    gece sessizliği AÇIK; sabah alarmı `AlarmOnayModal` onayıyla açılır; cuma KAPALI.
 *    "Kıldığınızı işaretler misiniz? Hayır" → Hafif (uyarılar kılınmışlıkla susar).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useDispatch } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useRenkler, useTema } from '../../core/theme';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { tumVakitBildirimAyarlariniGuncelle } from '../store/vakitBildirimSlice';
import { muhafizAyarlariniGuncelle, presetAyarlariniOlustur } from '../store/muhafizSlice';
import { konumAyarlariniGuncelle } from '../store/konumSlice';
import { hatirlatmaRizasiVer } from '../store/hatirlatmaRizaSlice';
import { sadeGorunumuAyarla } from '../store/sadeGorunumSlice';
import type { AppDispatch } from '../store/store';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { Il } from '../../domain/services/TurkiyeKonumServisi';
import { alaniOku } from '../../domain/services/CihazDurumOkuyucu';
import { useIzinAkisi } from '../components/ortak';
import { EGRI, SURE } from '../components/hareket';
import { useHareketAzalt } from '../hooks/useHareketAzalt';
import { useDonanimGeriTusu } from '../hooks/useDonanimGeriTusu';
import { type HatirlatmaDuzeyi } from '../components/hatirlatma/DuzeySecici';
import { KURULUM_ADIMLARI, type KonumDurumu, type KurulumAdimi } from './KurulumSihirbazi/tipler';
import {
    BildirimAdimi,
    DuzeyAdimi,
    HazirAdimi,
    HosgeldinizAdimi,
    KonumAdimi,
    VARSAYILAN_KURULUM_SECIMLERI,
    type KurulumSecimleri,
} from './KurulumSihirbazi/adimlar';
import { cumaHatirlatmaAyariniGuncelle } from '../store/cumaHatirlatmaSlice';
import { sabahAlarminiAc } from '../../core/muhafiz/matrisIslemleri';
import { VARSAYILAN_GECE_SESSIZLIGI } from '../../core/muhafiz/geceSessizligi';
import { ANONS_SABLONLARI, anonsMetniniCoz } from '../../core/muhafiz/anonsMetni';
import { sesliBilgiMetni } from '../../core/hatirlatma/duzeyOzeti';
import { AlarmOnayModal } from '../components/hatirlatma/AlarmOnayModal';
import { useAlarmIzinleri } from '../hooks/useAlarmIzinleri';
import { usePlatformYetenekleri } from '../hooks/usePlatformYetenekleri';

type Props = NativeStackScreenProps<RootStackParamList, 'KurulumSihirbazi'>;

const TOPLAM = KURULUM_ADIMLARI.length;
const KAYMA = 16;
/** GPS bu sürede yanıt vermezse şehir listesine düşülür (kapalı alanda sonsuz bekleme yok). */
export const GPS_ZAMAN_ASIMI_MS = 15000;

export function zamanAsimiyla<T>(is: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((coz, reddet) => {
        const z = setTimeout(() => reddet(new Error('zaman aşımı')), ms);
        is.then(
            (d) => {
                clearTimeout(z);
                coz(d);
            },
            (e) => {
                clearTimeout(z);
                reddet(e);
            },
        );
    });
}

const konumIzniOku = () => alaniOku('konumIzni');
const konumIzniIste = () => Location.requestForegroundPermissionsAsync();
const bildirimIzniOku = () => alaniOku('bildirimIzni');
const bildirimIzniIste = () => Notifications.requestPermissionsAsync();

export const KurulumSihirbaziSayfasi: React.FC<Props> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const renkler = useRenkler();
    const { koyuMu } = useTema();
    const azalt = useHareketAzalt();

    const [adimNo, setAdimNo] = useState(0);
    const adim: KurulumAdimi = KURULUM_ADIMLARI[adimNo];

    // Konum
    const konumIzin = useIzinAkisi({ oku: konumIzniOku, iste: konumIzniIste, kapanisBeklemeMs: 0 });
    const [konumDurumu, setKonumDurumu] = useState<KonumDurumu>('bekliyor');
    const [konumBilgi, setKonumBilgi] = useState('');
    const [konumHata, setKonumHata] = useState<string | null>(null);
    const [manuelIl, setManuelIl] = useState<Il | null>(null);

    // Bildirim
    const bildirimIzin = useIzinAkisi({ oku: bildirimIzniOku, iste: bildirimIzniIste, kapanisBeklemeMs: 0 });
    /** İlk okuma bitmeden "İzin verin" düğmesi çizilmez (izni olan kişi yanlış düğme görmesin). */
    const [bildirimOkundu, setBildirimOkundu] = useState(false);
    const [konumOkundu, setKonumOkundu] = useState(false);

    // Düzey + sade görünüm
    const [duzey, setDuzey] = useState<HatirlatmaDuzeyi>('normal');
    const [sade, setSade] = useState(false);
    const [secimler, setSecimler] = useState<KurulumSecimleri>(VARSAYILAN_KURULUM_SECIMLERI);
    const secimDegistir = useCallback((d: Partial<KurulumSecimleri>) => setSecimler((s) => ({ ...s, ...d })), []);
    const isaretlerSec = useCallback((d: 'evet' | 'hayir') => {
        setSecimler((s) => ({ ...s, isaretler: d }));
        // Kıldım'a basmayan kişide uyarı zinciri hiç kesilmez → tek hatırlatma (Hafif).
        // "Evet"e dönünce yalnız Hayır'ın kurduğu Hafif Normal'e döner; kullanıcının
        // kendi seçtiği düzey (Yoğun, Kapalı) ezilmez.
        if (d === 'hayir') setDuzey('hafif');
        else setDuzey((onceki) => (onceki === 'hafif' ? 'normal' : onceki));
    }, []);
    const yetenekler = usePlatformYetenekleri();
    const alarmIzinleri = useAlarmIzinleri(adim === 'duzey', yetenekler.platform);
    const [alarmOnayAcik, setAlarmOnayAcik] = useState(false);
    const sesliOrnek = useMemo(() => anonsMetniniCoz(ANONS_SABLONLARI[0], 'ogle', 3), []);

    // Kayıt
    const [kaydediliyor, setKaydediliyor] = useState(false);
    const [kayitHatasi, setKayitHatasi] = useState<string | null>(null);

    const { yenidenOku: konumYenidenOku } = konumIzin;
    const { yenidenOku: bildirimYenidenOku } = bildirimIzin;
    useEffect(() => {
        let iptal = false;
        konumYenidenOku().finally(() => !iptal && setKonumOkundu(true));
        bildirimYenidenOku().finally(() => !iptal && setBildirimOkundu(true));
        return () => {
            iptal = true;
        };
    }, [konumYenidenOku, bildirimYenidenOku]);

    // ─── Adım geçişi: opaklık + 16 dp kayma (ileri sağdan, geri soldan) ─────────
    const opaklik = useRef(new Animated.Value(1)).current;
    const kayma = useRef(new Animated.Value(0)).current;
    const gec = useCallback(
        (hedef: number) => {
            if (hedef < 0 || hedef >= TOPLAM) return;
            if (azalt) {
                setAdimNo(hedef);
                return;
            }
            const yon = hedef > adimNo ? 1 : -1;
            Animated.parallel([
                Animated.timing(opaklik, { toValue: 0, duration: 120, easing: EGRI.cikis, useNativeDriver: true }),
                Animated.timing(kayma, { toValue: -KAYMA * yon, duration: 120, easing: EGRI.cikis, useNativeDriver: true }),
            ]).start(() => {
                setAdimNo(hedef);
                kayma.setValue(KAYMA * yon);
                Animated.parallel([
                    Animated.timing(opaklik, { toValue: 1, duration: SURE.giris, easing: EGRI.giris, useNativeDriver: true }),
                    Animated.timing(kayma, { toValue: 0, duration: SURE.giris, easing: EGRI.giris, useNativeDriver: true }),
                ]).start();
            });
        },
        [adimNo, azalt, opaklik, kayma],
    );
    const ilerle = useCallback(() => gec(adimNo + 1), [gec, adimNo]);
    const geriDon = useCallback(() => gec(adimNo - 1), [gec, adimNo]);

    // Konum alınırken geri yerine "Vazgeçin" (aşağıda); donanım geri tuşu da vazgeçer.
    const konumTuru = useRef(0);
    const konumVazgec = useCallback(() => {
        konumTuru.current += 1;
        setKonumHata(null);
        setKonumDurumu('manuel');
    }, []);
    const geriGoster = adimNo > 0 && konumDurumu !== 'aliniyor' && !kaydediliyor;
    const donanimGeri = useCallback(() => {
        if (konumDurumu === 'aliniyor') konumVazgec();
        else if (geriGoster) geriDon();
    }, [konumDurumu, konumVazgec, geriGoster, geriDon]);
    useDonanimGeriTusu(adimNo > 0, donanimGeri);

    // ─── Konum ───────────────────────────────────────────────────────────────
    const konumuAl = useCallback(async () => {
        setKonumHata(null);
        setKonumDurumu('aliniyor');
        const tur = ++konumTuru.current;
        try {
            const konum = await zamanAsimiyla(
                Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
                GPS_ZAMAN_ASIMI_MS,
            );
            if (tur !== konumTuru.current) return; // Kullanıcı vazgeçti.
            const { latitude: lat, longitude: lng } = konum.coords;
            let gpsAdres = { il: '', ilce: '', semt: '' };
            try {
                const g = (await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }))[0];
                if (g) gpsAdres = { il: g.city || g.region || '', ilce: g.district || g.subregion || '', semt: g.street || '' };
            } catch (error) {
                // Ters geocode isteğe bağlı; koordinat yine kullanılır.
                Logger.warn('KurulumSihirbazi', 'Ters geocode başarısız', error);
            }
            if (tur !== konumTuru.current) return;
            dispatch(
                konumAyarlariniGuncelle({
                    konumModu: 'oto',
                    koordinatlar: { lat, lng },
                    gpsAdres,
                    sonGpsGuncellemesi: new Date().toISOString(),
                }),
            );
            setKonumBilgi(gpsAdres.ilce || gpsAdres.il || 'Bulunduğunuz yer');
            setKonumDurumu('alindi');
        } catch (error) {
            if (tur !== konumTuru.current) return;
            Logger.warn('KurulumSihirbazi', 'Konum alınamadı', error);
            setKonumHata('Konumunuz bulunamadı. Şehrinizi seçin.');
            setKonumDurumu('manuel');
        }
    }, [dispatch]);

    const { istekBaslat: konumIstekBaslat, durum: konumIzinDurumu } = konumIzin;
    const konumBul = useCallback(async () => {
        // Kalıcı red: sistem diyaloğu zaten açılmaz → boş istek turu yapma, listeye geç.
        if (konumIzinDurumu === 'reddedildi') {
            setKonumDurumu('manuel');
            return;
        }
        if (konumIzinDurumu !== 'verildi') {
            const sonuc = await konumIstekBaslat();
            if (sonuc === null) {
                // Durum okunamadı: sessiz kalma, yedek yolu söyle.
                setKonumHata('Konum izni okunamadı. Şehrinizi seçin.');
                setKonumDurumu('manuel');
                return;
            }
            if (sonuc !== 'verildi') {
                // Kalıcı red: il listesi + "Ayarları açın". Tekrar sorulabilirse ekranda kalır.
                if (sonuc === 'ayarlar') setKonumDurumu('manuel');
                return;
            }
        }
        await konumuAl();
    }, [konumIzinDurumu, konumIstekBaslat, konumuAl]);

    const manuelKonumKaydet = useCallback(() => {
        if (!manuelIl) return;
        dispatch(
            konumAyarlariniGuncelle({
                konumModu: 'manuel',
                seciliIlId: manuelIl.id,
                seciliIlAdi: manuelIl.ad,
                seciliSehirId: String(manuelIl.id),
                koordinatlar: { lat: manuelIl.lat, lng: manuelIl.lng },
                seciliIlceId: null,
                seciliIlceAdi: '',
            }),
        );
        setKonumBilgi(manuelIl.ad);
        ilerle();
    }, [manuelIl, dispatch, ilerle]);

    // ─── Tamamla ─────────────────────────────────────────────────────────────
    const kurulumuTamamla = useCallback(async () => {
        setKaydediliyor(true);
        setKayitHatasi(null);
        // Kaldırılan "vakit bildirimleri" adımının varsayılanı: beş vakit açık. Ölümcül DEĞİL:
        // yazılamazsa uygulama varsayılanla açılır, kullanıcı kurulumda döngüye girmez.
        try {
            await dispatch(
                tumVakitBildirimAyarlariniGuncelle({ imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true }),
            ).unwrap();
        } catch (error) {
            Logger.error('KurulumSihirbazi', 'Vakit bildirimi ayarı yazılamadı', error);
        }
        try {
            const muhafizAcik = duzey !== 'kapali';
            // Sesli okuma rızası YALNIZ kart açıkça açıldıysa (açıklama kartta yazılıyken).
            const sesliRiza = muhafizAcik && secimler.sesli && (duzey === 'normal' || duzey === 'yogun');
            const sabahAlarm = muhafizAcik && secimler.sabahAlarm;
            const preset = presetAyarlariniOlustur(muhafizAcik ? duzey : 'normal', sesliRiza);
            dispatch(
                muhafizAyarlariniGuncelle({
                    aktif: muhafizAcik,
                    yogunluk: muhafizAcik ? duzey : 'normal',
                    gelismisMod: false,
                    ...preset,
                    matris: sabahAlarm && preset.matris ? sabahAlarminiAc(preset.matris) : preset.matris,
                    // Yeni kurulumda varsayılan AÇIK (kapatılırsa kaydı yine yazılır).
                    geceSessizligi: { ...VARSAYILAN_GECE_SESSIZLIGI, aktif: secimler.gece },
                    // Yeni kurulum zaten önerilen ayarlarla başlar → öneri kartı gösterilmez.
                    varsayilanOnerisiGoruldu: true,
                }),
            );
            // TEK RIZA (Dalga 3): onay ORTAK kayda yazılır (muhafızın kendi alanı geriye
            // uyum için `presetAyarlariniOlustur`'da kalır).
            if (sesliRiza) dispatch(hatirlatmaRizasiVer({ sesliOnayi: true }));
            if (sabahAlarm) dispatch(hatirlatmaRizasiVer({ alarmOnayi: true }));
            if (secimler.cuma) {
                try {
                    await dispatch(cumaHatirlatmaAyariniGuncelle({ aktif: true })).unwrap();
                } catch (error) {
                    // Ölümcül değil: Hatırlatmalar'dan açılabilir.
                    Logger.error('KurulumSihirbazi', 'Cuma hatırlatması yazılamadı', error);
                }
            }
            if (sade) {
                try {
                    await dispatch(sadeGorunumuAyarla(true)).unwrap();
                } catch (error) {
                    // Ölümcül değil: Ayarlar > Görünüm'den yeniden açılabilir.
                    Logger.error('KurulumSihirbazi', 'Sade görünüm ayarı yazılamadı', error);
                }
            }
            // Bayrak EN SON: yarıda kalan kurulum bir sonraki açılışta yeniden sorulsun.
            await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.ILK_KURULUM_TAMAMLANDI, 'true');
            navigation.replace('MainTabs');
        } catch (error) {
            Logger.error('KurulumSihirbazi', 'Kurulum tamamlanamadı', error);
            setKayitHatasi('Ayarlar kaydedilemedi. Tekrar deneyin.');
            setKaydediliyor(false);
        }
    }, [dispatch, duzey, sade, secimler, navigation]);

    // ─── Düğmeler ────────────────────────────────────────────────────────────
    const birincil = (etiket: string, ikon: string, onPress: () => void, testID?: string, mesgul = false, kapali = false) => (
        <TouchableOpacity
            testID={testID}
            onPress={onPress}
            disabled={mesgul || kapali}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={etiket}
            accessibilityState={{ disabled: mesgul || kapali, busy: mesgul }}
            style={{
                minHeight: 52,
                borderRadius: 18,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 18,
                backgroundColor: renkler.birincil,
                opacity: mesgul ? 0.7 : kapali ? 0.45 : 1,
            }}
        >
            {mesgul ? (
                <ActivityIndicator color={renkler.birincilMetin} />
            ) : (
                <>
                    <FontAwesome5 name={ikon} size={15} color={renkler.birincilMetin} solid style={{ marginRight: 10 }} />
                    <Text style={{ fontSize: 17, fontWeight: '700', color: renkler.birincilMetin }}>{etiket}</Text>
                </>
            )}
        </TouchableOpacity>
    );
    const ikincil = (etiket: string, onPress: () => void, testID?: string) => (
        <TouchableOpacity
            testID={testID}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={etiket}
            style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 6 }}
        >
            <Text style={{ fontSize: 16, fontWeight: '600', color: renkler.birincil }}>{etiket}</Text>
        </TouchableOpacity>
    );
    const devam = () => birincil('Devam edin', 'arrow-right', ilerle, 'devam');

    const dugmeler = (): React.ReactNode => {
        switch (adim) {
            case 'hosgeldiniz':
                return birincil('Başlayın', 'arrow-right', ilerle, 'basla');
            case 'konum': {
                if (konumDurumu === 'alindi') return devam();
                if (konumDurumu === 'aliniyor') {
                    return (
                        <>
                            {birincil('Konum bulunuyor', 'map-marker-alt', () => undefined, 'konum-bul', true)}
                            {ikincil('Vazgeçin, şehrimi seçeceğim', konumVazgec, 'konum-vazgec')}
                        </>
                    );
                }
                if (konumDurumu === 'manuel') {
                    return (
                        <>
                            {manuelIl
                                ? birincil(`${manuelIl.ad} ile devam edin`, 'check', manuelKonumKaydet, 'manuel-devam')
                                : birincil('Şehir seçin', 'city', () => undefined, 'manuel-devam', false, true)}
                            {konumIzin.durum === 'verildi'
                                ? ikincil('Konumumu bulun', () => void konumBul(), 'konum-bul')
                                : konumIzin.sonuc === 'ayarlar' || konumIzin.durum === 'reddedildi'
                                  ? ikincil('Ayarları açın', () => void konumIzin.ayarlariAc(), 'konum-ayarlar')
                                  : null}
                        </>
                    );
                }
                if (!konumOkundu) return null;
                return (
                    <>
                        {birincil(
                            konumIzin.durum === 'verildi' ? 'Konumumu kullanın' : 'Konumumu bulun',
                            'crosshairs',
                            () => void konumBul(),
                            'konum-bul',
                            konumIzin.istiyor,
                        )}
                        {ikincil('Şehrimi kendim seçeceğim', () => setKonumDurumu('manuel'), 'konum-manuel')}
                    </>
                );
            }
            case 'bildirim': {
                if (!bildirimOkundu) return null;
                if (bildirimIzin.durum === 'verildi') return devam();
                const kalici = bildirimIzin.sonuc === 'ayarlar' || bildirimIzin.durum === 'reddedildi';
                return (
                    <>
                        {kalici
                            ? birincil('Ayarları açın', 'cog', () => void bildirimIzin.ayarlariAc(), 'bildirim-ayarlar')
                            : birincil(
                                  bildirimIzin.sonuc === 'tekrarDene' ? 'Tekrar deneyin' : 'Bildirimlere izin verin',
                                  'bell',
                                  () => void bildirimIzin.istekBaslat(),
                                  'bildirim-izin',
                                  bildirimIzin.istiyor,
                              )}
                        {ikincil('Şimdilik geçin', ilerle, 'bildirim-gec')}
                    </>
                );
            }
            case 'duzey':
                return devam();
            case 'hazir':
                return birincil(kayitHatasi ? 'Tekrar deneyin' : 'Başlayın', 'check', () => void kurulumuTamamla(), 'tamamla', kaydediliyor);
        }
    };

    const hazirOzeti = useMemo(
        () => ({ konum: konumBilgi, bildirim: bildirimIzin.durum === 'verildi', duzey, sade, secimler }),
        [konumBilgi, bildirimIzin.durum, duzey, sade, secimler],
    );

    const icerik = (): React.ReactNode => {
        switch (adim) {
            case 'hosgeldiniz':
                return <HosgeldinizAdimi />;
            case 'konum':
                return (
                    <KonumAdimi
                        durum={konumDurumu}
                        konumBilgi={konumBilgi}
                        izin={konumIzin.durum}
                        izinSonucu={konumIzin.sonuc}
                        hata={konumHata}
                        manuelIl={manuelIl}
                        onIlSec={setManuelIl}
                    />
                );
            case 'bildirim':
                return <BildirimAdimi izin={bildirimIzin.durum} izinSonucu={bildirimIzin.sonuc} />;
            case 'duzey':
                return (
                    <DuzeyAdimi
                        duzey={duzey}
                        onDuzey={setDuzey}
                        secimler={secimler}
                        onIsaretler={isaretlerSec}
                        onSecim={secimDegistir}
                        onSabahAlarmiIste={() => setAlarmOnayAcik(true)}
                        sesliBilgi={sesliBilgiMetni(yetenekler.sessizligiDelebilir)}
                        sesliOrnek={sesliOrnek}
                        sade={sade}
                        onSade={setSade}
                    />
                );
            case 'hazir':
                return <HazirAdimi ozet={hazirOzeti} hata={kayitHatasi} />;
        }
    };

    // Liste (il seçimi) kendi kayar; diğer adımlar tek ScrollView.
    const listeli = adim === 'konum' && konumDurumu === 'manuel';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: renkler.arkaplan }} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle={koyuMu ? 'light-content' : 'dark-content'} backgroundColor={renkler.arkaplan} />

            {/* Üst bar: geri + ilerleme ("Adım 2 / 5") */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, minHeight: 56 }}>
                {geriGoster ? (
                    <TouchableOpacity
                        onPress={geriDon}
                        accessibilityRole="button"
                        accessibilityLabel="Önceki adım"
                        testID="geri"
                        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FontAwesome5 name="arrow-left" size={17} color={renkler.metin} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 44, height: 44 }} />
                )}
                <View
                    style={{ flex: 1, marginHorizontal: 8 }}
                    accessible
                    accessibilityRole="progressbar"
                    accessibilityLabel={`Adım ${adimNo + 1} / ${TOPLAM}`}
                    accessibilityValue={{ min: 1, max: TOPLAM, now: adimNo + 1 }}
                    testID="ilerleme"
                >
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        {KURULUM_ADIMLARI.map((a, i) => (
                            <View
                                key={a}
                                style={{
                                    flex: 1,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: i <= adimNo ? renkler.birincil : renkler.sinir,
                                }}
                            />
                        ))}
                    </View>
                    <Text style={{ marginTop: 6, fontSize: 13, textAlign: 'center', color: renkler.metinIkincil }}>
                        Adım {adimNo + 1} / {TOPLAM}
                    </Text>
                </View>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <Animated.View style={{ flex: 1, opacity: opaklik, transform: [{ translateX: kayma }] }}>
                {listeli ? (
                    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8 }}>{icerik()}</View>
                ) : (
                    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                        {icerik()}
                    </ScrollView>
                )}
            </Animated.View>

            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>{dugmeler()}</View>

            {/* "Sabah beni uyandırsın" rızası: onaylanmadan anahtar AÇILMAZ (geri tuşu = vazgeç). */}
            {alarmOnayAcik ? (
                <AlarmOnayModal
                    gorunur
                    platform={yetenekler.platform}
                    alarmKit={alarmIzinleri.alarmKit}
                    tamEkran={alarmIzinleri.tamEkran}
                    onOnayla={() => {
                        setAlarmOnayAcik(false);
                        // iOS: sistem alarm izni (AlarmKit) burada istenir; sonuç ne olursa olsun
                        // seçim yazılır (izin yoksa aynı tetik bildirim olarak gelir).
                        if (yetenekler.platform === 'ios') void alarmIzinleri.izinIste(false);
                        secimDegistir({ sabahAlarm: true });
                    }}
                    onIptal={() => setAlarmOnayAcik(false)}
                />
            ) : null}
        </SafeAreaView>
    );
};
