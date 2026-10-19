/**
 * Hatırlatmalar — tek sayfa (sade tasarım, Dalga 3).
 *
 * Eskiden "namazımı hatırlat" görevi beş sayfaya (Muhafız, Bildirimler, Nafile, Ramazan,
 * Seri) ve Bildirimler'in içindeki sekiz bölüme dağılıydı. Şimdi:
 *   Üst — "Ne kadar hatırlatalım?" düzey seçici (muhafız: Kapalı · Hafif · Normal · Yoğun
 *         · Kendi ayarınız). Çoğu kişi burada durur.
 *   Orta — her hatırlatma TEK satır: anahtar + bugün ne olacağını söyleyen tek cümle + "›"
 *         (dokununca o hatırlatmanın mevcut ayrıntısı açılır).
 *   Alt  — Özel gün (hatırlatmaları ve seriyi durdurur).
 *
 * Anahtarların yazma yolu her yüzeyin KENDİ yoludur (thunk + yeniden planlama); sayıyı
 * yapısal artıran açma (cuma, camiye gitme, yatış) bildirim sınırı simülasyonundan geçer
 * (`degisikligiDene`, ayrıntı sayfasıyla aynı kural). Takvim çakışması rızasız AÇILAMAZ →
 * anahtar ayrıntıya gider ve açma akışını orada başlatır.
 *
 * Eski "Bildirimler" rotası (`BildirimAyarlari`) bu sayfayı açar.
 */
import * as React from 'react';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { vakitBildirimAyarlariniYukle, tumVakitBildirimAyarlariniGuncelle } from '../../store/vakitBildirimSlice';
import { cumaHatirlatmaAyariniGuncelle } from '../../store/cumaHatirlatmaSlice';
import { camiyeGitAyariniGuncelle } from '../../store/camiyeGitSlice';
import { yatisHatirlatmaAyariniGuncelle } from '../../store/yatisHatirlatmaSlice';
import { takvimCakismaAyarlariniYukle, takvimCakismaAyariniGuncelle } from '../../store/takvimCakismaSlice';
import { seriAyarlariniGuncelle } from '../../store/seriSlice';
import { adimYukuArtiyorMu } from '../../../core/hatirlatma/adimDizisi';
import {
    camiyeGitOzeti,
    cumaOzeti,
    gunSonuOzeti,
    ozelGunOzeti,
    takvimCakismaOzeti,
    vakitCikmadanOzeti,
    vakitGirinceOzeti,
    yatisOzeti,
} from '../../../core/hatirlatma/hatirlatmaOzetleri';
import { nafileOzeti, ramazanOzeti } from '../../../core/ayarlar/ozetler';
import { useBildirimButcesi } from '../../hooks/useBildirimButcesi';
import { useButceRehberi } from '../../hooks/useButceRehberi';
import { useMuhafizPlanlama } from '../../hooks/useMuhafizPlanlama';
import { useMuhafizDuzeyi } from '../../hooks/useMuhafizDuzeyi';
import { useRamazanSayaclari } from '../../hooks/useRamazanSayaclari';
import { useCihazDurumu } from '../../hooks/useCihazDurumu';
import { durumNotu } from '../../../core/cihaz/durumNotlari';
import { muhafizMatrisiniCoz } from '../../../core/muhafiz/motorAdaptoru';
import { DuzeySecici } from '../../components/hatirlatma/DuzeySecici';
import { DuzeyOnizlemesi } from '../../components/hatirlatma/DuzeyOnizlemesi';
import { AnahtarSatiri } from '../../components/ortak/AnahtarSatiri';
import { BolumBasligi } from '../../components/ortak/BolumBasligi';
import { DurumSatiri } from '../../components/ortak/DurumSatiri';
import { IkonCipi } from '../../components/ortak/IkonCipi';
import { BildirimButceKarti } from '../../components/bildirim/BildirimButceKarti';
import { VurguSaglayici } from '../../components/ayar/VurguSaglayici';
import { useVurguKurulumu } from '../../components/ayar/useVurguKurulumu';
import { AyarCapasi } from '../../components/ayar/AyarCapasi';
import { OZEL_GUN_RENGI } from '../../../core/constants/OzelGunRengi';
import { LocalKapatmaOncesiSecim } from '../../../data/local/LocalKapatmaOncesiSecim';
import { geriAlBandiGoster } from '../../components/ortak/GeriAlBandi';

type Navigasyon = { navigate: (ekran: string, params?: Record<string, unknown>) => void };

const CIHAZ_ALANLARI = ['bildirimIzni'] as const;

