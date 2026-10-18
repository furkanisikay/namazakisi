/**
 * "Günü tamamlamadıysam" — seri gün sonu hatırlatması. Sade tasarımda (Dalga 3)
 * Bildirimler sayfasından Hatırlatmalar > Günü tamamlamadıysam ayrıntısına taşındı.
 * Yazma yolu aynı: `seriAyarlariniGuncelle` (thunk gün sonu planını tazeler).
 *
 * Sınırlar eskisiyle birebir: otomatik mod imsaktan 5–120 dk önce; sabit modda aynı
 * gün yatsıdan sonra (… 23), ertesi gün imsaktan önce (0 …); dakika 15'lik ızgara.
 */
import * as React from 'react';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useRenkler } from '../../../core/theme';
import { useFeedback } from '../../../core/feedback';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { seriAyarlariniGuncelle } from '../../store/seriSlice';
import type { BildirimGunSecimi, GunSonuBildirimModu, SeriAyarlari } from '../../../core/types/SeriTipleri';
import { KonumYoneticiServisi } from '../../../domain/services/KonumYoneticiServisi';
import { AnahtarSatiri } from '../ortak/AnahtarSatiri';
import { BolumBasligi } from '../ortak/BolumBasligi';
import { SecenekListesi, type Secenek } from '../ortak/SecenekListesi';
import { NotSatiri } from '../ortak/NotSatiri';
import { SayisalSecici } from '../common/SayisalSecici';

const MODLAR: readonly Secenek<GunSonuBildirimModu>[] = [
    { deger: 'otomatik', etiket: 'İmsaktan önce', ikon: 'sync-alt' },
    { deger: 'sabit', etiket: 'Sabit saatte', ikon: 'clock' },
];

const GUNLER: readonly Secenek<BildirimGunSecimi>[] = [
    { deger: 'ayniGun', etiket: 'Aynı gün' },
    { deger: 'ertesiGun', etiket: 'Ertesi gün' },
];

const saatYazisi = (t: Date | null | undefined) =>
    t ? `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}` : null;

export const GunSonuBolumu: React.FC = () => {
    const renkler = useRenkler();
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const ayarlar = useAppSelector((s) => s.seri.ayarlar);

    const yaz = (degisiklik: Partial<SeriAyarlari>) => dispatch(seriAyarlariniGuncelle({ ayarlar: degisiklik }));

    const konum = KonumYoneticiServisi.getInstance();
    const imsak = useMemo(() => konum.sonrakiGunImsakVaktiGetir(), [konum]);
    const yatsi = useMemo(() => konum.bugunYatsiVaktiGetir(), [konum]);

    const ayniGun = ayarlar.bildirimGunSecimi === 'ayniGun';
    const saatMin = ayniGun ? (yatsi ? yatsi.getHours() : 18) : 0;
    const saatMax = ayniGun ? 23 : imsak ? imsak.getHours() : 6;

    return (
        <View>
            <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 }}>
                <AnahtarSatiri
                    ikon="bell"
                    kapaliIkon="bell-slash"
                    baslik="Günü tamamlamadıysam"
                    ozet="Gün bitmeden serinizi hatırlatalım"
                    deger={ayarlar.gunSonuBildirimAktif}
                    onDegistir={async (v) => {
                        await butonTiklandiFeedback();
                        yaz({ gunSonuBildirimAktif: v });
                    }}
                    testID="gun-sonu-anahtari"
                />
            </View>

            {ayarlar.gunSonuBildirimAktif ? (
                <View style={{ marginTop: 20 }}>
                    <BolumBasligi metin="Ne zaman" />
                    <SecenekListesi
                        secenekler={MODLAR}
                        secili={ayarlar.gunSonuBildirimModu}
                        onSec={(m) => yaz({ gunSonuBildirimModu: m })}
                        gorunum="cip"
                        erisimEtiketi="Hatırlatma zamanı"
                    />

                    {ayarlar.gunSonuBildirimModu === 'otomatik' ? (
                        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ flex: 1, fontSize: 15, color: renkler.metin }}>İmsaktan kaç dk önce</Text>
                            <SayisalSecici
                                deger={ayarlar.bildirimImsakOncesiDk || 30}
                                min={5}
                                max={120}
                                adim={5}
                                birim="dk"
                                renk={renkler.birincil}
                                aciklama="İmsaktan önce"
                                onChange={(dk) => yaz({ bildirimImsakOncesiDk: dk })}
                            />
                        </View>
                    ) : (
                        <View style={{ marginTop: 16 }}>
                            <SecenekListesi
                                secenekler={GUNLER}
                                secili={ayarlar.bildirimGunSecimi}
                                onSec={(g) => yaz({ bildirimGunSecimi: g })}
                                gorunum="cip"
                                erisimEtiketi="Hangi gün"
                            />
                            <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <SayisalSecici
                                    deger={ayarlar.bildirimSaati || saatMin}
                                    min={saatMin}
                                    max={saatMax}
                                    renk={renkler.birincil}
                                    aciklama="Saat"
                                    onChange={(saat) => yaz({ bildirimSaati: saat })}
                                />
                                <Text style={{ fontSize: 22, fontWeight: '700', color: renkler.metin }}>:</Text>
                                <SayisalSecici
                                    deger={ayarlar.bildirimDakikasi || 0}
                                    min={0}
                                    max={45}
                                    adim={15}
                                    renk={renkler.birincil}
                                    aciklama="Dakika"
                                    onChange={(dk) => yaz({ bildirimDakikasi: dk })}
                                />
                            </View>
                            <NotSatiri
                                metin={
                                    ayniGun
                                        ? `Yatsı${saatYazisi(yatsi) ? ` (${saatYazisi(yatsi)})` : ''} vaktinden önce seçilemez.`
                                        : `İmsak${saatYazisi(imsak) ? ` (${saatYazisi(imsak)})` : ''} vaktinden sonra seçilemez.`
                                }
                                style={{ marginTop: 12 }}
                            />
                        </View>
                    )}
                </View>
            ) : null}
        </View>
    );
};
