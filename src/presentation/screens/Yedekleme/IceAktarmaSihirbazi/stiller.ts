/**
 * İçe Aktarma Sihirbazı stilleri.
 *
 * Görsel dil Kurulum Sihirbazı (KurulumSihirbazi/stiller.ts) ile birebir: ilerleme
 * noktaları, büyük ikon kutusu, başlık (25px/800), alt başlık (gri), InfoKutu, tam
 * genişlik CTA. Renkler statik değildir; tema-bağımlı renkler bileşende `useRenkler`
 * ile inline geçilir (Kurulum Sihirbazı'ndaki gibi temel iskelet StyleSheet'te,
 * renk vurgusu inline).
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  tamEkran: { flex: 1 },

  // ── Üst bar ──
  ustBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 6,
  },
  geriButon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // ── İlerleme noktaları ──
  noktaKapsayici: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  nokta: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#e5e7eb' },
  noktaAktif: { width: 20 },
  noktaTamamlandi: { backgroundColor: '#10b981' },

  // ── İçerik ──
  icerikAlani: { flex: 1, paddingHorizontal: 24 },
  scrollAdim: { flex: 1 },
  scrollIcerik: { paddingTop: 4, paddingBottom: 20, alignItems: 'center' },
  merkezliIcerik: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },

  // ── Buton alanı ──
  butonAlani: { paddingHorizontal: 24, paddingBottom: 44, gap: 8, alignItems: 'center' },
  buton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 14, gap: 9, width: '100%',
  },
  butonGolge: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  butonMetin: { color: '#fff', fontSize: 16, fontWeight: '700' },
  butonIkincil: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, gap: 8, width: '100%', borderWidth: 1.5,
  },
  butonIkincilMetin: { fontSize: 15, fontWeight: '700' },
  atlaButon: { paddingVertical: 8 },
  atlaButonMetin: { color: '#9ca3af', fontSize: 14, fontWeight: '500' },

  // ── Ortak adım ──
  buyukIkonCember: {
    width: 92, height: 92, borderRadius: 46,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  adimBaslik: {
    fontSize: 25, fontWeight: '800',
    textAlign: 'center', marginBottom: 8, letterSpacing: -0.3,
  },
  adimAltBaslik: {
    fontSize: 14.5, textAlign: 'center',
    lineHeight: 22, marginBottom: 20, paddingHorizontal: 4,
  },

  // ── InfoKutu ──
  infoKutu: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 12, padding: 14, gap: 12, marginBottom: 10, width: '100%',
  },
  infoIkon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  infoMetin: { flex: 1 },
  infoBaslik: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  infoAciklama: { fontSize: 13, lineHeight: 19 },

  // ── Metrik kartları (özet) ──
  metrikSatir: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 14 },
  metrikKart: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1,
  },
  metrikIkon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  metrikSayi: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  metrikEtiket: { fontSize: 11.5, fontWeight: '600', textAlign: 'center', marginTop: 2 },

  // ── Bilgi satırı (yedek içeriği) ──
  bilgiSatirKart: {
    width: '100%', borderRadius: 12, padding: 14, marginBottom: 18, gap: 10,
    borderWidth: 1,
  },
  bilgiSatir: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  bilgiSatirMetin: { fontSize: 13, flex: 1 },

  // ── Bölüm başlığı ──
  bolumBaslik: {
    fontSize: 14, fontWeight: '700',
    alignSelf: 'flex-start', marginBottom: 10,
  },

  // ── Strateji kartları ──
  stratejiListe: { width: '100%', gap: 10, marginBottom: 4 },
  stratejiKart: {
    borderRadius: 14, padding: 14, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  stratejiIkon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  stratejiMetin: { flex: 1 },
  stratejiBaslikSatir: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' },
  stratejiAdi: { fontSize: 15.5, fontWeight: '800' },
  stratejiRozet: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  stratejiRozetMetin: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.2 },
  stratejiAciklama: { fontSize: 12.5, lineHeight: 17 },
  stratejiSagIkon: { width: 22, alignItems: 'center', justifyContent: 'center' },
  secimDairesi: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },

  // ── Gelişmiş kategori seçimi ──
  kategoriKart: {
    width: '100%', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1,
  },
  kategoriUst: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  kategoriIkon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  kategoriBaslik: { fontSize: 14.5, fontWeight: '700' },
  kategoriAciklama: { fontSize: 12, marginTop: 1 },
  segmentSatir: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 2 },
  segmentButon: {
    flex: 1, paddingVertical: 9, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  segmentMetin: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  // ── İlerleme / yükleme ekranı ──
  yukleniyorMetin: { fontSize: 14.5, textAlign: 'center', lineHeight: 22, marginTop: 18 },

  // ── Başarı / hata büyük ikon ──
  basariIkonAlani: { marginBottom: 28 },

  // ── Hata kutusu ──
  hataKutu: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 9,
    borderRadius: 12, padding: 14, marginTop: 16, width: '100%', borderWidth: 1,
  },
  hataKutuMetin: { flex: 1, fontSize: 13, lineHeight: 19 },

  // ── Özet alt bilgi (başarı) ──
  ozetKutu: {
    width: '100%', borderRadius: 14, padding: 16, marginTop: 18, gap: 10, borderWidth: 1,
  },
  ozetSatir: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ozetSatirMetin: { fontSize: 13.5, flex: 1 },
});
