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
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../core/theme';
import { BildirimModali } from '../components/common/BildirimModali';
import { KareKod } from '../components/cihazlar/KareKod';
import { cihazQrYaz, eslesmeQrCoz, type EslesmeQr } from '../../core/cihazAgi/eslesme';
import { buCihazinTuru, CihazEsServisi, cihazAgiDinleyicisiVarMi, cihazKimligi, type EslesmeIstegi } from '../../domain/services/CihazEsServisi';
import { esles, telefonAdi } from '../../domain/services/CihazEslesmeServisi';
import { TvEslemeServisi } from '../../domain/services/TvEslemeServisi';

type Mod = 'goster' | 'okut';
type Durum = { tur: 'bos' } | { tur: 'bilgi'; metin: string } | { tur: 'hata'; metin: string } | { tur: 'tamam'; metin: string };

const KOD_OMRU_MS = 3 * 60_000;

export const CihazEkleSayfasi: React.FC = () => {
    const renkler = useRenkler();
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
                setDurum({ tur: 'hata', metin: 'Bu cihaz yerel ağa bağlı görünmüyor. Wi-Fi’yi açıp yeniden deneyin.' });
                return;
            }
            setQrMetni(cihazQrYaz({ adres: o.adres, port: o.port, aliciKimlik: o.kimlik, sir: o.sir, aliciAdi: telefonAdi(), aliciTuru: buCihazinTuru() }));
        });
        const sure = setTimeout(() => {
            if (iptal) return;
            setQrMetni(null);
            setDurum({ tur: 'bilgi', metin: 'Kodun süresi doldu. Yeni kod için “Yenileyin”e dokunun.' });
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
            setDurum({ tur: 'tamam', metin: `${i.cihazAdi} eklendi. Kıldığınız namazlar iki cihaz arasında eşitlenir.` });
            AccessibilityInfo.announceForAccessibility(`${i.cihazAdi} eklendi`);
        } else {
            setDurum({ tur: 'bilgi', metin: 'Eklenmedi. İsterseniz kodu yenileyip yeniden deneyin.' });
        }
    }, [istek]);

    // ---- Kod okut ----
    const metniIsle = React.useCallback((metin: string) => {
        const qr = eslesmeQrCoz(metin);
        if (!qr) return setDurum({ tur: 'hata', metin: 'Bu kare kod Namaz Akışı’na ait değil. Diğer cihazda “Bu cihazda kod gösterin”i açın.' });
        if (qr.tur !== 'cihaz') return setDurum({ tur: 'hata', metin: 'Bu kod bir TV’ye ait. TV’yi Cihazlarım › TV ekleyin sayfasından ekleyin.' });
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
        else if (okuma.tur === 'kameraIzniYok') setDurum({ tur: 'hata', metin: 'Kodu okumak için kamera izni gerekir. Telefon ayarlarından kamerayı açın.' });
        else if (okuma.tur === 'tarayiciYok') setDurum({ tur: 'hata', metin: 'Kamera bu cihazda açılamadı.' });
    }, [metniIsle]);

    const baglan = React.useCallback(async (qr: EslesmeQr) => {
        setOnayBekleyen(null);
        if (islemde.current) return;
        islemde.current = true;
        try {
            const s = CihazEsServisi.getInstance();
            const port = await s.dinlemeyiBaslat(true);
            const adres = await s.yerelAdres();
            if (!port || !adres) {
                setDurum({ tur: 'hata', metin: 'Bu cihaz yerel ağa bağlı görünmüyor. İki cihaz da aynı Wi-Fi’de olmalı.' });
                return;
            }
            setDurum({ tur: 'bilgi', metin: `${qr.aliciAdi} üzerinde “Ekleyin”e dokunun…` });
            const sonuc = await esles(qr, { kendi: { kimlik: await cihazKimligi(), adres, port, tur: buCihazinTuru() } });
            if (sonuc === 'onay') {
                await s.esitle().catch(() => undefined);
                setDurum({ tur: 'tamam', metin: `${qr.aliciAdi} eklendi. Kıldığınız namazlar iki cihaz arasında eşitlenir.` });
                AccessibilityInfo.announceForAccessibility(`${qr.aliciAdi} eklendi`);
            } else if (sonuc === 'red') {
                setDurum({ tur: 'hata', metin: `${qr.aliciAdi} üzerinde “Hayır” seçildi; eklenmedi.` });
            } else if (sonuc === 'gecersiz' || sonuc === 'zamanAsimi') {
                setDurum({ tur: 'hata', metin: 'Kodun süresi doldu ya da onay gelmedi. Diğer cihazda kodu yenileyip yeniden okutun.' });
            } else if (sonuc !== 'iptal') {
                setDurum({ tur: 'hata', metin: 'Diğer cihaza ulaşılamadı. İki cihaz da aynı Wi-Fi’de ve uygulama açık olmalı.' });
            }
        } finally {
            islemde.current = false;
        }
    }, []);

    const kart = { backgroundColor: renkler.kartArkaplan, borderRadius: 24, borderWidth: 1, borderColor: renkler.sinir };

    return (
        <ScrollView className="flex-1" style={{ backgroundColor: renkler.arkaplan }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            <Text className="text-sm mb-4 px-1" style={{ color: renkler.metinIkincil, lineHeight: 20 }}>
                Telefonunuzu ve tabletinizi birbirine ekleyin: birinde işaretlediğiniz namaz, aynı Wi-Fi’de ve iki cihazda da
                uygulama açıkken öbürüne hemen geçer; değilse ikisi bir sonraki kez birlikte açık olduğunda.
            </Text>

            <View className="flex-row p-1 mb-5" style={{ ...kart, borderRadius: 18 }} accessibilityRole="tablist">
                {(['goster', 'okut'] as const).map((m) => {
                    const secili = mod === m;
                    return (
                        <TouchableOpacity
                            key={m}
                            testID={`cihaz-ekle-${m}`}
                            className="flex-1 items-center justify-center rounded-2xl"
                            style={{ minHeight: 48, backgroundColor: secili ? renkler.birincil : 'transparent' }}
                            onPress={() => setMod(m)}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: secili }}
                        >
                            <Text className="text-sm font-bold" style={{ color: secili ? renkler.birincilMetin : renkler.metin }}>
                                {m === 'goster' ? 'Bu cihazda kod gösterin' : 'Kodu okutun'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {!destek && (
                <View className="p-5" style={kart}>
                    <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                        Bu sürüm cihaz eklemeyi desteklemiyor
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: renkler.metinIkincil }}>
                        Uygulamayı güncelledikten sonra yeniden deneyin.
                    </Text>
                </View>
            )}

            {destek && mod === 'goster' && (
                <View className="items-center p-6" style={kart}>
                    {qrMetni ? (
                        <KareKod metin={qrMetni} boyut={240} erisimEtiketi="Diğer cihazla okutulacak kare kod" />
                    ) : (
                        <View style={{ width: 240, height: 240, borderRadius: 20, backgroundColor: renkler.arkaplan, alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesome5 name="qrcode" size={40} color={renkler.metinIkincil} />
                        </View>
                    )}
                    <Text className="text-base font-semibold text-center mt-5" style={{ color: renkler.metin }}>
                        Diğer cihazda Ayarlar › Cihazlarım › Cihaz ekleyin › Kodu okutun
                    </Text>
                    <Text className="text-sm text-center mt-1" style={{ color: renkler.metinIkincil }}>
                        Kod 3 dakika geçerli; okutulunca bu cihazda onayınız istenir.
                    </Text>
                    {!qrMetni && durum.tur !== 'tamam' && (
                        <TouchableOpacity
                            className="mt-4 px-5 rounded-xl items-center justify-center"
                            style={{ minHeight: 44, backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                            onPress={() => setYenile((n) => n + 1)}
                            accessibilityRole="button"
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                Yenileyin
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {destek && mod === 'okut' && (
                <View className="p-5" style={kart}>
                    <Text className="text-base font-semibold" style={{ color: renkler.metin }}>
                        Diğer cihazda “Bu cihazda kod gösterin”i açın
                    </Text>
                    <Text className="text-sm mt-1 mb-4" style={{ color: renkler.metinIkincil }}>
                        Sonra aşağıdaki düğmeyle ekrandaki kodu okutun. İki cihaz aynı Wi-Fi’de olmalı.
                    </Text>
                    <TouchableOpacity
                        testID="cihaz-ekle-okut-dugme"
                        className="flex-row items-center justify-center rounded-2xl px-5"
                        style={{ minHeight: 52, backgroundColor: renkler.birincil }}
                        onPress={() => void okut()}
                        accessibilityRole="button"
                        accessibilityLabel="Kodu okutun"
                    >
                        <FontAwesome5 name="qrcode" size={16} color={renkler.birincilMetin} style={{ marginRight: 10 }} />
                        <Text className="text-base font-bold" style={{ color: renkler.birincilMetin }}>
                            Kodu okutun
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
                baslik="Bu cihazı ekleyelim mi?"
                mesaj={istek ? `${istek.cihazAdi} bu cihaza eklenecek. Kıldığınız namazlar iki cihaz arasında eşitlenir.` : ''}
                birincilEtiket="Ekleyin"
                birincilIkon="link"
                onBirincil={() => void istegiYanitla(true)}
                kapatEtiketi="Hayır"
                onKapat={() => void istegiYanitla(false)}
            />
            <BildirimModali
                gorunur={onayBekleyen != null}
                tip="bilgi"
                baslik="Bu cihaza bağlanılsın mı?"
                mesaj={onayBekleyen ? `Şu cihaza bağlanıyorsunuz: ${onayBekleyen.aliciAdi}. Onaylarsanız kıldığınız namazlar iki cihaz arasında eşitlenir.` : ''}
                birincilEtiket="Bağlanın"
                birincilIkon="link"
                onBirincil={() => onayBekleyen && void baglan(onayBekleyen)}
                kapatEtiketi="Vazgeçin"
                onKapat={() => setOnayBekleyen(null)}
            />
        </ScrollView>
    );
};
