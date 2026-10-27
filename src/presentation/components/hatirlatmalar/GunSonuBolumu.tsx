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
import { NamazVaktiHesaplayiciServisi } from '../../../domain/services/NamazVaktiHesaplayiciServisi';
import { AnahtarSatiri } from '../ortak/AnahtarSatiri';
import { BolumBasligi } from '../ortak/BolumBasligi';
import { SecenekListesi, type Secenek } from '../ortak/SecenekListesi';
import { NotSatiri } from '../ortak/NotSatiri';
import { SayisalSecici } from '../common/SayisalSecici';
import { bicim, metin } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

const gs = () => metin().hatirlatma.gunSonu;

const MODLAR: readonly Secenek<GunSonuBildirimModu>[] = [
    { deger: 'otomatik', get etiket() { return gs().modOtomatik; }, ikon: 'sync-alt' },
    { deger: 'sabit', get etiket() { return gs().modSabit; }, ikon: 'clock' },
];

const GUNLER: readonly Secenek<BildirimGunSecimi>[] = [
    { deger: 'ayniGun', get etiket() { return gs().ayniGun; } },
    { deger: 'ertesiGun', get etiket() { return gs().ertesiGun; } },
];

/**
 * Bugünün yatsısı + yarının imsağı. Kaynak `NamazVaktiHesaplayiciServisi`'dir —
 * `KonumYoneticiServisi` üretimde HİÇ doldurulmaz (AGENTS.md), ona bağlı sınır daima
 * yedek saatte kalırdı. `{0,0}` "yapılandırılmadı" nöbetçisidir → null (yedek sınır).
 */
export function gunSonuSinirVakitleri(simdi: Date = new Date()): { yatsi: Date | null; imsak: Date | null } {
    const servis = NamazVaktiHesaplayiciServisi.getInstance();
    const konfig = servis.getKonfig();
    if (!konfig || (konfig.latitude === 0 && konfig.longitude === 0)) return { yatsi: null, imsak: null };
    const yarin = new Date(simdi);
    yarin.setDate(yarin.getDate() + 1);
    return {
        yatsi: servis.getGunlukVakitler(simdi)?.yatsi ?? null,
        imsak: servis.getGunlukVakitler(yarin)?.imsak ?? null,
    };
}

const saatYazisi = (t: Date | null | undefined) =>
    t ? `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}` : null;

export const GunSonuBolumu: React.FC = () => {
    const renkler = useRenkler();
    const m = useMetin().hatirlatma.gunSonu;
    const dispatch = useAppDispatch();
    const { butonTiklandiFeedback } = useFeedback();
    const ayarlar = useAppSelector((s) => s.seri.ayarlar);

    const yaz = (degisiklik: Partial<SeriAyarlari>) => dispatch(seriAyarlariniGuncelle({ ayarlar: degisiklik }));

    const { yatsi, imsak } = useMemo(() => gunSonuSinirVakitleri(), []);

    const ayniGun = ayarlar.bildirimGunSecimi === 'ayniGun';
    const saatMin = ayniGun ? (yatsi ? yatsi.getHours() : 18) : 0;
    const saatMax = ayniGun ? 23 : imsak ? imsak.getHours() : 6;

    return (
        <View>
            <View style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 }}>
                <AnahtarSatiri
                    ikon="bell"
                    kapaliIkon="bell-slash"
                    baslik={m.baslik}
                    ozet={m.ozet}
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
                    <BolumBasligi metin={m.neZaman} />
                    <SecenekListesi
                        secenekler={MODLAR}
                        secili={ayarlar.gunSonuBildirimModu}
                        onSec={(m) => yaz({ gunSonuBildirimModu: m })}
                        gorunum="cip"
                        erisimEtiketi={m.zamanEtiketi}
                    />

                    {ayarlar.gunSonuBildirimModu === 'otomatik' ? (
                        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ flex: 1, fontSize: 15, color: renkler.metin }}>{m.imsakOncesi}</Text>
                            <SayisalSecici
                                deger={ayarlar.bildirimImsakOncesiDk || 30}
                                min={5}
                                max={120}
                                adim={5}
                                birim={m.dk}
                                renk={renkler.birincil}
                                aciklama={m.imsaktanOnce}
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
                                erisimEtiketi={m.hangiGun}
                            />
                            <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <SayisalSecici
                                    deger={ayarlar.bildirimSaati || saatMin}
                                    min={saatMin}
                                    max={saatMax}
                                    renk={renkler.birincil}
                                    aciklama={m.saat}
                                    onChange={(saat) => yaz({ bildirimSaati: saat })}
                                />
                                <Text style={{ fontSize: 22, fontWeight: '700', color: renkler.metin }}>:</Text>
                                <SayisalSecici
                                    deger={ayarlar.bildirimDakikasi || 0}
                                    min={0}
                                    max={45}
                                    adim={15}
                                    renk={renkler.birincil}
                                    aciklama={m.dakika}
                                    onChange={(dk) => yaz({ bildirimDakikasi: dk })}
                                />
                            </View>
                            <NotSatiri
                                metin={
                                    ayniGun
                                        ? bicim(m.yatsiOnce, { saat: saatYazisi(yatsi) ? ` (${saatYazisi(yatsi)})` : '' })
                                        : bicim(m.imsakSonra, { saat: saatYazisi(imsak) ? ` (${saatYazisi(imsak)})` : '' })
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
