/**
 * Cihaz ekleyin (telefon ↔ tablet; çift yönlü) — iki yol, aynı ekran:
 * - "Bu cihazda kod gösterin": geçici sırlı kare kod; diğer cihaz okutunca BURADA
 *   "Bu telefonu ekleyelim mi?" sorulur (iki uçta onay).
 * - "Diğer cihazın kodunu okutun": kod okunur, BU cihazda "Şu cihaza bağlanılsın mı?" onayı,
 *   sonra istek; karşı taraf onaylayınca eşleşme biter ve ilk eşitleme yapılır.
 * Tabletlerde varsayılan "kod göster", telefonlarda "okut". Başlık navigasyon header'ında.
 */
import * as React from 'react';
import { AccessibilityInfo, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../core/theme';
import { BildirimModali } from '../components/common/BildirimModali';
import { KareKod } from '../components/cihazlar/KareKod';
import { cihazQrYaz, eslesmeQrCoz, type EslesmeQr } from '../../core/cihazAgi/eslesme';
import { buCihazinTuru, CihazEsServisi, cihazAgiDinleyicisiVarMi, cihazKimligi, type EslesmeIstegi } from '../../domain/services/CihazEsServisi';
import { esles, telefonAdi } from '../../domain/services/CihazEslesmeServisi';
import { TvEslemeServisi } from '../../domain/services/TvEslemeServisi';
import { bicim, metin } from '../../core/dil/aktifDil';
import { useMetin } from '../hooks/useMetin';

type Mod = 'goster' | 'okut';
type Durum = { tur: 'bos' } | { tur: 'bilgi'; metin: string } | { tur: 'hata'; metin: string } | { tur: 'tamam'; metin: string };

const KOD_OMRU_MS = 3 * 60_000;

export const CihazEkleSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const m = useMetin().cihaz.ekle;
    const [mod, setMod] = React.useState<Mod>(() => (buCihazinTuru() === 'tablet' ? 'goster' : 'okut'));
    const [qrMetni, setQrMetni] = React.useState<string | null>(null);
    const [istek, setIstek] = React.useState<EslesmeIstegi | null>(null);
    const [onayBekleyen, setOnayBekleyen] = React.useState<EslesmeQr | null>(null);
    const [durum, setDurum] = React.useState<Durum>({ tur: 'bos' });
    const [yenile, setYenile] = React.useState(0);
    const islemde = React.useRef(false);
    const destek = cihazAgiDinleyicisiVarMi();

    // ---- Kod göster ----
    React.useEffect(() => {
        if (mod !== 'goster' || !destek) return undefined;
        const s = CihazEsServisi.getInstance();
        let iptal = false;
        setQrMetni(null);
        setDurum({ tur: 'bos' });
        s.istekDinleyicisi = (i) => !iptal && setIstek(i);
        void s.eslesmeOturumuAc().then((o) => {
            if (iptal) return;
            if (!o) {
                setDurum({ tur: 'hata', metin: metin().cihaz.ekle.agYok });
                return;
            }
            setQrMetni(cihazQrYaz({ adres: o.adres, port: o.port, aliciKimlik: o.kimlik, sir: o.sir, aliciAdi: telefonAdi(), aliciTuru: buCihazinTuru() }));
        });
        const sure = setTimeout(() => {
            if (iptal) return;
            setQrMetni(null);
            setDurum({ tur: 'bilgi', metin: metin().cihaz.ekle.suresiDoldu });
        }, KOD_OMRU_MS);
        return () => {
            iptal = true;
            clearTimeout(sure);
            s.istekDinleyicisi = null;
            s.eslesmeOturumunuKapat();
        };
    }, [mod, destek, yenile]);

    const istegiYanitla = React.useCallback(async (onay: boolean) => {
        const i = istek;
        setIstek(null);
        await CihazEsServisi.getInstance().eslesmeyiYanitla(onay);
        if (onay && i) {
            setQrMetni(null);
            setDurum({ tur: 'tamam', metin: bicim(m.eklendi, { ad: i.cihazAdi }) });
            AccessibilityInfo.announceForAccessibility(bicim(m.eklendiErisim, { ad: i.cihazAdi }));
        } else {
            setDurum({ tur: 'bilgi', metin: m.eklenmedi });
        }
    }, [istek, m]);

    // ---- Kod okut ----
    const metniIsle = React.useCallback((okunan: string) => {
        const qr = eslesmeQrCoz(okunan);
        if (!qr) return setDurum({ tur: 'hata', metin: metin().cihaz.ekle.yabanciKod });
        if (qr.tur !== 'cihaz') return setDurum({ tur: 'hata', metin: metin().cihaz.ekle.tvKodu });
        setDurum({ tur: 'bos' });
        setOnayBekleyen(qr);
    }, []);
    const metniIsleRef = React.useRef(metniIsle);
    metniIsleRef.current = metniIsle;
    React.useEffect(() => TvEslemeServisi.iosOkumaDinle((m) => metniIsleRef.current(m)), []);

    const okut = React.useCallback(async () => {
        if (islemde.current) return;
        setDurum({ tur: 'bos' });
        const okuma = await TvEslemeServisi.qrOku();
        if (okuma.tur === 'okundu') metniIsle(okuma.metin);
        else if (okuma.tur === 'kameraIzniYok') setDurum({ tur: 'hata', metin: m.kameraIzni });
        else if (okuma.tur === 'tarayiciYok') setDurum({ tur: 'hata', metin: m.kameraYok });
    }, [metniIsle, m]);

    const baglan = React.useCallback(async (qr: EslesmeQr) => {
        setOnayBekleyen(null);
        if (islemde.current) return;
        islemde.current = true;
        try {
            const s = CihazEsServisi.getInstance();
            const port = await s.dinlemeyiBaslat(true);
            const adres = await s.yerelAdres();
            if (!port || !adres) {
                setDurum({ tur: 'hata', metin: m.agYokIkisi });
                return;
            }
            setDurum({ tur: 'bilgi', metin: bicim(m.ekleyinDokunun, { ad: qr.aliciAdi }) });
            const sonuc = await esles(qr, { kendi: { kimlik: await cihazKimligi(), adres, port, tur: buCihazinTuru() } });
            if (sonuc === 'onay') {
                await s.esitle().catch(() => undefined);
                setDurum({ tur: 'tamam', metin: bicim(m.eklendi, { ad: qr.aliciAdi }) });
                AccessibilityInfo.announceForAccessibility(bicim(m.eklendiErisim, { ad: qr.aliciAdi }));
            } else if (sonuc === 'red') {
                setDurum({ tur: 'hata', metin: bicim(m.hayirSecildi, { ad: qr.aliciAdi }) });
            } else if (sonuc === 'gecersiz' || sonuc === 'zamanAsimi') {
                setDurum({ tur: 'hata', metin: m.zamanAsimi });
            } else if (sonuc !== 'iptal') {
                setDurum({ tur: 'hata', metin: m.ulasilamadi });
            }
        } finally {
            islemde.current = false;
        }
    }, [m]);

    const kart = { backgroundColor: renkler.kartArkaplan, borderRadius: 24, borderWidth: 1, borderColor: renkler.sinir };

    return (
        <ScrollView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            <Text className="text-sm mb-4 px-1" style={{ color: renkler.metinIkincil, lineHeight: 20 }}>
                {m.giris}
            </Text>

            <View className="flex-row p-1 mb-5" style={{ ...kart, borderRadius: 18 }} accessibilityRole="tablist">
                {(['goster', 'okut'] as const).map((sekme) => {
                    const secili = mod === sekme;
                    return (
                        <TouchableOpacity
                            key={sekme}
                            testID={`cihaz-ekle-${sekme}`}
                            className="flex-1 items-center justify-center rounded-2xl"
                            // İç boşluk: uzun dilde iki satıra kırılan etiket kenara yapışmasın.
                            style={{ minHeight: 48, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: secili ? renkler.birincil : 'transparent' }}
                            onPress={() => setMod(sekme)}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: secili }}
                        >
                            <Text
                                testID={`cihaz-ekle-${sekme}-metin`}
                                className="text-sm font-bold text-center"
                                style={{ color: secili ? renkler.birincilMetin : renkler.metin }}
                            >
                                {sekme === 'goster' ? m.kodGoster : m.kodOkut}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {!destek && (
                <View className="p-5" style={kart}>
                    <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                        {m.desteklenmiyor}
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: renkler.metinIkincil }}>
                        {m.guncelleyin}
                    </Text>
                </View>
            )}

            {destek && mod === 'goster' && (
                <View className="items-center p-6" style={kart}>
                    {qrMetni ? (
                        <KareKod metin={qrMetni} boyut={240} erisimEtiketi={m.kareKodErisim} />
                    ) : (
                        <View style={{ width: 240, height: 240, borderRadius: 20, backgroundColor: renkler.arkaplan, alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesome5 name="qrcode" size={40} color={renkler.metinIkincil} />
                        </View>
                    )}
                    <Text className="text-base font-semibold text-center mt-5" style={{ color: renkler.metin }}>
                        {m.yol}
                    </Text>
                    <Text className="text-sm text-center mt-1" style={{ color: renkler.metinIkincil }}>
                        {m.kodGecerli}
                    </Text>
                    {!qrMetni && durum.tur !== 'tamam' && (
                        <TouchableOpacity
                            className="mt-4 px-5 rounded-xl items-center justify-center"
                            style={{ minHeight: 44, backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            onPress={() => setYenile((n) => n + 1)}
                            accessibilityRole="button"
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                {m.yenileyin}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {destek && mod === 'okut' && (
                <View className="p-5" style={kart}>
                    <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                        {m.digerindeAcin}
                    </Text>
                    <Text className="text-sm mt-1 mb-4" style={{ color: renkler.metinIkincil }}>
                        {m.sonraOkutun}
                    </Text>
                    <TouchableOpacity
                        testID="cihaz-ekle-okut-dugme"
                        className="flex-row items-center justify-center rounded-2xl px-5 py-2"
                        style={{ minHeight: 52, backgroundColor: renkler.birincil }}
                        onPress={() => void okut()}
                        accessibilityRole="button"
                        accessibilityLabel={m.kodOkut}
                    >
                        <FontAwesome5 name="qrcode" size={16} color={renkler.birincilMetin} style={{ marginRight: 10 }} />
                        <Text className="text-base font-bold text-center" style={{ color: renkler.birincilMetin, flexShrink: 1 }}>
                            {m.kodOkut}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {durum.tur !== 'bos' && (
                <View className="flex-row items-start mt-4 px-1" accessibilityLiveRegion="polite">
                    <FontAwesome5
                        name={durum.tur === 'tamam' ? 'check-circle' : durum.tur === 'hata' ? 'exclamation-circle' : 'info-circle'}
                        size={16}
                        color={durum.tur === 'tamam' ? renkler.basarili : durum.tur === 'hata' ? renkler.hata : renkler.bilgi}
                        style={{ marginTop: 2, marginRight: 10 }}
                        solid
                    />
                    <Text testID="cihaz-ekle-durum" className="text-sm flex-1" style={{ color: renkler.metin }}>
                        {durum.metin}
                    </Text>
                </View>
            )}

            <BildirimModali
                gorunur={istek != null}
                tip="bilgi"
                baslik={m.istekBaslik}
                mesaj={istek ? bicim(m.istekMesaj, { ad: istek.cihazAdi }) : ''}
                birincilEtiket={m.ekleyin}
                birincilIkon="link"
                onBirincil={() => void istegiYanitla(true)}
                kapatEtiketi={m.hayir}
                onKapat={() => void istegiYanitla(false)}
            />
            <BildirimModali
                gorunur={onayBekleyen != null}
                tip="bilgi"
                baslik={m.baglanBaslik}
                mesaj={onayBekleyen ? bicim(m.baglanMesaj, { ad: onayBekleyen.aliciAdi }) : ''}
                birincilEtiket={m.baglanin}
                birincilIkon="link"
                onBirincil={() => onayBekleyen && void baglan(onayBekleyen)}
                kapatEtiketi={m.vazgecin}
                onKapat={() => setOnayBekleyen(null)}
            />
        </ScrollView>
    );
};
