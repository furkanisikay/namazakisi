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

  // NÖBETÇİ: Vietnamca kullanıcı çoğu zaman aksansız yazar ("chuong" → "Chuông").
  it('Vietnamca ses işaretleri ve đ katlanır (NFC ve NFD girdi)', () => {
    expect(aramaIcinKatla('Chuông')).toBe('chuong');
    expect(aramaIcinKatla('Đổi giờ')).toBe('doi gio');
    expect(aramaIcinKatla('Tiếng Việt')).toBe('tieng viet');
    expect(aramaIcinKatla('Ưu tiên nhắc nhở')).toBe('uu tien nhac nho');
    expect(aramaIcinKatla('ẤẦẨẪẬ ơƠ ưƯ')).toBe('aaaaa oo uu');
    expect(aramaIcinKatla('Chuông'.normalize('NFD'))).toBe('chuong');
    expect(aramaIcinKatla('Thông báo').includes(aramaIcinKatla('thong bao'))).toBe(true);
  });

  // NÖBETÇİ: meal eski ZWJ'li chillu, arayüz atomik chillu yazar; ikisi aynı aranmalı.
  it('Malayalamca eski chillu atomik chillu ile, ZWJ/ZWNJ yok sayılarak eşleşir', () => {
    expect(aramaIcinKatla('ഖുര്‍ആന്‍')).toBe(aramaIcinKatla('ഖുർആൻ'));
    expect(aramaIcinKatla('ഖിബ്‌ല')).toBe(aramaIcinKatla('ഖിബ്ല'));
  });

  it('tipografik kesme işaretleri düz kesme işaretiyle eşleşir', () => {
    expect(aramaIcinKatla('‘Asr')).toBe("'asr");
    expect(aramaIcinKatla('Qur’an')).toBe("qur'an");
    expect(aramaIcinKatla('ʼya')).toBe("'ya");
  });

  it('Türkçe katlama değişmez; Latin dışı yazıların işaretlerine dokunulmaz', () => {
    expect(aramaIcinKatla('İstanbul')).toBe('istanbul');
    expect(aramaIcinKatla('İ'.normalize('NFD'))).toBe('i');
    const latinDisi = ['نَمَاز', 'नमाज़ का समय', 'নামাজ', 'தொழுகை', 'നമസ്കാരം', 'ละหมาด', '기도 시간', '礼拜时间', 'намаз'];
    for (const s of latinDisi) expect(aramaIcinKatla(s)).toBe(s);
  });

  // NÖBETÇİ: Kiril ve Yunan aramada büyük/küçük harf duyarsız (toLowerCase YASAK, sabit eşleme).
  it('Kiril büyük harfler küçüğüne katlanır (Rusça, Ukraynaca, Sırpça, Kazakça)', () => {
    expect(aramaIcinKatla('Намаз')).toBe(aramaIcinKatla('намаз'));
    expect(aramaIcinKatla('МОЛИТВА')).toBe('молитва');
    expect(aramaIcinKatla('ЄҐЇІ')).toBe(aramaIcinKatla('єґїі'));
    expect(aramaIcinKatla('ЂЈЉЊЋЏ')).toBe('ђјљњћџ');
    expect(aramaIcinKatla('ҚҢҮҰӘӨҺ')).toBe('қңүұәөһ');
  });

  it('dalga 11: Tatarca, Bulgarca, Makedonca Kiril ve Lehçe ł büyük/küçük harf duyarsız', () => {
    // Tatarca ә ө ү җ ң һ (U+0460–04FF bloğu: çift kod noktası büyük).
    expect(aramaIcinKatla('ӘӨҮҖҢҺ')).toBe('әөүҗңһ');
    expect(aramaIcinKatla('НАМАЗ ВАКЫТЛАРЫ')).toBe(aramaIcinKatla('намаз вакытлары'));
    // Makedonca ѓ ќ ѕ: Ѓ/Ќ NFD'de Г/К + U+0301 → aksansız tabana iner (iki yazım da aynı katlanır).
    expect(aramaIcinKatla('ЃЌЅ')).toBe(aramaIcinKatla('ѓќѕ'));
    expect(aramaIcinKatla('ЏЉЊЈ')).toBe('џљњј');
    expect(aramaIcinKatla('ЩЪЬЮЯ')).toBe('щъьюя');
    // Lehçe: ą ć ę ń ó ś ź ż NFD ile, ł/Ł ayrışmaz → sabit eşleme.
    expect(aramaIcinKatla('ŁĄCZE ŚWIĘTO')).toBe(aramaIcinKatla('łącze święto'));
    expect(aramaIcinKatla('Ł')).toBe('l');
  });

  it('Yunan büyük harf, tonos ve son harf sigması katlanır', () => {
    expect(aramaIcinKatla('ΠΡΟΣΕΥΧΗ')).toBe(aramaIcinKatla('προσευχή'));
    expect(aramaIcinKatla('Ρυθμίσεις')).toBe('ρυθμισεισ');
    expect(aramaIcinKatla('ρυθμισεις')).toBe(aramaIcinKatla('Ρυθμίσεις'));
    expect(aramaIcinKatla('Ά')).toBe('α');
  });

  it('Rumence virgüllü ve sedilli ş ţ aynı aranır', () => {
    expect(aramaIcinKatla('Rugăciune ș ț')).toBe(aramaIcinKatla('rugaciune ş ţ'));
  });
});
