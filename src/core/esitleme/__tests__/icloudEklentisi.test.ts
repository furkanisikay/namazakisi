/**
 * iCloud eşitleme config plugin'i (issue #288): bayrak KAPALIYKEN hiçbir şey eklemez
 * (iOS yayın hattı entitlement'sız kalsın), açıkken extra bayrağını yazar.
 */
const eklenti = require('../../../../plugins/withIcloudEsitleme');

describe('withIcloudEsitleme', () => {
  it('varsayılan / kapalı: yapılandırma AYNEN döner (entitlement ve bayrak yok)', () => {
    const yapi = { name: 'x', slug: 'x', extra: { a: 1 } };
    expect(eklenti(yapi)).toBe(yapi);
    expect(eklenti(yapi, { etkin: false })).toBe(yapi);
    expect(yapi.extra).toEqual({ a: 1 });
  });

  it('etkin: extra.icloudEsitlemeEtkin yazılır, mevcut extra korunur', () => {
    const sonuc = eklenti({ name: 'x', slug: 'x', extra: { a: 1 } }, { etkin: true });
    expect(sonuc.extra).toMatchObject({ a: 1, icloudEsitlemeEtkin: true });
  });
});
