import { canliTaniCoz, canliTaniSatirlari, canliTeshisi, type CanliTani } from '../canliTani';

const taban: CanliTani = {
  sdkInt: 36,
  sdkTam: 3600000,
  samsung: true,
  oneUi: '8.0',
  izinVar: true,
  planOlaySayisi: 2,
  sonrakiAlarmMs: null,
  sonPlanMs: null,
  gosterilenler: [],
  sonGosterim: null,
  aktifBildirimler: [],
};

const gosterim = {
  zamanMs: 0,
  id: 'sayac_2026-10-19_ikindi',
  tema: 'vakit',
  kanalId: 'canli_sayac',
  kanalOnemi: 3,
  oneCikarilabilir: true,
  izinVar: true,
  oneCikarildi: false,
  hata: null,
};

describe('canliTaniCoz', () => {
  it('native JSON ünü çözer (Kotlin taniJsonu alan adları)', () => {
    const ham = JSON.stringify({
      sdkInt: 36,
      sdkTam: null,
      samsung: true,
      oneUi: '8.0',
      izinVar: true,
      planOlaySayisi: 3,
      sonrakiAlarmMs: 5000,
      sonPlanMs: null,
      gosterilenler: ['a', 7],
      sonGosterim: { ...gosterim, kanalOnemi: null, oneCikarildi: null },
      aktifBildirimler: [{ id: 'a', oneCikarildi: true }, { oneCikarildi: false }],
    });
    const t = canliTaniCoz(ham)!;
    expect(t.sdkTam).toBeNull();
    expect(t.gosterilenler).toEqual(['a']);
    expect(t.sonGosterim?.oneCikarildi).toBeNull();
    expect(t.aktifBildirimler).toEqual([{ id: 'a', oneCikarildi: true }]);
  });

  it('bozuk girdide null döner, fırlatmaz', () => {
    expect(canliTaniCoz(null)).toBeNull();
    expect(canliTaniCoz('{')).toBeNull();
    expect(canliTaniCoz('[]')).toBeNull();
    expect(canliTaniCoz('{"samsung":true}')).toBeNull();
  });
});

describe('canliTeshisi', () => {
  it('izin ve destek kapıları önce gelir', () => {
    expect(canliTeshisi('desteklenmiyor', taban).tip).toBe('desteklenmiyor');
    expect(canliTeshisi('acik', null).tip).toBe('desteklenmiyor');
    expect(canliTeshisi('kapali', taban).tip).toBe('izinKapali');
    expect(canliTeshisi('acik', { ...taban, izinVar: false }).tip).toBe('manifestIzniYok');
  });

  it('SAHA: şartlar tamam ama sistem öne çıkarmadı → Samsung yönlendirmesi', () => {
    const t = canliTeshisi('acik', { ...taban, sonGosterim: gosterim });
    expect(t.tip).toBe('ureticiEngeli');
    expect(t.samsungIpucu).toBe(true);
    expect(t.metin).toContain('Now Bar');
    const pixel = canliTeshisi('acik', { ...taban, samsung: false, sonGosterim: gosterim });
    expect(pixel.samsungIpucu).toBe(false);
    expect(pixel.metin).not.toContain('Now Bar');
  });

  it('görünen sayacın CANLI bayrağı son kayıttan önce gelir', () => {
    const t = canliTeshisi('acik', {
      ...taban,
      sonGosterim: gosterim,
      aktifBildirimler: [{ id: gosterim.id, oneCikarildi: true }],
    });
    expect(t.tip).toBe('oneCikti');
  });

  it('şart eksik / MIN kanal / hata ayrı söylenir', () => {
    expect(canliTeshisi('acik', { ...taban, sonGosterim: { ...gosterim, oneCikarilabilir: false } }).tip).toBe('sartEksik');
    expect(canliTeshisi('acik', { ...taban, sonGosterim: { ...gosterim, kanalOnemi: 1 } }).tip).toBe('sartEksik');
    expect(canliTeshisi('acik', { ...taban, sonGosterim: { ...gosterim, hata: 'SecurityException' } }).tip).toBe('hata');
  });

  it('plan boş / henüz gösterilmedi / ölçülemedi', () => {
    expect(canliTeshisi('acik', { ...taban, planOlaySayisi: 0 }).tip).toBe('planBos');
    expect(canliTeshisi('acik', taban).tip).toBe('henuzGosterilmedi');
    expect(
      canliTeshisi('acik', { ...taban, sonGosterim: { ...gosterim, oneCikarildi: null } }).tip
    ).toBe('olculemedi');
  });

  it('metinler kibar "siz" dilinde, "sen" yok', () => {
    const tipler = [
      canliTeshisi('kapali', taban),
      canliTeshisi('acik', { ...taban, sonGosterim: gosterim }),
      canliTeshisi('acik', { ...taban, planOlaySayisi: 0 }),
    ];
    for (const t of tipler) expect(t.metin).not.toMatch(/\b(sen|senin)\b/i);
  });
});

describe('canliTaniSatirlari', () => {
  it('Samsung sürümü ve ölçüm satırları yazılır', () => {
    const s = canliTaniSatirlari('acik', { ...taban, sonGosterim: gosterim }).join('\n');
    expect(s).toContain('Samsung One UI 8.0');
    expect(s).toContain('sistem öne çıkardı: hayır');
    expect(s).toContain('Şartlar uygun: evet');
  });
  it('tanı yoksa iki satır', () => {
    expect(canliTaniSatirlari('desteklenmiyor', null)).toHaveLength(2);
  });
});
