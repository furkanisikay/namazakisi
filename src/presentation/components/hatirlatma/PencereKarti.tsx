/**
 * ORTAK HATIRLATMA KARTI (Faz 3) — eski `MuhafizAyarlari/VakitKarti`.
 *
 * Katman 1 (pencere satiri) + Katman 2 (acildiginda adimlar). Ic ice modal YOK:
 * akordiyon bilinclidir. Kart artik "bir vakit" bilmez, bir `PencereTanimi`
 * cizer → muhafizin 5 vakti, cuma ve ileride seri AYNI karttan beslenir.
 *
 * TEK ADIMLI PENCERE (`maksAdim === 1`, cuma): akordiyon baslik satiri
 * cizilmez — kart dogrudan tek adim satirini gosterir. Aksi halde kullanici
 * "Cuma namazı" basligina iki kez dokunmak zorunda kalir ve bolum bugunkunden
 * KARMASIK gorunurdu (spec 10'daki olcut).
 */
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import type { VakitMuhafizAyari } from '../../../core/muhafiz/matrisTipleri';
import type { PencereYonu } from '../../../core/muhafiz/pencereTipleri';
import { seviyeOzetiOlustur } from '../../../core/muhafiz/seviyeOzeti';
import { vakitOzetiOlustur, aktifSeviyeSayisi } from '../../../core/muhafiz/vakitOzeti';
import { seviyeAcikMi } from '../../../core/muhafiz/seviyeAcKapa';
import { AdimNotlari, adimNotlariniOlustur } from './AdimNotlari';
import {
    cevrilemeyenAnonsVarMi,
    GIRIS_SESLI_GECIKME_NOTU,
    pencerePlaniOlustur,
    YON_SECENEKLERI,
    type PencereTanimi,
} from './pencereTanimi';
import { ZamanSeridi } from './ZamanSeridi';
import { BildirimModali } from '../common/BildirimModali';
import {
    saatMetni,
    seritCumlesiOlustur,
    seritDuzeniHesapla,
    seritErisimEtiketi,
} from '../../../core/muhafiz/zamanSeridi';

/** "Simdi" imleci icin tazeleme araligi — kart acikken dakikada bir. */
const SIMDI_TAZELEME_MS = 60_000;

export interface PencereKartiProps {
    tanim: PencereTanimi;
    ayar: VakitMuhafizAyari;
    /** Akordiyon acik mi? Tek adimli pencerede yok sayilir (daima acik). */
    acikMi?: boolean;
    onAcKapa?: () => void;
    /** Katman 3'u (adim detayi) acar */
    onAdimSec: (indeks: number) => void;
    /**
     * Adimi tek dokunusla ac/kapa (kanal hafizasi korunur — bkz. seviyeAcKapa).
     * Verilmezse anahtar CIZILMEZ (tek adimli pencerede bolumun kendi anahtari var).
     */
    onAdimAcKapa?: (indeks: number, acik: boolean) => void;
    /** Verilmezse buton cizilmez. */
    onTumPencerelereUygula?: () => void;
    /** "Akisi onizle" — verilmezse buton cizilmez. */
    onAkisiOnizle?: () => void;
    /**
     * Yon degisikligi. `tanim.yonSecilebilir` true VE bu verildiyse secici cizilir.
     * Cagiran `matrisIslemleri.yonDegisimindeMetniCevir`'den GECMELI: fonksiyon
     * `yon` alanini da atomik yazar, ayrica yon yazilmaz.
     */
    onYonDegistir?: (yon: PencereYonu) => void;
    /**
     * Ayni vaktin DIGER yondeki hali (varsayimsal — diske yazilmaz). "?" bilgi
     * modalinda iki yonun seridini bugunun saatleriyle yan yana gostermek icin.
     * Cagiran `vaktinYonunuDegistir` ile uretir; verilmezse modal yalniz metin gosterir.
     */
    karsiYonAyari?: VakitMuhafizAyari;
    /** Cerceve: `'kart'` kendi kartini cizer, `'gomulu'` ev sahibinin kartina yerlesir. */
    stil?: 'kart' | 'gomulu';
}

