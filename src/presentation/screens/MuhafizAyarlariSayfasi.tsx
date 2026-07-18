/**
 * Muhafız Ayarları Sayfası — vakit-merkezli (Faz 2).
 *
 * Üç katmanlı progressive disclosure (spec 2026-07-17-muhafiz-ekrani-ve-sesli-uyari):
 *   Katman 1 — ana switch + yoğunluk preset'i + 5 vakit satırı (dinamik özet)
 *   Katman 2 — vakit açılınca o vaktin 4 adımı + "Tüm vakitlere uygula"
 *   Katman 3 — adıma dokununca detay (mod / eşik / sıklık / ses / anons metni)
 *
 * Yazma yolu: matris `matrisiGuncelle` ile yazılır. Eski `esikler`/`sikliklar`
 * alanlarına DOKUNULMAZ — motor adaptörü (Faz 3) onları matristen devralacak.
 */

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
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
import type { MuhafizMatrisi, MuhafizVakti, SeviyeAyari } from '../../core/muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI } from '../../core/muhafiz/matrisTipleri';
import { tumVakitlereUygula, presetUygula, zamanlamaDegistiMi } from '../../core/muhafiz/matrisIslemleri';
import { eskidenMatriseGoc } from '../../core/muhafiz/muhafizGoc';
import { VAKIT_ADLARI } from '../../core/utils/muhafizMetinYardimcisi';
import { VakitKarti } from './MuhafizAyarlari/VakitKarti';
import { SeviyeDetayModal } from './MuhafizAyarlari/SeviyeDetayModal';
import { AkisOnizlemeModal } from './MuhafizAyarlari/AkisOnizlemeModal';
import { presetiKademeyeCevir, YOGUNLUK_BILGILERI } from './MuhafizAyarlari/sabitler';
import { useTurkceTtsDestegi } from '../hooks/useTurkceTtsDestegi';

type PresetYogunlugu = 'hafif' | 'normal' | 'yogun';

/** Ayarlar stack'i tiplenmemiş; `any` yerine ihtiyaç duyulan minimum yüzey. */
type AyarNavigasyonu = { navigate: (ekran: string) => void };

