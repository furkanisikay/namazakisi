import {
  ARALIK_PAYI_MS,
  EsitlemeKarariGirdisi,
  SIKLIK_ARALIGI_MS,
  VARSAYILAN_ESITLEME_TERCIHLERI,
  esitlemeKarari,
  esitlemeTercihleriniNormalizeEt,
  gorunurBeklemeMi,
} from '../esitlemePolitikasi';
import { BILINMEYEN_SISTEM_DURUMU, SistemDurumu } from '../../sistem/sistemDurumu';

const SIMDI = Date.UTC(2026, 9, 22, 12, 0, 0);
const DK = 60_000;

const wifi: SistemDurumu = { ...BILINMEYEN_SISTEM_DURUMU, agTuru: 'wifi', olculuAg: false, sarjda: false, gucTasarrufu: false };

const g = (x: Partial<EsitlemeKarariGirdisi> = {}): EsitlemeKarariGirdisi => ({
  tetik: 'oneGelis',
  tercih: { ...VARSAYILAN_ESITLEME_TERCIHLERI },
  sistem: wifi,
  sonDenemeMs: SIMDI - 60 * DK,
  bekliyordu: false,
  simdiMs: SIMDI,
  ...x,
});

describe('esitlemeTercihleriniNormalizeEt', () => {
  it('varsayılan en iyi deneyim: değişince, her ağ, şarj gerekmez', () => {
    expect(esitlemeTercihleriniNormalizeEt(undefined)).toEqual({ siklik: 'degisince', yalnizWifi: false, yalnizSarjda: false });
  });
  it('bozuk alanlar varsayılana düşer', () => {
    expect(esitlemeTercihleriniNormalizeEt({ siklik: 'hergun', yalnizWifi: 'evet', yalnizSarjda: true })).toEqual({
      siklik: 'degisince',
      yalnizWifi: false,
      yalnizSarjda: true,
    });
  });
});

