/**
 * "Neler Yeni" çok dil: Türkçe katalog birebir; İngilizcede yalnız çevirisi olan öğe, metni
 * Türkçe harf taşımaz ve duyuru kurallarına uyar (sürüm/izin şartı yok, teknik terim yok).
 */
import { YENI_OZELLIKLER } from '../YeniOzellikler';
import { yeniOzelliklerDilde } from '../yeniOzellikDili';

it('Türkçe katalog değişmeden döner', () => {
  expect(yeniOzelliklerDilde('tr')).toEqual(YENI_OZELLIKLER);
});

it('İngilizcede yalnız çevirisi olan öğeler, sıra ve kimlik korunur', () => {
  const en = yeniOzelliklerDilde('en');
  expect(en.length).toBeGreaterThanOrEqual(8);
  expect(en.map((o) => o.id)).toEqual(YENI_OZELLIKLER.filter((o) => o.ceviri?.en).map((o) => o.id));
  for (const o of en) {
    const metinler = [o.baslik, o.aciklama, o.detayAciklama ?? '', o.ctaEtiketi ?? '', ...(o.detaylar ?? [])];
    for (const m of metinler) {
      expect(m).not.toMatch(/[çğıöşüÇĞİÖŞÜ]/);
      expect(m).not.toMatch(/\b(TTS|channel|API|Android \d|iOS \d|permission)\b/i);
    }
    // CTA varsa hedef sayfa da olmalı (Türkçe öğeyle aynı kural).
    if (o.ctaEtiketi) expect(o.hedefSayfa).toBeTruthy();
  }
});

it('Türkiye\'ye özgü yol (7 haneli TV kodu) çeviride anlatılmaz', () => {
  const tv = YENI_OZELLIKLER.find((o) => o.id === 'televizyona-konum-aktarma');
  expect(tv?.ceviri?.en).toBeUndefined();
});
