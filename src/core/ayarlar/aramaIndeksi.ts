/**
 * Ayarlar aramasının tarayacağı sabit indeks.
 *
 * BİLİNÇLİ OLARAK SINIRLIDIR: her ayar burada YOKTUR, yalnız kullanıcının
 * en çok arayacağı satırlar — (a) görev bazlı sayfalar (çapasız, yalnız ilgili
 * sayfaya götürür) ve (b) alt-ayar çapaları (`capalar.ts`, `CapaId`). Sade tasarım
 * (Dalga 3): çapalar taşınan ayarın YENİ evini gösterir (ör. özel gün →
 * Hatırlatmalar, vakit sayacı → Saat ve widget). Bu listeyi "kapsamlı" sanıp genişletmeden önce
 * task-3-brief.md'yi oku. Titreşim ve Ses efektleri toggle'ları KASITLI
 * OLARAK indekslenmez — ikisi de `AyarlarAna`'da yaşar ve "dokununca nereye
 * gider?" sorusunun arama sonucu olarak anlamlı bir cevabı yok.
 *
 * Görünen metinler (başlık, grup, anahtar kelimeler) sözlükte (`ayarlar.arama`,
 * `ayarlar.aramaGruplari`); kayıtlar onları GETTER ile etkin dilden okur. Türkçe dışı
 * dilde Türkçe başlık ve anahtar kelimeler de aranır (yurt dışındaki Türkçe konuşan,
 * İngilizce arayüzde "ezan" yazabilsin). `id`, `sayfa`, `capa` kimliktir.
 *
 * `sayfa` alanı yalnız TİP olarak `AyarlarEkranAdi`'a bağlıdır (`import
 * type` — runtime bağ kurmaz); `src/core/` saf kalır (AGENTS.md).
 */
import type { AyarlarEkranAdi } from '../../navigation/ayarlarEkranlari';
import type { CapaId } from './capalar';
import { aktifDil, metin, sozluk } from '../dil/aktifDil';
import type { Sozluk } from '../dil/sozluk/tr';
import { dilSeciciGorunur } from '../dil/diller';

export interface AyarIndeksKaydi {
  id: string;
  baslik: string;
  anahtarKelimeler: readonly string[];
  sayfa: AyarlarEkranAdi;
  /** Sonuçta bağlam olarak gösterilir (ör. "Bildirimler" grubu/sayfası). */
  grup: string;
  capa?: CapaId;
}

type AramaId = keyof Sozluk['ayarlar']['arama'];
type GrupId = keyof Sozluk['ayarlar']['aramaGruplari'];

interface KayitTanimi {
  id: AramaId;
  sayfa: AyarlarEkranAdi;
  grup: GrupId;
  capa?: CapaId;
}

/** Sözlükte anahtar kelimeler virgülle ayrılmış tek dizedir. */
const bol = (dize: string): string[] => dize.split(',').map((k) => k.trim()).filter(Boolean);

/** Etkin dilin anahtar kelimeleri; Türkçe dışında Türkçe başlık + kelimeler de eklenir. */
function anahtarKelimeler(id: AramaId): readonly string[] {
  const etkin = bol(metin().ayarlar.arama[id].kelimeler);
  if (aktifDil() === 'tr') return etkin;
  const tr = sozluk('tr').ayarlar.arama[id];
  return [...etkin, tr.baslik, ...bol(tr.kelimeler)];
}

function kayit(t: KayitTanimi): AyarIndeksKaydi {
  const sabit = t.capa ? { id: t.id, sayfa: t.sayfa, capa: t.capa } : { id: t.id, sayfa: t.sayfa };
  return Object.defineProperties(sabit, {
    baslik: { get: () => metin().ayarlar.arama[t.id].baslik, enumerable: true },
    grup: { get: () => metin().ayarlar.aramaGruplari[t.grup], enumerable: true },
    anahtarKelimeler: { get: () => anahtarKelimeler(t.id), enumerable: true },
  }) as AyarIndeksKaydi;
}