export const PencereKarti: React.FC<PencereKartiProps> = ({
    tanim,
    ayar,
    acikMi = false,
    onAcKapa,
    onAdimSec,
    onAdimAcKapa,
    onTumPencerelereUygula,
    onAkisiOnizle,
    onYonDegistir,
    karsiYonAyari,
    stil = 'kart',
}) => {
    const renkler = useRenkler();
    const [bilgiAcik, setBilgiAcik] = useState(false);

    const tekAdimli = tanim.maksAdim === 1;
    const ozet = vakitOzetiOlustur(ayar);
    const aktifSayi = aktifSeviyeSayisi(ayar);
    const tamamenKapali = aktifSayi === 0;
    const govdeGorunur = tekAdimli || acikMi;
    const gomulu = stil === 'gomulu';

    const yonSecilir = tanim.yonSecilebilir && !!onYonDegistir;
    const girisYonu = tanim.yon === 'girisindenItibaren';
    const cevrilemeyenVar = yonSecilir && cevrilemeyenAnonsVarMi(ayar.seviyeler, tanim.yon);
    const sesliAdimVar = ayar.seviyeler.some((s) => s.kanallar?.sesli === true);

    // ── Zaman seridi ──
    const { yon, pencereUzunluguDk, pencere } = tanim;
    const seritCizilir =
        yonSecilir && !!pencere && Number.isFinite(pencereUzunluguDk) && (pencereUzunluguDk as number) > 0;

    // "Simdi" imleci: kart acikken dakikada bir tazelenir, kapaninca durur.
    const [simdi, setSimdi] = useState(() => new Date());
    useEffect(() => {
        if (!seritCizilir || !govdeGorunur) return;
        setSimdi(new Date());
        const zamanlayici = setInterval(() => setSimdi(new Date()), SIMDI_TAZELEME_MS);
        return () => clearInterval(zamanlayici);
    }, [seritCizilir, govdeGorunur]);

    const plan = useMemo(
        () => (seritCizilir ? pencerePlaniOlustur(ayar, { yon, pencereUzunluguDk }) : []),
        [seritCizilir, ayar, yon, pencereUzunluguDk]
    );

    const seritCumlesi = useMemo(() => {
        if (!seritCizilir || !pencere) return '';
        return seritCumlesiOlustur({
            duzen: seritDuzeniHesapla(plan, pencereUzunluguDk as number),
            yon,
            bitis: pencere.bitis,
            baslangic: pencere.baslangic,
            simdi,
            tumAdimlarKapali: tamamenKapali,
        });
    }, [seritCizilir, pencere, plan, pencereUzunluguDk, yon, simdi, tamamenKapali]);

    /** "?" modalindaki iki blok: once secili yon, sonra digeri. */
    const bilgiBloklari = () => {
        if (!pencere || !Number.isFinite(pencereUzunluguDk)) return null;
        const karsiYon: PencereYonu = girisYonu ? 'cikisaDogru' : 'girisindenItibaren';
        const bloklar: { yon: PencereYonu; ayar?: VakitMuhafizAyari }[] = [
            { yon, ayar },
            { yon: karsiYon, ayar: karsiYonAyari },
        ];
        return bloklar.map((blok) => {
            const secenek = YON_SECENEKLERI.find((x) => x.yon === blok.yon);
            if (!secenek) return null;
            const secili = blok.yon === yon;
            const blokPlan = blok.ayar
                ? pencerePlaniOlustur(blok.ayar, { yon: blok.yon, pencereUzunluguDk })
                : null;
            const cumle = blokPlan
                ? seritCumlesiOlustur({
                    duzen: seritDuzeniHesapla(blokPlan, pencereUzunluguDk as number),
                    yon: blok.yon,
                    bitis: pencere.bitis,
                    tumAdimlarKapali: tamamenKapali,
                })
                : '';
            return (
                <View
                    key={blok.yon}
                    className="rounded-2xl p-3 mb-2.5"
                    style={{
                        backgroundColor: renkler.arkaplan,
                        borderWidth: secili ? 1.5 : 1,
                        borderColor: secili ? renkler.birincil : renkler.sinir,
                    }}
                >
                    <View className="flex-row items-center">
                        <FontAwesome5
                            name={secenek.ikon}
                            size={12}
                            color={secili ? renkler.birincil : renkler.metinIkincil}
                            style={{ marginRight: 6 }}
                        />
                        <Text className="text-sm font-semibold flex-1" style={{ color: renkler.metin }}>
                            {secenek.etiket}
                        </Text>
                        {secili && (
                            <Text className="text-[11px] font-semibold" style={{ color: renkler.birincil }}>
                                Seçili
                            </Text>
                        )}
                    </View>
                    <Text className="text-xs leading-4 mt-1" style={{ color: renkler.metinIkincil }}>
                        {secenek.uzunAciklama}
                    </Text>
                    {blokPlan && (
                        <>
                            <ZamanSeridi
                                plan={blokPlan}
                                pencereUzunluguDk={pencereUzunluguDk as number}
                                baslangic={pencere.baslangic}
                                bitis={pencere.bitis}
                                yon={blok.yon}
                                adimBilgileri={tanim.adimBilgileri}
                                animasyonlu={false}
                                erisimEtiketi={seritErisimEtiketi(tanim.baslik, pencere.baslangic, pencere.bitis, cumle)}
                            />
                            <Text className="text-xs leading-4" style={{ color: renkler.metinIkincil }}>
                                {cumle}
                            </Text>
                        </>
                    )}
                </View>
            );
        });
    };

    const adimlar = (
        <>
            {ayar.seviyeler.slice(0, tanim.maksAdim).map((seviye, indeks) => {
                const bilgi = tanim.adimBilgileri[indeks] ?? tanim.adimBilgileri[0];
                const acik = seviyeAcikMi(seviye);
                const notlar = adimNotlariniOlustur(seviye, ayar.seviyeler, {
                    pencereAdi: tanim.baslikKucuk,
                    pencereUzunluguDk: tanim.pencereUzunluguDk,
                    yon: tanim.yon,
                    yetenekler: tanim.yetenekler,
                });
                const notMetni = notlar.map((n) => n.metin).join(' ');
                const ozetMetni = seviyeOzetiOlustur(seviye, tanim.yon);
                return (
                    // Switch, satırı saran Touchable'ın İÇİNDE değil KARDEŞİDİR:
                    // Touchable varsayılan `accessible` ile çocuklarını tek bir
                    // erişilebilirlik düğümüne düzleştirir → içine konan switch
                    // TalkBack'te ayrıca odaklanamaz, dokunma hedefleri de çakışır.
                    <View
                        key={seviye.kademe}
                        className="rounded-xl border mb-2"
                        style={{
                            backgroundColor: renkler.arkaplan,
                            borderColor: renkler.sinir,
                            borderLeftWidth: 4,
                            borderLeftColor: acik ? bilgi.renk : renkler.sinir,
                        }}
                    >
                        <View className="flex-row items-center pr-3">
                            <TouchableOpacity
                                className="flex-row items-center flex-1 p-3"
                                // Soluklaştırma YALNIZ bilgi bölümüne uygulanır; kapalı
                                // adımı yeniden açacak kontrol tam opak kalmalı.
                                style={{ opacity: acik ? 1 : 0.65 }}
                                onPress={() => onAdimSec(indeks)}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={`${bilgi.baslik} adımını düzenleyin. ${ozetMetni}${notMetni ? `. ${notMetni}` : ''}`}
                            >
                                <View
                                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                                    style={{ backgroundColor: acik ? `${bilgi.renk}20` : renkler.sinir }}
                                >
                                    <FontAwesome5
                                        name={acik ? bilgi.ikon : 'bell-slash'}
                                        size={14}
                                        color={acik ? bilgi.renk : renkler.metinIkincil}
                                        solid
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                        {bilgi.baslik}
                                    </Text>
                                    <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                                        {ozetMetni}
                                    </Text>
                                </View>
                                <FontAwesome5
                                    name="chevron-right"
                                    size={12}
                                    color={renkler.metinIkincil}
                                    style={{ marginRight: 4 }}
                                />
                            </TouchableOpacity>

                            {onAdimAcKapa && (
                                <Switch
                                    value={acik}
                                    onValueChange={(deger) => onAdimAcKapa(indeks, deger)}
                                    trackColor={{ false: renkler.sinir, true: `${bilgi.renk}80` }}
                                    thumbColor={acik ? bilgi.renk : '#f4f3f4'}
                                    accessibilityRole="switch"
                                    accessibilityState={{ checked: acik }}
                                    accessibilityLabel={`${bilgi.baslik} adımını açın veya kapatın`}
                                />
                            )}
                        </View>

                        {/* Sessiz sapma birakma (Faz 0): pencereye sigmayan adim
                            ve butce ile seyreltilen siklik burada gorunur olur. */}
                        {notlar.length > 0 && (
                            <View className="px-3 pb-2.5">
                                <AdimNotlari notlar={notlar} />
                            </View>
                        )}
                    </View>
                );
            })}
        </>
    );

    return (
        <View
            className={gomulu ? '' : 'rounded-2xl border mb-3 overflow-hidden'}
            style={
                gomulu
                    ? undefined
                    : {
                        backgroundColor: renkler.kartArkaplan,
                        borderColor: acikMi ? renkler.birincil : renkler.sinir,
                    }
            }
        >
            {/* ── Katman 1: pencere satiri (tek adimli pencerede yok) ── */}
            {!tekAdimli && (
                <TouchableOpacity
                    className="flex-row items-center p-4"
                    onPress={onAcKapa}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: acikMi }}
                    accessibilityLabel={`${tanim.baslik} vakti hatırlatma ayarları. ${ozet}`}
                >
                    <View
                        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                        style={{ backgroundColor: tamamenKapali ? renkler.arkaplan : `${renkler.birincil}20` }}
                    >
                        <FontAwesome5
                            name={tamamenKapali ? 'bell-slash' : tanim.ikon}
                            size={16}
                            color={tamamenKapali ? renkler.metinIkincil : renkler.birincil}
                            solid
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="text-base font-bold" style={{ color: renkler.metin }}>
                            {tanim.baslik}
                        </Text>
                        <Text className="text-xs mt-0.5" style={{ color: renkler.metinIkincil }}>
                            {ozet}
                        </Text>
                    </View>

                    <View
                        className="px-2 py-0.5 rounded-lg mr-2.5"
                        style={{ backgroundColor: tamamenKapali ? renkler.arkaplan : `${renkler.birincil}15` }}
                    >
                        <Text
                            className="text-[11px] font-bold"
                            style={{ color: tamamenKapali ? renkler.metinIkincil : renkler.birincil }}
                        >
                            {aktifSayi}/{ayar.seviyeler.length}
                        </Text>
                    </View>

                    <FontAwesome5
                        name={acikMi ? 'chevron-up' : 'chevron-down'}
                        size={13}
                        color={renkler.metinIkincil}
                    />
                </TouchableOpacity>
            )}

            {/* ── Katman 2: yon + adimlar ── */}
            {govdeGorunur && (
                <View
                    className={tekAdimli ? '' : 'px-4 pb-4 border-t pt-3'}
                    style={tekAdimli ? undefined : { borderTopColor: renkler.sinir }}
                >
                    {yonSecilir && (
                        <>
                            <View className="flex-row items-center justify-between mb-1">
                                <Text
                                    className="text-[11px] font-semibold tracking-wider"
                                    style={{ color: renkler.metinIkincil }}
                                >
                                    NE ZAMAN HATIRLATILSIN
                                </Text>
                                <TouchableOpacity
                                    className="w-11 h-11 items-center justify-center -mr-3"
                                    onPress={() => setBilgiAcik(true)}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityLabel="Bu seçenek ne anlama geliyor?"
                                >
                                    <FontAwesome5 name="question-circle" size={15} color={renkler.metinIkincil} />
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row gap-2 mb-2">
                                {YON_SECENEKLERI.map((secenek) => {
                                    const secili = tanim.yon === secenek.yon;
                                    return (
                                        <TouchableOpacity
                                            key={secenek.yon}
                                            className="flex-1 items-center py-3 px-2 rounded-2xl border"
                                            style={{
                                                minHeight: 44,
                                                backgroundColor: secili ? `${renkler.birincil}15` : renkler.arkaplan,
                                                borderColor: secili ? renkler.birincil : renkler.sinir,
                                                borderWidth: secili ? 2 : 1,
                                            }}
                                            onPress={() => onYonDegistir?.(secenek.yon)}
                                            activeOpacity={0.7}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: secili }}
                                            accessibilityLabel={`${secenek.etiket} — ${secenek.aciklama}`}
                                        >
                                            <FontAwesome5
                                                name={secenek.ikon}
                                                size={14}
                                                color={secili ? renkler.birincil : renkler.metinIkincil}
                                                solid
                                            />
                                            <Text
                                                className="text-xs font-semibold mt-1.5 text-center"
                                                style={{ color: secili ? renkler.birincil : renkler.metin }}
                                            >
                                                {secenek.etiket}
                                            </Text>
                                            <Text
                                                className="text-[11px] mt-0.5 text-center"
                                                style={{ color: renkler.metinIkincil }}
                                            >
                                                {secenek.kisaAciklama}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            {seritCizilir && pencere ? (
                                <>
                                    <ZamanSeridi
                                        testID="zaman-seridi"
                                        plan={plan}
                                        pencereUzunluguDk={pencereUzunluguDk as number}
                                        baslangic={pencere.baslangic}
                                        bitis={pencere.bitis}
                                        yon={yon}
                                        adimBilgileri={tanim.adimBilgileri}
                                        simdi={simdi}
                                        erisimEtiketi={seritErisimEtiketi(
                                            tanim.baslik,
                                            pencere.baslangic,
                                            pencere.bitis,
                                            seritCumlesi
                                        )}
                                    />
                                    <Text
                                        testID="zaman-seridi-cumle"
                                        className="text-xs mb-2.5 leading-4"
                                        style={{ color: renkler.metinIkincil }}
                                    >
                                        {seritCumlesi}
                                    </Text>
                                </>
                            ) : (
                                // Pencere bilinmiyor (konum yok): yanlis resim cizmektense
                                // yalniz metin. Konum gelince serit kendiliginden cizilir.
                                <Text className="text-xs mb-2.5 leading-4" style={{ color: renkler.metinIkincil }}>
                                    {YON_SECENEKLERI.find((x) => x.yon === tanim.yon)?.aciklama}
                                </Text>
                            )}

                            {/* Cevrilemeyen metin ipucu — kullanicinin elle yazdigi anons
                                metnine DOKUNULMAZ, ama yeni yonde ters okunabilir. */}
                            {cevrilemeyenVar && (
                                <AdimNotlari
                                    notlar={[
                                        {
                                            tip: 'uyari',
                                            metin:
                                                'Kendi yazdığınız anons metni bu seçenekte ters okunabilir; adımın detayından güncelleyebilirsiniz.',
                                        },
                                    ]}
                                />
                            )}

                            {/* Giris yonunun kullaniciya gorunen bedeli (Faz 1 / B3) */}
                            {girisYonu && sesliAdimVar && (
                                <AdimNotlari notlar={[{ tip: 'bilgi', metin: GIRIS_SESLI_GECIKME_NOTU }]} />
                            )}
                            <View className="h-2.5" />
                        </>
                    )}

                    {!tekAdimli && (
                        <Text
                            className="text-[11px] font-semibold tracking-wider mb-2.5"
                            style={{ color: renkler.metinIkincil }}
                        >
                            HATIRLATMA ADIMLARI
                        </Text>
                    )}

                    {adimlar}

                    {/* Akisi onizle (spec 3.4) — gercek bildirim GONDERMEZ */}
                    {onAkisiOnizle && (
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-3.5 rounded-2xl mt-1"
                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            onPress={onAkisiOnizle}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={`${tanim.baslik} akışını önizleyin`}
                        >
                            <FontAwesome5 name="stream" size={13} color={renkler.birincil} style={{ marginRight: 8 }} />
                            <Text className="text-sm font-semibold" style={{ color: renkler.birincil }}>
                                Akışı önizle
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Tum vakitlere uygula (spec 4.3) */}
                    {onTumPencerelereUygula && (
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-3.5 rounded-2xl mt-2"
                            style={{ backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            onPress={onTumPencerelereUygula}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel="Tüm vakitlere uygula"
                        >
                            <FontAwesome5 name="clone" size={13} color={renkler.birincil} style={{ marginRight: 8 }} />
                            <Text className="text-sm font-semibold" style={{ color: renkler.birincil }}>
                                Tüm vakitlere uygula
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {yonSecilir && (
                <BildirimModali
                    gorunur={bilgiAcik}
                    tip="bilgi"
                    baslik="Hatırlatmalar ne zaman gelsin?"
                    mesaj={
                        (pencere
                            ? `${tanim.baslik} vakti bugün ${saatMetni(pencere.baslangic)}–${saatMetni(pencere.bitis)}. `
                            : '') +
                        'İki seçenek de aynı dört adımı kullanır; fark, hatırlatmaların vaktin neresinde geldiğidir.'
                    }
                    icerik={
                        <>
                            {seritCizilir
                                ? bilgiBloklari()
                                : YON_SECENEKLERI.map((secenek) => (
                                    <Text
                                        key={secenek.yon}
                                        className="text-xs leading-4 mb-2"
                                        style={{ color: renkler.metinIkincil }}
                                    >
                                        {secenek.etiket}: {secenek.uzunAciklama}
                                    </Text>
                                ))}
                            <Text className="text-[11px] leading-4" style={{ color: renkler.metinIkincil }}>
                                İstediğiniz zaman değiştirebilirsiniz; her seçeneğin zamanlaması ayrı saklanır.
                            </Text>
                        </>
                    }
                    onKapat={() => setBilgiAcik(false)}
                    kapatEtiketi="Anladım"
                />
            )}
        </View>
    );
};