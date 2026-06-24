import reducer, { sorunBildirildi, taniModaliKapat } from '../taniSlice';

const ilk = reducer(undefined, { type: '@@INIT' });

describe('taniSlice', () => {
  test('başlangıç durumu', () => {
    expect(ilk).toEqual({ sorunAlgilandi: false, baglam: null, hatirlatmaAcik: true, oturumdaGosterildi: false });
  });

  test('sorunBildirildi → flag + bağlam set', () => {
    const s = reducer(ilk, sorunBildirildi('Kaza yüklenemedi'));
    expect(s.sorunAlgilandi).toBe(true);
    expect(s.baglam).toBe('Kaza yüklenemedi');
  });

  test('taniModaliKapat → oturumdaGosterildi=true, sorunAlgilandi=false', () => {
    const acik = reducer(ilk, sorunBildirildi('x'));
    const s = reducer(acik, taniModaliKapat());
    expect(s.sorunAlgilandi).toBe(false);
    expect(s.oturumdaGosterildi).toBe(true);
  });

  test('oturumda ikinci kez gösterilmez', () => {
    let s = reducer(ilk, sorunBildirildi('a'));
    s = reducer(s, taniModaliKapat());
    s = reducer(s, sorunBildirildi('b'));
    expect(s.oturumdaGosterildi).toBe(true);
  });
});
