/**
 * Hatırlatmalar sayfasından açılan AYRINTI sayfaları (sade tasarım, Dalga 3).
 *
 * Her biri mevcut bölüm bileşenini (yazma yolu, rıza, bütçe rehberi, debounce aynen)
 * ince bir kabukla sarar: başlık navigasyon header'ındadır (AGENTS.md: başlık TEK
 * yerde), arama çapası (`AyarCapasi`) bölümü vurgular. Eskiden bu bölümlerin hepsi
 * tek "Bildirimler" sayfasında alt alta duruyordu (≥1100 kelime, 61 dokunma hedefi).
 */
import * as React from 'react';
import { ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import { VurguSaglayici } from '../../components/ayar/VurguSaglayici';
import { useVurguKurulumu } from '../../components/ayar/useVurguKurulumu';
import { AyarCapasi } from '../../components/ayar/AyarCapasi';
import type { CapaId } from '../../../core/ayarlar/capalar';
import { CumaHatirlatmaBolumu } from '../../components/cuma/CumaHatirlatmaBolumu';
import { YatisHatirlatmaBolumu } from '../../components/ayar/YatisHatirlatmaBolumu';
import { CamiyeGitBolumu } from '../../components/camiyeGit/CamiyeGitBolumu';
import { TakvimCakismaBolumu } from '../../components/takvimCakisma/TakvimCakismaBolumu';
import { VakitGirinceBolumu } from '../../components/hatirlatmalar/VakitGirinceBolumu';
import { GunSonuBolumu } from '../../components/hatirlatmalar/GunSonuBolumu';
import { OzelGunBolumu } from '../../components/hatirlatmalar/OzelGunBolumu';

const Kabuk: React.FC<{ capa: CapaId; children: React.ReactNode }> = ({ capa, children }) => {
    const renkler = useRenkler();
    const scrollRef = useVurguKurulumu();
    return (
        <ScrollView
            ref={scrollRef}
            style={{ flex: 1, backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <AyarCapasi id={capa}>{children}</AyarCapasi>
        </ScrollView>
    );
};

const sayfa = (capa: CapaId, Icerik: React.FC) => {
    const Sayfa: React.FC = () => (
        <VurguSaglayici>
            <Kabuk capa={capa}>
                <Icerik />
            </Kabuk>
        </VurguSaglayici>
    );
    return Sayfa;
};

export const VakitGirinceSayfasi = sayfa('vakitBildirimleri', VakitGirinceBolumu);
export const CumaHatirlatmaSayfasi = sayfa('cumaHatirlatmasi', () => <CumaHatirlatmaBolumu baslikGizle />);
export const CamiyeGitSayfasi = sayfa('camiyeGitHatirlatmasi', CamiyeGitBolumu);
export const YatisHatirlatmaSayfasi = sayfa('yatisHatirlatmasi', () => <YatisHatirlatmaBolumu baslikGizle />);
export const GunSonuSayfasi = sayfa('gunSonuBildirimi', GunSonuBolumu);
export const OzelGunSayfasi = sayfa('ozelGunModu', OzelGunBolumu);

/** Takvim çakışması: Hatırlatmalar'daki anahtar `ac: true` ile gelirse açma akışı başlar. */
const TakvimCakismaIcerik: React.FC = () => {
    const route = useRoute();
    const ac = (route?.params as { ac?: boolean } | undefined)?.ac === true;
    return <TakvimCakismaBolumu acilistaAc={ac} />;
};
export const TakvimCakismaSayfasi = sayfa('takvimCakismaUyarisi', TakvimCakismaIcerik);
