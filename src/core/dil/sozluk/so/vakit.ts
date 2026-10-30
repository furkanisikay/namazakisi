import type { Sozluk } from '../tr';

/**
 * Soomaali: magacyada waqtiyada waa kuwa tarjumaadda QuranEnc `somali_yacob` (faallada 17:78,
 * 24:58) iyo so.wikipedia "Salaad": Subax · Qorrax soo bax · Duhur · Casar · Maghrib · Cishe.
 * `imsakVakti` = "Subax" (magaca fajarka, ma aha "Imsak"). Magacyada salaadda waa magac gaar ah:
 * jumlada dhexdeedana xaraf weyn ayay ku bilaabmaan (`kucuk` = isla magaca), marka laga reebo
 * "qorrax soo bax" oo ah weedh caadi ah. Qodobka qeexidda (-ka/-ta/-da) laguma lifaaqo `{vakit}`/`{ad}`:
 * qaababka waxaa loo dhisay si magaca qaawan uu si dabiici ah u fadhiyo ("Salaadda {vakit}",
 * "waqtiga {vakit}"). `buyuk` gacan ayaa lagu qoray. Ereyada: Waan tukaday (badhanka, sheegashada
 * qofka) / La tukaday (xaaladda), qadaa, salaad sunno (nafile), Qibla, Jimce, waqti makruuh,
 * habka xisaabinta, Ilaaliyaha Salaadda (Namaz Muhafızı), taxane (seri), soo kabasho (toparlanma),
 * safar / musaafir (seferîlik), Buugga qadaa, Dejinta (Ayarlar), ogeysiis, goob.
 * Codsiga cibaadada: "Oog salaadda" (QuranEnc 17:78, 11:114), "tuko" (falka tukasho, la soo saaray).
 * Taariikhda: '{gun} {ay} {yil}' (qoraalka wargeysyada Soomaaliyeed; CLDR "MMMM d, y" waa laga leexday).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subax', gunes: 'Qorrax soo bax', ogle: 'Duhur', ikindi: 'Casar', aksam: 'Maghrib', yatsi: 'Cishe' },
  buyuk: { imsak: 'SUBAX', gunes: 'QORRAX SOO BAX', ogle: 'DUHUR', ikindi: 'CASAR', aksam: 'MAGHRIB', yatsi: 'CISHE' },
  kucuk: { imsak: 'Subax', gunes: 'qorrax soo bax', ogle: 'Duhur', ikindi: 'Casar', aksam: 'Maghrib', yatsi: 'Cishe' },
  imsakVakti: 'Subax',
  cuma: 'Jimce',
  cumaKucuk: 'Jimce',
  gunesDogusu: 'Qorrax soo bax',
  gunesDogusuKucuk: 'qorrax soo bax',
  durum: { kilindi: 'La tukaday', vaktiGeldi: 'Waa waqtigii salaadda', girmedi: 'Waqtigu weli ma gelin', gecti: 'Lama tukan' },
  durumKucuk: { kilindi: 'la tukaday', vaktiGeldi: 'waa waqtigii salaadda', girmedi: 'waqtigu weli ma gelin', gecti: 'lama tukan' },
  /** "Waan tukaday" = sheegashada qofka (qofka 1aad); xaaladda "La tukaday". */
  eylem: { kildim: 'Waan tukaday', kilindi: 'La tukaday' },
  kerahatVakti: 'Waqti makruuh ah',
  isaretle: 'U calaamadee la tukaday',
  geriAlEtiketi: '{durum}, taabo si aad uga noqoto',
  geriAlindi: 'Calaamaddii waa la saaray',
};
