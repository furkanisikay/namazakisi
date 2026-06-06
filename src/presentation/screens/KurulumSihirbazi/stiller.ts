import { StyleSheet, Dimensions } from 'react-native';
const { width: EKRAN_GENISLIGI } = Dimensions.get('window');

export const styles = StyleSheet.create({
  tamEkran: { flex: 1, backgroundColor: '#fff' },

  // ── Gradient ekranlar ──
  gradientKapsayici: { flex: 1, justifyContent: 'space-between' },
  gradientButonAlani: { paddingHorizontal: 24, paddingBottom: 52, alignItems: 'center', gap: 16 },

  // ── Hoşgeldiniz ──
  hosgeldinizIcerik: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  halka1: {
    position: 'absolute', top: '18%', alignSelf: 'center',
    width: 176, height: 176, borderRadius: 88,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)',
  },
  halka2: {
    position: 'absolute', top: '13%', alignSelf: 'center',
    width: 240, height: 240, borderRadius: 120,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  moskeIkon: { marginBottom: 28, opacity: 0.95 },
  hosgeldinizBaslik: {
    fontSize: 36, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 10, letterSpacing: -0.5,
  },
  hosgeldinizAltBaslik: {
    fontSize: 17, color: 'rgba(255,255,255,0.82)',
    textAlign: 'center', marginBottom: 16, fontWeight: '500',
  },
  hosgeldinizAciklama: {
    fontSize: 14.5, color: 'rgba(255,255,255,0.65)',
    textAlign: 'center', lineHeight: 22,
  },

  // ── Üst bar ──
  ustBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 6,
  },
  geriButon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // ── İlerleme noktaları ──
  noktaKapsayici: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  nokta: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#e5e7eb' },
  noktaAktif: { width: 20, backgroundColor: '#3b82f6' },
  noktaTamamlandi: { backgroundColor: '#10b981' },

  // ── İçerik ──
  icerikAlani: { flex: 1, paddingHorizontal: 24 },
  scrollAdim: { flex: 1 },
  scrollIcerik: { paddingTop: 4, paddingBottom: 20, alignItems: 'center' },
  merkezliIcerik: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },

  // ── Buton alanı ──
  butonAlani: {
    paddingHorizontal: 24, paddingBottom: 44, gap: 8, alignItems: 'center',
  },
  buton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 14, gap: 9, width: '100%',
  },
  butonBirincil: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  butonYesil: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  butonMetin: { color: '#fff', fontSize: 16, fontWeight: '700' },
  atlaButon: { paddingVertical: 8 },
  atlaButonMetin: { color: '#9ca3af', fontSize: 14, fontWeight: '500' },

  // ── Ortak adım ──
  buyukIkonCember: {
    width: 92, height: 92, borderRadius: 46,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  adimBaslik: {
    fontSize: 25, fontWeight: '800', color: '#111',
    textAlign: 'center', marginBottom: 8, letterSpacing: -0.3,
  },
  adimAltBaslik: {
    fontSize: 14.5, color: '#6b7280', textAlign: 'center',
    lineHeight: 22, marginBottom: 20, paddingHorizontal: 4,
  },

  // ── InfoKutu ──
  infoKutu: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#f9fafb', borderRadius: 12,
    padding: 14, gap: 12, marginBottom: 10, width: '100%',
  },
  infoIkon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  infoMetin: { flex: 1 },
  infoBaslik: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 3 },
  infoAciklama: { fontSize: 13, color: '#6b7280', lineHeight: 19 },

  // ── Gizlilik banner ──
  gizlilikBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#f0fdf4', borderRadius: 10, borderWidth: 1,
    borderColor: '#bbf7d0', padding: 12, marginTop: 6, width: '100%',
  },
  gizlilikBannerMetin: { flex: 1, fontSize: 12.5, color: '#374151', lineHeight: 18 },

  // ── Bilgi kutusu (inline, mavi) ──
  bilgiKutu: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#eff6ff', borderRadius: 10, borderWidth: 1,
    borderColor: '#bfdbfe', padding: 12, marginBottom: 10, width: '100%',
  },
  bilgiKutuMetin: { flex: 1, fontSize: 12.5, color: '#1e40af', lineHeight: 18 },

  // ── Tema adımı ──
  onizlemeKart: {
    width: '100%', borderRadius: 14, borderWidth: 1.5,
    overflow: 'hidden', marginBottom: 20,
  },
  onizlemeBaslik: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  onizlemeBaslikMetin: { color: '#fff', fontWeight: '700', fontSize: 14 },
  onizlemeIcerik: { padding: 12, gap: 8 },
  onizlemeVakitSatir: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingLeft: 10, borderLeftWidth: 3, paddingVertical: 6,
  },
  onizlemeVakitAdi: { fontWeight: '700', fontSize: 14 },
  onizlemeVakitAdiPasif: { fontWeight: '600', fontSize: 14, color: '#9ca3af' },
  onizlemeVakitSaat: { flex: 1, fontSize: 13, color: '#6b7280' },
  onizlemeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  onizlemeBadgeMetin: { fontSize: 11, fontWeight: '700' },
  bolumBaslik: {
    fontSize: 14, fontWeight: '700', color: '#374151',
    alignSelf: 'flex-start', marginBottom: 10,
  },
  paletIzgara: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center', marginBottom: 20, width: '100%',
  },
  paletKart: {
    width: (EKRAN_GENISLIGI - 48 - 30) / 3,
    alignItems: 'center', backgroundColor: '#f9fafb',
    borderRadius: 12, padding: 10, borderWidth: 2, borderColor: 'transparent', position: 'relative',
  },
  paletRenk: { width: '100%', height: 26, borderRadius: 7, marginBottom: 4 },
  paletVurgu: { width: '55%', height: 7, borderRadius: 4, marginBottom: 6 },
  paletAdi: { fontSize: 11.5, color: '#374151', fontWeight: '600' },
  paletSecimIsaret: {
    position: 'absolute', top: -6, right: -6,
    width: 19, height: 19, borderRadius: 9.5,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
  modSecici: {
    flexDirection: 'row', backgroundColor: '#f3f4f6',
    borderRadius: 12, padding: 3, gap: 2, width: '100%', marginBottom: 8,
  },
  modButon: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 5,
  },
  modButonMetin: { fontSize: 12.5, fontWeight: '600', color: '#6b7280' },
  modAciklama: { fontSize: 12, color: '#9ca3af', alignSelf: 'flex-start', lineHeight: 18 },

  // ── Vakit bildirimleri ──
  ozet: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f0fdf4', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14, width: '100%',
  },
  ozetMetin: { fontSize: 13, color: '#374151', fontWeight: '600' },
  bildirimListe: { width: '100%', gap: 8, marginBottom: 14 },
  bildirimSatir: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9fafb', padding: 13, borderRadius: 12, gap: 12,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  vakitIkon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  vakitMetin: { flex: 1 },
  vakitAdi: { fontSize: 14.5, fontWeight: '700', color: '#111', marginBottom: 2 },
  vakitAciklama: { fontSize: 12, color: '#9ca3af' },

  // ── Konum ──
  seciliIlBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eef2ff', borderRadius: 8, padding: 10,
    marginBottom: 10, width: '100%',
  },
  seciliIlMetin: { fontSize: 13.5, fontWeight: '700', color: '#4338ca' },
  ilListesi: { flex: 1, width: '100%' },
  ilSatir: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  ilSatirSecili: { backgroundColor: '#eef2ff' },
  ilAdi: { flex: 1, fontSize: 14.5, color: '#374151', fontWeight: '500' },
  ilAdiSecili: { color: '#4338ca', fontWeight: '700' },

  // ── Muhafız tanıtım ──
  muhafizAnimKart: {
    width: '100%', backgroundColor: '#f9fafb', borderRadius: 16,
    padding: 16, marginBottom: 14,
  },
  muhafizAnimBaslik: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  muhafizAnimBaslikMetin: { fontSize: 13, fontWeight: '700', color: '#374151' },
  muhafizSeviyeCizgi: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  muhafizSeviyeNokta: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  muhafizNokta: { width: 14, height: 14, borderRadius: 7 },
  muhafizCizgi: { flex: 1, height: 3, marginHorizontal: 2 },
  muhafizAktifKart: {
    borderWidth: 1.5, borderRadius: 12, padding: 14, alignItems: 'center',
  },
  muhafizYogunlukBar: {
    flexDirection: 'row', gap: 4, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, marginBottom: 8,
  },
  muhafizSaatMetin: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  muhafizSeviyeBaslik: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 4 },
  muhafizSeviyeAciklama: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 18 },
  muhafizToggle: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    backgroundColor: '#f9fafb', padding: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb', marginTop: 4,
  },
  muhafizToggleAktif: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  muhafizToggleSol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  muhafizToggleBaslik: { fontSize: 15, fontWeight: '700', color: '#111' },
  muhafizToggleAlt: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  // ── Muhafız yoğunluk ──
  yogunlukListe: { width: '100%', gap: 10 },
  yogunlukKart: {
    backgroundColor: '#f9fafb', borderRadius: 14, overflow: 'hidden',
    borderWidth: 2, borderColor: 'transparent',
  },
  yogunlukKartUst: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  yogunlukIkon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  yogunlukBaslikAlani: { flex: 1 },
  yogunlukBaslikSatir: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  yogunlukAdi: { fontSize: 15.5, fontWeight: '800', color: '#111' },
  yogunlukEtiket: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  yogunlukEtiketMetin: { fontSize: 11, fontWeight: '700' },
  yogunlukDetay: { fontSize: 12.5, color: '#6b7280', lineHeight: 17 },
  secimDairesi: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  yogunlukDetayAlti: {
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    paddingHorizontal: 14, paddingVertical: 10, gap: 6,
  },
  yogunlukSatir: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  yogunlukSatirMetin: { fontSize: 12, color: '#6b7280' },

  // ── Özel gün ──
  nasilKullanilirKart: {
    width: '100%', backgroundColor: '#f9fafb', borderRadius: 14, padding: 16, marginTop: 4,
  },
  nasilKullanilirBaslik: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12 },
  adimAdimSatir: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  adimNumara: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center',
  },
  adimNumaraMetin: { fontSize: 12, fontWeight: '800', color: '#fff' },
  adimAdimMetin: { flex: 1, fontSize: 13.5, color: '#374151', lineHeight: 20 },
});
