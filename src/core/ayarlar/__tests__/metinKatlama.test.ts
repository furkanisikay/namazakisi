import { aramaIcinKatla } from '../metinKatlama';

describe('aramaIcinKatla', () => {
  it("'İstanbul', 'istanbul' ve 'ISTANBUL' aynı sonucu verir", () => {
    const beklenen = aramaIcinKatla('İstanbul');
    expect(aramaIcinKatla('istanbul')).toBe(beklenen);
    expect(aramaIcinKatla('ISTANBUL')).toBe(beklenen);
  });

  it("'Muhafız' ve aksansız 'muhafiz' aynı sonucu verir", () => {
    expect(aramaIcinKatla('Muhafız')).toBe(aramaIcinKatla('muhafiz'));
  });

  // NÖBETÇİ: toLowerCase()'e dönülürse 'İ'.toLowerCase() === 'i̇' (U+0307
  // birleşen nokta ekler) → bu test kırılır.
  it('çıktı U+0307 birleşen nokta İÇERMEZ', () => {
    const sonuc = aramaIcinKatla('İstanbul Şişli Öğle Çağrı Üsküdar Ğğ Işık');
    expect(sonuc).not.toContain('̇');
  });

  it('Türkçeye özgü her harf beklenen köke katlanır', () => {
    expect(aramaIcinKatla('İIıi')).toBe('iiii');
    expect(aramaIcinKatla('ŞşSs')).toBe('ssss');
    expect(aramaIcinKatla('ĞğGg')).toBe('gggg');
    expect(aramaIcinKatla('ÜüUu')).toBe('uuuu');
    expect(aramaIcinKatla('ÖöOo')).toBe('oooo');
    expect(aramaIcinKatla('ÇçCc')).toBe('cccc');
  });

  it('ASCII büyük harfleri küçültür, aksansız kalanı korur', () => {
    expect(aramaIcinKatla('Namaz Vakti ABCXYZ')).toBe('namaz vakti abcxyz');
  });

  it('boş dize → boş dize', () => {
    expect(aramaIcinKatla('')).toBe('');
  });

  it('sayı ve noktalama olduğu gibi kalır', () => {
    expect(aramaIcinKatla('Vakit: 12345!')).toBe('vakit: 12345!');
  });
});
