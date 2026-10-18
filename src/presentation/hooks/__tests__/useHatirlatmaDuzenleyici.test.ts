/**
 * Tek hatırlatma düzenleyicisi (birleşik hatırlatma modülü PR-3) — durum makinesi.
 */
import { act, renderHook } from '@testing-library/react-native';
import { useHatirlatmaDuzenleyici, type HatirlatmaIslemleri } from '../useHatirlatmaDuzenleyici';
import { ekAdim, adimEkle, adimGuncelle, adimSil, type AdimliAyar } from '../../../core/hatirlatma/adimDizisi';
import { seviyeyiKapat } from '../../../core/muhafiz/seviyeAcKapa';

const KISIT = { maksAdim: 3, tekrarMinDk: 5, tekrarMaxDk: 60, esikMinDk: 15, esikMaxDk: 180, esikAdimDk: 15 };
const ISLEMLER: HatirlatmaIslemleri<AdimliAyar> = {
    adimlar: (a) => a.adimlar,
    ekle: (a) => adimEkle(a, 'cikisaDogru', KISIT),
    guncelle: (a, i, s) => adimGuncelle(a, i, s, 'cikisaDogru', KISIT),
    sil: (a, i) => adimSil(a, i),
};

function kur(deger: AdimliAyar, yazSonucu = true, bosMetinOtomatik = true) {
    const yaz = jest.fn(() => yazSonucu);
    const onDetayAcildi = jest.fn();
    const onDetayKapandi = jest.fn();
    const r = renderHook(() =>
        useHatirlatmaDuzenleyici({ deger, yon: 'cikisaDogru', islemler: ISLEMLER, yaz, bosMetinOtomatik, onDetayAcildi, onDetayKapandi })
    );
    return { r, yaz, onDetayAcildi, onDetayKapandi };
}

describe('useHatirlatmaDuzenleyici', () => {
    const tek: AdimliAyar = { aktif: true, adimlar: [ekAdim(60)] };

    it('adım ekleme yazılırsa YENİ adımın detayı açılır', () => {
        const { r, yaz, onDetayAcildi } = kur(tek);
        act(() => r.result.current.adimEkle());
        expect(yaz).toHaveBeenCalledTimes(1);
        const yeni = (yaz.mock.calls[0] as unknown as [AdimliAyar])[0];
        expect(yeni.adimlar.map((a) => a.esikDk)).toEqual([75, 60]);
        expect(r.result.current.detay).toBe(0);
        expect(onDetayAcildi).toHaveBeenCalledTimes(1);
    });

    it('yazılamazsa (bütçe) detay AÇILMAZ', () => {
        const { r } = kur(tek, false);
        act(() => r.result.current.adimEkle());
        expect(r.result.current.detay).toBeNull();
    });

    it('rıza adım yazımıyla BİRLİKTE iletilir', () => {
        const { r, yaz } = kur(tek);
        act(() => r.result.current.adimDegistir(0, { ...tek.adimlar[0], kanallar: { bildirim: true, sesli: true } }, { sesliOnayi: true }));
        expect(yaz).toHaveBeenCalledWith(expect.objectContaining({ aktif: true }), { sesliOnayi: true });
    });

    it('liste anahtarı: kapatma kanal hafızasını yazar; ek yüzeyde geri açınca metin BOŞ kalır (otomatik)', () => {
        const sesli: AdimliAyar = { aktif: true, adimlar: [seviyeyiKapat(ekAdim(60, 'birkez', { sesli: true }))] };
        const { r, yaz } = kur(sesli);
        act(() => r.result.current.adimAcKapa(0, true));
        const yeni = (yaz.mock.calls[0] as unknown as [AdimliAyar])[0];
        expect(yeni.adimlar[0].kanallar).toEqual({ sesli: true });
        expect(yeni.adimlar[0].anonsMetni).toBe('');
    });

    it('muhafız (boş = sessiz): geri açılan sesli adımın kutusu şablonla dolar', () => {
        const sesli: AdimliAyar = { aktif: true, adimlar: [seviyeyiKapat(ekAdim(60, 'birkez', { sesli: true }))] };
        const { r, yaz } = kur(sesli, true, false);
        act(() => r.result.current.adimAcKapa(0, true));
        const yeni = (yaz.mock.calls[0] as unknown as [AdimliAyar])[0];
        expect(yeni.adimlar[0].anonsMetni).toContain('{vakit}');
    });

    it('zaten istenen durumdaki adım için YAZIM YOK; detay kapanışı kancayı çağırır', () => {
        const { r, yaz, onDetayKapandi } = kur(tek);
        act(() => r.result.current.adimAcKapa(0, true));
        expect(yaz).not.toHaveBeenCalled();
        act(() => r.result.current.detayiAc(0));
        act(() => r.result.current.detayiKapat());
        expect(r.result.current.detay).toBeNull();
        expect(onDetayKapandi).toHaveBeenCalledTimes(1);
    });
});