/** Anahtarsız gezinme satırı (nafile, özel gün): ikon + başlık + özet + "›". */
const GezinmeSatiri: React.FC<{
    ikon: string;
    renk?: string;
    baslik: string;
    ozet: string;
    onPress: () => void;
    testID?: string;
}> = ({ ikon, renk, baslik, ozet, onPress, testID }) => {
    const renkler = useRenkler();
    return (
        <TouchableOpacity
            testID={testID}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${baslik}. ${ozet}`}
            accessibilityHint="Ayrıntıları açar"
            style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingVertical: 10 }}
        >
            <IkonCipi ikon={ikon} renk={renk} />
            <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: renkler.metin }}>{baslik}</Text>
                <Text numberOfLines={2} style={{ fontSize: 14, marginTop: 2, color: renkler.metinIkincil }}>
                    {ozet}
                </Text>
            </View>
            <FontAwesome5 name="chevron-right" size={13} color={renkler.metinIkincil} style={{ marginHorizontal: 8 }} />
        </TouchableOpacity>
    );
};

/** Satırları tek kartta, araları ince çizgiyle toplar (Fragment değil: dizi sayılır). */
const Kart: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const renkler = useRenkler();
    const cocuklar = React.Children.toArray(children);
    return (
        <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 }}>
            {cocuklar.map((c, i) => (
                <View key={i} style={i > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: renkler.sinir } : undefined}>
                    {c}
                </View>
            ))}
        </View>
    );
};

export const HatirlatmalarSayfasi: React.FC = () => (
    <VurguSaglayici>
        <HatirlatmalarIcerik />
    </VurguSaglayici>
);

const HatirlatmalarIcerik: React.FC = () => {
    const renkler = useRenkler();
    const scrollRef = useVurguKurulumu();
    const dispatch = useAppDispatch();
    const navigation = useNavigation() as unknown as Navigasyon;
    const { butonTiklandiFeedback } = useFeedback();

    const muhafiz = useAppSelector((s) => s.muhafiz);
    const konum = useAppSelector((s) => s.konum);
    const sayac = useAppSelector((s) => s.vakitSayac?.ayarlar);
    const vakitBildirim = useAppSelector((s) => s.vakitBildirim.ayarlar);
    const cuma = useAppSelector((s) => s.cumaHatirlatma.ayarlar);
    const camiyeGit = useAppSelector((s) => s.camiyeGit.ayarlar);
    const yatis = useAppSelector((s) => s.yatisHatirlatma.ayarlar);
    const takvimCakisma = useAppSelector((s) => s.takvimCakisma.ayarlar);
    const nafile = useAppSelector((s) => s.nafile.ayarlar);
    const seriAyarlari = useAppSelector((s) => s.seri.ayarlar);
    const ozelGun = useAppSelector((s) => s.seri.ozelGunAyarlari);
    const ramazan = useRamazanSayaclari();

    // `vakitBildirim` ve `takvimCakisma` açılışta YÜKLENMEZ (AGENTS.md hidrasyon kuralı):
    // initialState (hepsi kapalı) gerçek veri sanılmasın. İkisi de salt okuma.
    useFocusEffect(
        useCallback(() => {
            dispatch(vakitBildirimAyarlariniYukle());
            dispatch(takvimCakismaAyarlariniYukle());
        }, [dispatch])
    );

    const { durum: cihaz, yenile: cihazYenile } = useCihazDurumu(CIHAZ_ALANLARI);

    // ── Muhafız düzeyi (muhafız ayrıntısıyla AYNI kanca) ──
    const { planlamayiKuyrugaAl } = useMuhafizPlanlama({
        aktif: muhafiz.aktif,
        matris: muhafizMatrisiniCoz(muhafiz),
        koordinatlar: konum.koordinatlar,
        sayacAyarlari: sayac,
    });
    const duzey = useMuhafizDuzeyi(planlamayiKuyrugaAl);

    // ── Bildirim sınırı: yapısal artan açma burada da simüle edilir ──
    const butce = useBildirimButcesi();
    const rehber = useButceRehberi<null>(
        butce,
        { yaz: () => undefined, yedekAl: () => null, geriYukle: () => undefined },
        {
            // Öneriler muhafız/nafile ayarını yazar; bu sayfa yalnız anahtarları yazar.
            oneriFiltresi: () => false,
            ekYol: { etiket: 'Vakit çıkmadan ayarlarında yer açın', onPress: () => navigation.navigate('MuhafizAyarlari') },
        }
    );

    const git = useCallback(
        (ekran: string, params?: Record<string, unknown>) => {
            void butonTiklandiFeedback();
            navigation.navigate(ekran, params);
        },
        [butonTiklandiFeedback, navigation]
    );

    // ── Anahtarlar ──
    const vakitGirinceAcik = Object.values(vakitBildirim).some(Boolean);
    const vakitGirinceDegistir = async (v: boolean) => {
        void butonTiklandiFeedback();
        // Tek anahtar: kapatmak hepsini kapatır ama kullanıcının VAKİT SEÇİMİNİ silmez —
        // önceki seçim saklanır, açınca geri gelir (yoksa beş vakit). Seçim ayrıntıda.
        if (!v) {
            const once = {
                imsak: vakitBildirim.imsak === true,
                ogle: vakitBildirim.ogle === true,
                ikindi: vakitBildirim.ikindi === true,
                aksam: vakitBildirim.aksam === true,
                yatsi: vakitBildirim.yatsi === true,
            };
            await LocalKapatmaOncesiSecim.yaz('vakitGirince', once);
            dispatch(tumVakitBildirimAyarlariniGuncelle({ imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false }));
            geriAlBandiGoster({
                mesaj: 'Vakit girince hatırlatması kapatıldı',
                geriAl: () => dispatch(tumVakitBildirimAyarlariniGuncelle(once)),
            });
            return;
        }
        const once = await LocalKapatmaOncesiSecim.oku('vakitGirince');
        const geri =
            once && Object.values(once).some(Boolean)
                ? once
                : { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true };
        dispatch(tumVakitBildirimAyarlariniGuncelle(geri));
    };

    const cumaDegistir = (v: boolean) => {
        void butonTiklandiFeedback();
        const yeni = { ...cuma, aktif: v };
        if (adimYukuArtiyorMu(cuma, yeni) && !rehber.degisikligiDene({ cuma: yeni }, { once: { cuma } })) return;
        dispatch(cumaHatirlatmaAyariniGuncelle({ aktif: v, adimlar: yeni.adimlar }));
    };

    const camiyeGitDegistir = (v: boolean) => {
        void butonTiklandiFeedback();
        const yeni = { ...camiyeGit, aktif: v };
        if (adimYukuArtiyorMu(camiyeGit, yeni) && !rehber.degisikligiDene({ camiyeGit: yeni }, { once: { camiyeGit } })) return;
        dispatch(camiyeGitAyariniGuncelle({ aktif: v, adimlar: yeni.adimlar }));
    };

    const yatisDegistir = (v: boolean) => {
        void butonTiklandiFeedback();
        const yeni = { ...yatis, aktif: v };
        if (adimYukuArtiyorMu(yatis, yeni) && !rehber.degisikligiDene({ yatis: yeni }, { once: { yatis } })) return;
        dispatch(yatisHatirlatmaAyariniGuncelle({ aktif: v, adimlar: yeni.adimlar }));
    };

    const takvimDegistir = (v: boolean) => {
        if (v) {
            // Rıza + sistem izni ayrıntıda (normalize rızasız "açık"ı KAPALI okur).
            git('TakvimCakismaAyarlari', { ac: true });
            return;
        }
        void butonTiklandiFeedback();
        dispatch(takvimCakismaAyariniGuncelle({ aktif: false }));
    };

    const ramazanAcik = ramazan.iftar || ramazan.sahur;
    const ramazanDegistir = (v: boolean) => {
        void butonTiklandiFeedback();
        void ramazan.iftarDegistir(v);
        void ramazan.sahurDegistir(v);
    };

    const gunSonuDegistir = (v: boolean) => {
        void butonTiklandiFeedback();
        dispatch(seriAyarlariniGuncelle({ ayarlar: { gunSonuBildirimAktif: v } }));
    };

    const nafileAcik = {
        kusluk: nafile.hatirlatmalar.kusluk.aktif,
        evvabin: nafile.hatirlatmalar.evvabin.aktif,
        teheccud: nafile.teheccud.aktif,
        gosterge: nafile.gostergeAktif,
    };

    return (
        <>
            <ScrollView
                ref={scrollRef}
                style={{ flex: 1, backgroundColor: renkler.arkaplan }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <DurumSatiri durum={durumNotu('bildirimIzni', cihaz)} onSonra={cihazYenile} style={{ marginBottom: 12 }} />

                <AyarCapasi id="muhafizYogunluk">
                    <BolumBasligi metin="Ne kadar hatırlatalım?" />
                    <DuzeySecici
                        secili={duzey.secili}
                        onSec={duzey.sec}
                        ozelGoster={duzey.ozelVar}
                        sesliBilgiGoster={false}
                        testID="hatirlatma-duzeyi"
                    />
                    {/* Görsel anlatı: girişte ve düzey değişince BİR KEZ (ayar ekranı — döngü yok). */}
                    {duzey.secili !== 'ozel' ? <DuzeyOnizlemesi duzey={duzey.secili} sesliAcik={duzey.sesliAcik} testID="hatirlatma-duzey-onizlemesi" /> : null}
                </AyarCapasi>

                <BildirimButceKarti ozet={butce.ozet} onPress={rehber.karttanAc} />

                <View style={{ marginTop: 24 }}>
                    <BolumBasligi metin="Hatırlatmalar" />
                    <Kart>
                        <AnahtarSatiri
                            ikon="bell"
                            kapaliIkon="bell-slash"
                            baslik="Vakit girince"
                            ozet={vakitGirinceOzeti(vakitBildirim)}
                            deger={vakitGirinceAcik}
                            onDegistir={(v) => void vakitGirinceDegistir(v)}
                            onPress={() => git('VakitGirinceAyarlari')}
                            testID="satir-vakit-girince"
                        />
                        <AyarCapasi id="muhafizAnaSwitch">
                            <AnahtarSatiri
                                ikon="shield-alt"
                                baslik="Vakit çıkmadan"
                                ozet={vakitCikmadanOzeti(muhafiz.aktif, muhafiz.yogunluk)}
                                deger={muhafiz.aktif}
                                onDegistir={duzey.aktifiDegistir}
                                onPress={() => git('MuhafizAyarlari')}
                                testID="satir-vakit-cikmadan"
                            />
                        </AyarCapasi>
                        <AnahtarSatiri
                            ikon="mosque"
                            baslik="Cuma namazı"
                            ozet={cumaOzeti(cuma.aktif, cuma.adimlar)}
                            deger={cuma.aktif}
                            onDegistir={cumaDegistir}
                            onPress={() => git('CumaHatirlatmaAyarlari')}
                            testID="satir-cuma"
                        />
                        <AnahtarSatiri
                            ikon="walking"
                            baslik="Camiye gitme vakti"
                            ozet={camiyeGitOzeti(camiyeGit.aktif, camiyeGit.vakitler, camiyeGit.adimlar)}
                            deger={camiyeGit.aktif}
                            onDegistir={camiyeGitDegistir}
                            onPress={() => git('CamiyeGitAyarlari')}
                            testID="satir-camiye-git"
                        />
                        <AnahtarSatiri
                            ikon="bed"
                            baslik="Yatmadan önce"
                            ozet={yatisOzeti(yatis.aktif, yatis.saat, yatis.dakika)}
                            deger={yatis.aktif}
                            onDegistir={yatisDegistir}
                            onPress={() => git('YatisHatirlatmaAyarlari')}
                            testID="satir-yatis"
                        />
                        <AnahtarSatiri
                            ikon="calendar-times"
                            baslik="Toplantı çakışırsa"
                            ozet={takvimCakismaOzeti(takvimCakisma.aktif)}
                            deger={takvimCakisma.aktif}
                            onDegistir={takvimDegistir}
                            onPress={() => git('TakvimCakismaAyarlari')}
                            testID="satir-takvim-cakisma"
                        />
                        <GezinmeSatiri
                            ikon="star-and-crescent"
                            baslik="Nafile namazlar"
                            ozet={nafileOzeti(nafileAcik)}
                            onPress={() => git('NafileAyarlari')}
                            testID="satir-nafile"
                        />
                        <AnahtarSatiri
                            ikon="moon"
                            baslik="Ramazan"
                            ozet={ramazanOzeti(ramazan.iftar, ramazan.sahur)}
                            deger={ramazanAcik}
                            onDegistir={ramazanDegistir}
                            onPress={() => git('RamazanAyarlari')}
                            testID="satir-ramazan"
                        />
                        <AnahtarSatiri
                            ikon="fire-alt"
                            baslik="Günü tamamlamadıysam"
                            ozet={gunSonuOzeti({
                                aktif: seriAyarlari.gunSonuBildirimAktif,
                                mod: seriAyarlari.gunSonuBildirimModu,
                                imsakOncesiDk: seriAyarlari.bildirimImsakOncesiDk || 30,
                                saat: seriAyarlari.bildirimSaati,
                                dakika: seriAyarlari.bildirimDakikasi,
                            })}
                            deger={seriAyarlari.gunSonuBildirimAktif}
                            onDegistir={gunSonuDegistir}
                            onPress={() => git('GunSonuAyarlari')}
                            testID="satir-gun-sonu"
                        />
                    </Kart>
                </View>

                <View style={{ marginTop: 24 }}>
                    <BolumBasligi metin="Ara vermek için" />
                    <Kart>
                        <GezinmeSatiri
                            ikon="magic"
                            renk={OZEL_GUN_RENGI}
                            baslik="Özel gün"
                            ozet={ozelGunOzeti(ozelGun.ozelGunModuAktif, !!ozelGun.aktifOzelGun)}
                            onPress={() => git('OzelGunAyarlari')}
                            testID="satir-ozel-gun"
                        />
                    </Kart>
                </View>
            </ScrollView>

            {duzey.modal}
            {rehber.ogeler}
        </>
    );
};

export default HatirlatmalarSayfasi;
