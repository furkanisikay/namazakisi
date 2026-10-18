/**
 * Derin bağlantılar (issue #276): kısayollar ve otomasyon uygulamaları `namazakisi://…`
 * ile açar. `kildim` bir ekran değil eylemdir → navigasyondan DIŞLANIR.
 */
import { getStateFromPath } from '@react-navigation/native';
import { derinBaglantiYapilandirmasi, kildimBaglantisiMi } from '../derinBaglantilar';

const durum = (yol: string) =>
    getStateFromPath(yol, derinBaglantiYapilandirmasi.config as Parameters<typeof getStateFromPath>[1]);

describe('kildimBaglantisiMi', () => {
    it.each(['namazakisi://kildim', 'namazakisi://kildim/', 'NAMAZAKISI://kildim?kaynak=rutin'])('%s → evet', (u) => {
        expect(kildimBaglantisiMi(u)).toBe(true);
    });

    it.each(['namazakisi://kible', 'namazakisi://kildimx', 'https://kildim', '', null, undefined])('%s → hayır', (u) => {
        expect(kildimBaglantisiMi(u)).toBe(false);
    });

    it('kıldım bağlantısı navigasyona girmez (filter)', () => {
        expect(derinBaglantiYapilandirmasi.filter?.('namazakisi://kildim')).toBe(false);
        expect(derinBaglantiYapilandirmasi.filter?.('namazakisi://kible')).toBe(true);
    });
});

describe('ekran eşlemesi', () => {
    it('kible → MainTabs > Kible (Dalga 4: Kıble sekmedir)', () => {
        const kok = durum('kible')?.routes[0];
        expect(kok?.name).toBe('MainTabs');
        expect(kok?.state?.routes[0].name).toBe('Kible');
    });

    it.each(['ilerleme', 'seri', 'istatistik', 'rozetler'])('%s → MainTabs > Ilerleme (eski adlar yeni yere)', (yol) => {
        expect(durum(yol)?.routes[0].state?.routes[0].name).toBe('Ilerleme');
    });

    it('kaza → MainTabs > KazaDefteri', () => {
        const kok = durum('kaza')?.routes[0];
        expect(kok?.name).toBe('MainTabs');
        expect(kok?.state?.routes[0].name).toBe('KazaDefteri');
    });

    it('ana → MainTabs > AnaSayfa', () => {
        expect(durum('ana')?.routes[0].state?.routes[0].name).toBe('AnaSayfa');
    });

    it('ayarlar → MainTabs > Ayarlar > AyarlarAna (saat W3 "Telefonda açın")', () => {
        const sekme = durum('ayarlar')?.routes[0].state?.routes[0];
        expect(sekme?.name).toBe('Ayarlar');
        expect(sekme?.state?.routes.map((r) => r.name)).toEqual(['AyarlarAna']);
    });

    it('camideyim → Ayarlar yığını, altında AyarlarAna (geri tuşu boşa düşmez)', () => {
        const sekme = durum('camideyim')?.routes[0].state?.routes[0];
        expect(sekme?.name).toBe('Ayarlar');
        expect(sekme?.state?.routes.map((r) => r.name)).toEqual(['AyarlarAna', 'CamideyimAyarlari']);
    });
});