export const MuhafizAyarlariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const navigation = useNavigation() as unknown as AyarNavigasyonu;
    const { butonTiklandiFeedback } = useFeedback();
    const muhafizAyarlari = useAppSelector((state) => state.muhafiz);
    const konumAyarlari = useAppSelector((state) => state.konum);
    const konumMetni = useKonumMetni(konumAyarlari);

    const [acikVakit, setAcikVakit] = useState<MuhafizVakti | null>(null);
    const [detay, setDetay] = useState<{ vakit: MuhafizVakti; indeks: number } | null>(null);
    const [presetOnayi, setPresetOnayi] = useState<PresetYogunlugu | null>(null);
    const [tumuneOnayi, setTumuneOnayi] = useState<MuhafizVakti | null>(null);
    const [onizleme, setOnizleme] = useState<MuhafizVakti | null>(null);

    // Faz 5: cihazda Türkçe konuşma paketi yoksa sesli modlarda kibar uyarı
    // gösterilir (engelleme YOK — ayar yine kaydedilir).
    const ttsDestekli = useTurkceTtsDestegi();

    // Matris Faz 1'de opsiyonel (eski kayıtlarda olmayabilir) → göçle türet.
    const matris: MuhafizMatrisi = useMemo(
        () => muhafizAyarlari.matris ?? eskidenMatriseGoc(muhafizAyarlari),
        [muhafizAyarlari]
    );

    /**
     * Matrisi yaz + spec 4.1: elle ZAMANLAMA (eşik/sıklık) değişikliği yoğunluğu
     * 'ozel' yapar. Mod/ses/anons değişikliği yoğunluğu değiştirmez.
     */
    const matrisiYaz = useCallback(
        (yeni: MuhafizMatrisi) => {
            dispatch(matrisiGuncelle(yeni));
            const zamanlamaDegisti = zamanlamaDegistiMi(matris, yeni);
            if (muhafizAyarlari.yogunluk !== 'ozel' && zamanlamaDegisti) {
                dispatch(muhafizAyarlariniGuncelle({ yogunluk: 'ozel' }));
            }
            // Yogunluk 'ozel' iken YAPILAN her degisiklik (mod/ses/anons dahil) ya da
            // preset'ten 'ozel'e yeni gecis, en son ozel yapilandirmayi yedekte tutar
            // — boylece bir preset'e gecilse bile kullanicinin ozel hali kaybolmaz.
            if (muhafizAyarlari.yogunluk === 'ozel' || zamanlamaDegisti) {
                dispatch(ozelMatrisYedegiGuncelle(yeni));
            }
        },
        [dispatch, matris, muhafizAyarlari.yogunluk]
    );

    const seviyeGuncelle = useCallback(
        (vakit: MuhafizVakti, indeks: number, yeniSeviye: SeviyeAyari) => {
            matrisiYaz({
                ...matris,
                [vakit]: {
                    seviyeler: matris[vakit].seviyeler.map((s, i) => (i === indeks ? yeniSeviye : s)),
                },
            });
        },
        [matris, matrisiYaz]
    );

    const presetiUygula = useCallback(
        async (yogunluk: PresetYogunlugu) => {
            await butonTiklandiFeedback();
            // Özelden çıkılıyorsa mevcut matrisi yedekle — matrisiYaz zaten sürekli
            // günceller ama eski/göçmüş kayıtlarda yedek eksik olabilir (güvenlik ağı).
            if (muhafizAyarlari.yogunluk === 'ozel') {
                dispatch(ozelMatrisYedegiGuncelle(matris));
            }
            const preset = HATIRLATMA_PRESETLERI[yogunluk];
            // presetUygula YALNIZ eşik/sıklığı ezer; mod/ses/anons korunur (spec 4.1).
            dispatch(
                matrisiGuncelle(
                    presetUygula(
                        matris,
                        presetiKademeyeCevir(preset.esikler),
                        presetiKademeyeCevir(preset.sikliklar)
                    )
                )
            );
            dispatch(muhafizAyarlariniGuncelle({ yogunluk }));
        },
        [butonTiklandiFeedback, dispatch, matris, muhafizAyarlari.yogunluk]
    );

    const yogunlukSec = useCallback(
        (yogunluk: PresetYogunlugu) => {
            if (yogunluk === muhafizAyarlari.yogunluk) return;
            // Elle ayarlanmış zamanlama varsa (yogunluk === 'ozel') önce onay iste.
            if (muhafizAyarlari.yogunluk === 'ozel') {
                setPresetOnayi(yogunluk);
                return;
            }
            void presetiUygula(yogunluk);
        },
        [muhafizAyarlari.yogunluk, presetiUygula]
    );

    /** "Özel" seçeneğine dönüş: yedeklenen matrisi geri yükler (onay istemez — veri kaybı yok). */
    const ozelSec = useCallback(() => {
        if (muhafizAyarlari.yogunluk === 'ozel') return;
        void butonTiklandiFeedback();
        dispatch(ozelYogunluguGeriYukle());
    }, [muhafizAyarlari.yogunluk, butonTiklandiFeedback, dispatch]);

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
            <ScrollView className="flex-1 p-4" style={{ backgroundColor: renkler.arkaplan }}>
                {/* ── ANA SWITCH ── */}
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
                    <Switch
                        value={muhafizAyarlari.aktif}
                        onValueChange={(val) => { dispatch(muhafizAyarlariniGuncelle({ aktif: val })); }}
                        trackColor={{ false: renkler.sinir, true: 'rgba(255,255,255,0.3)' }}
                        thumbColor={muhafizAyarlari.aktif ? '#FFF' : '#f4f3f4'}
                        accessibilityLabel="Namaz Muhafızı"
                    />
                </View>

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

                            <View className="flex-row gap-2.5">
                                {YOGUNLUK_BILGILERI.map(({ id, etiket, ikon }) => {
                                    const preset = HATIRLATMA_PRESETLERI[id];
                                    const seciliMi = muhafizAyarlari.yogunluk === id;
                                    return (
                                        <TouchableOpacity
                                            key={id}
                                            className="flex-1 items-center py-4 px-2 rounded-xl border-2"
                                            style={{
                                                backgroundColor: seciliMi ? renkler.birincil : 'transparent',
                                                borderColor: seciliMi ? renkler.birincil : renkler.sinir,
                                            }}
                                            onPress={() => yogunlukSec(id)}
                                            activeOpacity={0.7}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: seciliMi }}
                                            accessibilityLabel={`${etiket} yoğunluk — ${preset.aciklama}`}
                                        >
                                            <FontAwesome5 name={ikon} size={18} color={seciliMi ? '#FFF' : renkler.metin} />
                                            <Text
                                                className="text-sm font-bold mt-1.5"
                                                style={{ color: seciliMi ? '#FFF' : renkler.metin }}
                                            >
                                                {etiket}
                                            </Text>
                                            <Text
                                                className="text-[10px] mt-0.5 text-center"
                                                style={{ color: seciliMi ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil }}
                                            >
                                                {preset.aciklama}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                                {/* "Özel" — yalnızca daha önce yedeklenmiş bir özel yapılandırma
                                    VARSA görünür (spec: yoksa gizli, boş buton gösterme). */}
                                {muhafizAyarlari.ozelMatrisYedegi && (
                                    <TouchableOpacity
                                        className="flex-1 items-center py-4 px-2 rounded-xl border-2"
                                        style={{
                                            backgroundColor: ozelMi ? renkler.birincil : 'transparent',
                                            borderColor: ozelMi ? renkler.birincil : renkler.sinir,
                                        }}
                                        onPress={ozelSec}
                                        activeOpacity={0.7}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: ozelMi }}
                                        accessibilityLabel="Özel yoğunluk — kaydedilmiş ayarlarınıza dönün"
                                    >
                                        <FontAwesome5 name="sliders-h" size={18} color={ozelMi ? '#FFF' : renkler.metin} />
                                        <Text
                                            className="text-sm font-bold mt-1.5"
                                            style={{ color: ozelMi ? '#FFF' : renkler.metin }}
                                        >
                                            Özel
                                        </Text>
                                        <Text
                                            className="text-[10px] mt-0.5 text-center"
                                            style={{ color: ozelMi ? 'rgba(255,255,255,0.8)' : renkler.metinIkincil }}
                                        >
                                            Kaydedilmiş ayarlarınız
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

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
                            <VakitKarti
                                key={vakit}
                                vakit={vakit}
                                vakitAyari={matris[vakit]}
                                acikMi={acikVakit === vakit}
                                onAcKapa={() => setAcikVakit((onceki) => (onceki === vakit ? null : vakit))}
                                onSeviyeSec={(indeks) => setDetay({ vakit, indeks })}
                                onTumVakitlereUygula={() => setTumuneOnayi(vakit)}
                                onAkisiOnizle={() => setOnizleme(vakit)}
                            />
                        ))}
                    </>
                )}

                <View className="h-10" />
            </ScrollView>

            {/* ── Katman 3 ── */}
            {detay && (
                <SeviyeDetayModal
                    gorunur
                    vakit={detay.vakit}
                    seviyeler={matris[detay.vakit].seviyeler}
                    indeks={detay.indeks}
                    ttsDestekli={ttsDestekli}
                    onDegistir={(yeniSeviye) => seviyeGuncelle(detay.vakit, detay.indeks, yeniSeviye)}
                    onKapat={() => setDetay(null)}
                />
            )}

            {/* Akışı önizle (spec 3.4) — gerçek bildirim göndermez */}
            {onizleme && (
                <AkisOnizlemeModal
                    gorunur
                    vakit={onizleme}
                    vakitAyari={matris[onizleme]}
                    ttsDestekli={ttsDestekli}
                    onKapat={() => setOnizleme(null)}
                />
            )}

            {/* Preset onayı — elle ayarlanmış zamanlama bu hazır yoğunluğa döner, ama
                kaybolmaz: yedeklenir ve "Özel"e dönünce geri gelir. */}
            <BildirimModali
                gorunur={presetOnayi !== null}
                tip="bilgi"
                baslik="Özel ayarlarınız hazır yoğunluğa dönecek"
                mesaj="Vakitlere özel ayarladığınız süre ve tekrar değerleri saklanacak; istediğinizde Özel'e dönüp kaldığınız yerden devam edebilirsiniz. Uyarı biçimi, bildirim sesi ve anons metinleriniz zaten korunur."
                birincilEtiket="Uygula"
                birincilIkon="check"
                onBirincil={() => {
                    if (presetOnayi) void presetiUygula(presetOnayi);
                    setPresetOnayi(null);
                }}
                onKapat={() => setPresetOnayi(null)}
                kapatEtiketi="Vazgeç"
            />

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