describe('esitlemeKarari', () => {
  it('olağan durumda koşar', () => {
    expect(esitlemeKarari(g())).toEqual({ kos: true });
  });

  it('"Yalnız elle" hiçbir otomatik turu koşturmaz', () => {
    for (const tetik of ['acilis', 'oneGelis', 'arkaPlan', 'degisiklik', 'kosulDegisti'] as const) {
      expect(esitlemeKarari(g({ tetik, tercih: { ...VARSAYILAN_ESITLEME_TERCIHLERI, siklik: 'elle' } }))).toEqual({
        kos: false,
        neden: 'elle',
      });
    }
  });

  it('değişiklik turu yalnız "Değişince"de koşar ve aralığa takılmaz', () => {
    expect(esitlemeKarari(g({ tetik: 'degisiklik', sonDenemeMs: SIMDI - DK }))).toEqual({ kos: true });
    expect(
      esitlemeKarari(g({ tetik: 'degisiklik', tercih: { ...VARSAYILAN_ESITLEME_TERCIHLERI, siklik: 'saatlik' } }))
    ).toEqual({ kos: false, neden: 'siklik' });
  });

  it('ağ yokken hiç denenmez', () => {
    expect(esitlemeKarari(g({ sistem: { ...wifi, agTuru: 'yok' } }))).toEqual({ kos: false, neden: 'agYok' });
  });

  it('Veri Tasarrufu / Düşük Veri Modu YALNIZ arka plan turunu durdurur', () => {
    const kisitli = { ...wifi, veriTasarrufu: 'acik' as const };
    expect(esitlemeKarari(g({ tetik: 'arkaPlan', sistem: kisitli }))).toEqual({ kos: false, neden: 'veriTasarrufu' });
    expect(esitlemeKarari(g({ tetik: 'oneGelis', sistem: kisitli }))).toEqual({ kos: true });
    // Kullanıcı bu uygulamaya sınırsız veri izni verdiyse arka plan da koşar.
    expect(esitlemeKarari(g({ tetik: 'arkaPlan', sistem: { ...wifi, veriTasarrufu: 'muaf' } }))).toEqual({ kos: true });
  });

  it('ölçülen ağ tek başına durdurmaz; "Yalnız Wi-Fi" açıksa bekler', () => {
    const hucresel = { ...wifi, agTuru: 'hucresel' as const, olculuAg: true };
    expect(esitlemeKarari(g({ sistem: hucresel }))).toEqual({ kos: true });
    const yalnizWifi = { ...VARSAYILAN_ESITLEME_TERCIHLERI, yalnizWifi: true };
    expect(esitlemeKarari(g({ sistem: hucresel, tercih: yalnizWifi }))).toEqual({ kos: false, neden: 'wifi' });
    // Ölçülen Wi-Fi (kişisel erişim noktası) da bekler; ağ türü bilinmiyorsa (eski build) koşar.
    expect(esitlemeKarari(g({ sistem: { ...wifi, olculuAg: true }, tercih: yalnizWifi }))).toEqual({ kos: false, neden: 'wifi' });
    expect(esitlemeKarari(g({ sistem: BILINMEYEN_SISTEM_DURUMU, tercih: yalnizWifi }))).toEqual({ kos: true });
  });

  it('"Yalnız şarjdayken"; şarj bilinmiyorsa koşar', () => {
    const t = { ...VARSAYILAN_ESITLEME_TERCIHLERI, yalnizSarjda: true };
    expect(esitlemeKarari(g({ tercih: t }))).toEqual({ kos: false, neden: 'sarj' });
    expect(esitlemeKarari(g({ tercih: t, sistem: { ...wifi, sarjda: true } }))).toEqual({ kos: true });
    expect(esitlemeKarari(g({ tercih: t, sistem: { ...wifi, sarjda: null } }))).toEqual({ kos: true });
  });

  it('güç tasarrufu şarjda değilken erteler; şarjda koşar', () => {
    expect(esitlemeKarari(g({ sistem: { ...wifi, gucTasarrufu: true } }))).toEqual({ kos: false, neden: 'gucTasarrufu' });
    expect(esitlemeKarari(g({ sistem: { ...wifi, gucTasarrufu: true, sarjda: true } }))).toEqual({ kos: true });
    expect(esitlemeKarari(g({ tetik: 'degisiklik', sistem: { ...wifi, gucTasarrufu: true } }))).toEqual({
      kos: false,
      neden: 'gucTasarrufu',
    });
  });

  it('sıklık aralığı (2 dk pay ile); açılış "Değişince"/"15 dk"da beklemez, saatlikte bekler', () => {
    const saatlik = { ...VARSAYILAN_ESITLEME_TERCIHLERI, siklik: 'saatlik' as const };
    expect(esitlemeKarari(g({ tercih: saatlik, sonDenemeMs: SIMDI - 30 * DK }))).toEqual({ kos: false, neden: 'siklik' });
    expect(esitlemeKarari(g({ tercih: saatlik, sonDenemeMs: SIMDI - 59 * DK }))).toEqual({ kos: true });
    expect(esitlemeKarari(g({ tetik: 'acilis', tercih: saatlik, sonDenemeMs: SIMDI - 30 * DK }))).toEqual({
      kos: false,
      neden: 'siklik',
    });
    expect(esitlemeKarari(g({ tetik: 'acilis', sonDenemeMs: SIMDI - DK }))).toEqual({ kos: true });
    expect(esitlemeKarari(g({ tetik: 'arkaPlan', sonDenemeMs: SIMDI - (SIKLIK_ARALIGI_MS.degisince - ARALIK_PAYI_MS) }))).toEqual({
      kos: true,
    });
    const gunluk = { ...VARSAYILAN_ESITLEME_TERCIHLERI, siklik: 'gunluk' as const };
    expect(esitlemeKarari(g({ tetik: 'arkaPlan', tercih: gunluk, sonDenemeMs: SIMDI - 12 * 60 * DK }))).toEqual({
      kos: false,
      neden: 'siklik',
    });
  });

  it('koşul düzelince bekleyen tur aralığı beklemeden koşar', () => {
    expect(esitlemeKarari(g({ tetik: 'kosulDegisti', sonDenemeMs: SIMDI - DK, bekliyordu: true }))).toEqual({ kos: true });
    expect(esitlemeKarari(g({ tetik: 'kosulDegisti', sonDenemeMs: SIMDI - DK, bekliyordu: false }))).toEqual({
      kos: false,
      neden: 'siklik',
    });
  });

  it('saat geri alındıysa (son deneme gelecekte) tur kilitlenmez', () => {
    expect(esitlemeKarari(g({ sonDenemeMs: SIMDI + 60 * DK }))).toEqual({ kos: true });
  });

  it('görünür bekleme: sıklık ve "yalnız elle" olağandır, gösterilmez', () => {
    expect(gorunurBeklemeMi('wifi')).toBe(true);
    expect(gorunurBeklemeMi('gucTasarrufu')).toBe(true);
    expect(gorunurBeklemeMi('siklik')).toBe(false);
    expect(gorunurBeklemeMi('elle')).toBe(false);
    expect(gorunurBeklemeMi(null)).toBe(false);
  });
});