const TANIMLAR: KayitTanimi[] = [
  // ── Sayfalar (çapasız) — sade tasarım (Dalga 3) görev bazlı düzen ──────────
  { id: 'sayfa-hatirlatmalar', sayfa: 'Hatirlatmalar', grup: 'namaz' },
  { id: 'sayfa-muhafiz', sayfa: 'MuhafizAyarlari', grup: 'hatirlatmalar' },
  { id: 'sayfa-namazda-sessiz', sayfa: 'CamideyimAyarlari', grup: 'namaz' },
  { id: 'sayfa-namaz-vakitleri', sayfa: 'NamazVakitleriAyarlari', grup: 'namaz' },
  { id: 'sayfa-konum', sayfa: 'KonumAyarlari', grup: 'namazVakitleri' },
  { id: 'sayfa-takvim', sayfa: 'TakvimAyarlari', grup: 'namazVakitleri' },
  { id: 'sayfa-hesap-yontemi', sayfa: 'HesapYontemiAyarlari', grup: 'namazVakitleri' },
  { id: 'sayfa-seferilik', sayfa: 'SeferilikAyarlari', grup: 'namazVakitleri' },
  { id: 'sayfa-seri', sayfa: 'SeriHedefAyarlari', grup: 'namaz' },
  { id: 'sayfa-ramazan', sayfa: 'RamazanAyarlari', grup: 'hatirlatmalar' },
  { id: 'sayfa-nafile', sayfa: 'NafileAyarlari', grup: 'hatirlatmalar' },
  { id: 'sayfa-gorunum', sayfa: 'GorünumAyarlari', grup: 'ekranCihazlar' }, // dil-haric: kimlik (rota adı)
  // Dil sayfası yalnız seçicide birden çok dil varken (Ayarlar satırıyla aynı kapı).
  ...(dilSeciciGorunur() ? [{ id: 'sayfa-dil', sayfa: 'DilAyarlari', grup: 'ekranCihazlar' } as const] : []),
  { id: 'sayfa-saat-widget', sayfa: 'SaatVeWidgetAyarlari', grup: 'ekranCihazlar' },
  { id: 'sayfa-gunun-ayeti', sayfa: 'GununAyeti', grup: 'ekranCihazlar' },
  { id: 'sayfa-gunun-ayeti-ayar', sayfa: 'GununAyetiAyarlari', grup: 'ekranCihazlar' },
  { id: 'sayfa-cihazlarim', sayfa: 'Cihazlarim', grup: 'ekranCihazlar' },
  { id: 'sayfa-cihaz-ekle', sayfa: 'CihazEkle', grup: 'ekranCihazlar' },
  { id: 'sayfa-televizyon', sayfa: 'TelevizyonAyarlari', grup: 'ekranCihazlar' },
  { id: 'sayfa-yedekleme', sayfa: 'YedeklemeAktarim', grup: 'hesap' },
  { id: 'sayfa-yardim', sayfa: 'Yardim', grup: 'hesap' },
  { id: 'sayfa-tani', sayfa: 'TaniGeriBildirim', grup: 'yardim' },
  { id: 'sayfa-nelerYeni', sayfa: 'NelerYeni', grup: 'yardim' },
  { id: 'sayfa-hakkinda', sayfa: 'Hakkinda', grup: 'yardim' },

  // ── Alt-ayar çapaları — çapa→sayfa eşleşmesi kaynak koddan doğrulandı ──────
  { id: 'konumModu', sayfa: 'KonumAyarlari', grup: 'konum', capa: 'konumModu' },
  { id: 'akilliTakip', sayfa: 'KonumAyarlari', grup: 'konum', capa: 'akilliTakip' },
  { id: 'tema', sayfa: 'GorünumAyarlari', grup: 'gorunum', capa: 'tema' }, // dil-haric: kimlik (rota adı)
  { id: 'palet', sayfa: 'GorünumAyarlari', grup: 'gorunum', capa: 'palet' }, // dil-haric: kimlik (rota adı)
  { id: 'sadeGorunum', sayfa: 'GorünumAyarlari', grup: 'gorunum', capa: 'sadeGorunum' }, // dil-haric: kimlik (rota adı)
  { id: 'vakitBildirimleri', sayfa: 'VakitGirinceAyarlari', grup: 'hatirlatmalar', capa: 'vakitBildirimleri' },
  { id: 'cumaHatirlatmasi', sayfa: 'CumaHatirlatmaAyarlari', grup: 'hatirlatmalar', capa: 'cumaHatirlatmasi' },
  { id: 'yatisHatirlatmasi', sayfa: 'YatisHatirlatmaAyarlari', grup: 'hatirlatmalar', capa: 'yatisHatirlatmasi' },
  { id: 'camiyeGitHatirlatmasi', sayfa: 'CamiyeGitAyarlari', grup: 'hatirlatmalar', capa: 'camiyeGitHatirlatmasi' },
  { id: 'takvimCakismaUyarisi', sayfa: 'TakvimCakismaAyarlari', grup: 'hatirlatmalar', capa: 'takvimCakismaUyarisi' },
  { id: 'vakitSayaci', sayfa: 'SaatVeWidgetAyarlari', grup: 'saatWidget', capa: 'vakitSayaci' },
  // DİKKAT: ad "seri"yi çağrıştırır ama kontrol Hatırlatmalar'dadır (Dalga 3).
  { id: 'gunSonuBildirimi', sayfa: 'GunSonuAyarlari', grup: 'hatirlatmalar', capa: 'gunSonuBildirimi' },
  { id: 'tamGunEsigi', sayfa: 'SeriHedefAyarlari', grup: 'seriHedefi', capa: 'tamGunEsigi' },
  { id: 'ozelGunModu', sayfa: 'OzelGunAyarlari', grup: 'hatirlatmalar', capa: 'ozelGunModu' },
  { id: 'iftarSayaci', sayfa: 'RamazanAyarlari', grup: 'ramazan', capa: 'iftarSayaci' },
  { id: 'sahurSayaci', sayfa: 'RamazanAyarlari', grup: 'ramazan', capa: 'sahurSayaci' },
  { id: 'takvimSenkron', sayfa: 'TakvimAyarlari', grup: 'namazVakitleri', capa: 'takvimSenkron' },
  { id: 'muhafizAnaSwitch', sayfa: 'Hatirlatmalar', grup: 'hatirlatmalar', capa: 'muhafizAnaSwitch' },
  { id: 'muhafizYogunluk', sayfa: 'Hatirlatmalar', grup: 'hatirlatmalar', capa: 'muhafizYogunluk' },
  { id: 'disaAktar', sayfa: 'YedeklemeAktarim', grup: 'yedek', capa: 'disaAktar' },
  { id: 'iceAktar', sayfa: 'YedeklemeAktarim', grup: 'yedek', capa: 'iceAktar' },
];

export const AYAR_INDEKSI: AyarIndeksKaydi[] = TANIMLAR.map(kayit);
