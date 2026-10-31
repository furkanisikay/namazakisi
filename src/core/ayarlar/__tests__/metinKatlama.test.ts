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
    const latinDisi = ['نَمَاز', 'नमाज़ का समय', 'নামাজ', 'தொழுகை', 'നമസ്കാരം', 'ละหมาด', '기도 시간', '礼拜时间', 'Намаз'];
    for (const s of latinDisi) expect(aramaIcinKatla(s)).toBe(s);
  });
});
