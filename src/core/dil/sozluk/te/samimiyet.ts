import type { Sozluk } from '../tr';

/**
 * Telugu Müslümanlarının dua kalıpları (çeviri değil). Kabul duası kökü "స్వీకరించు" (meal 2:127
 * "ఓ మా ప్రభూ! మా ఈ సేవను స్వీకరించు") ve "అంగీకరించు" (meal 1:7 dipnotu "మా దు'ఆ …
 * అంగీకరించు") + Telugu dilek eki ‑గాక (HadeethEnc te "కురియుగాక", "ఉండుగాక"); "అల్లాహ్
 * స్వీకరించుగాక" kalıbı türetildi, DOĞRULANMADI. Bayram "ఈద్ ముబారక్", cuma "జుమా ముబారక్".
 * Kandil ve hicrî yılbaşı selamı yalnız Türkiye geleneğinde söylenir; buradakiler tip
 * bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'శుభం కలుగుగాక.',
  kabulDualari: ['అల్లాహ్ స్వీకరించుగాక', 'అల్లాహ్ అంగీకరించుగాక', 'అల్లాహ్ స్వీకరించుగాక', 'మా ప్రభువు స్వీకరించుగాక'],
  kabulDuasi: 'అల్లాహ్ స్వీకరించుగాక',
  ekSabah: 'శుభోదయం',
  ekYatsi: 'శుభరాత్రి',
  tamGunAna: 'అల్లాహ్ స్వీకరించుగాక',
  tamGunAlt: 'ఈ రోజు ఐదు నమాజ్‌లనూ పూర్తి చేశారు.',
  kazaKabul: 'మీ ఖజా పుస్తకం నుండి ఒక {vakit} ఖజా తీసివేయబడింది. {dua}.',
  kandilGeceleri: {
    regaib: 'శుభప్రదమైన రగాయిబ్ రాత్రి',
    mirac: 'శుభప్రదమైన మేరాజ్ రాత్రి',
    berat: 'శుభప్రదమైన బరాత్ రాత్రి',
    mevlid: 'శుభప్రదమైన మౌలిద్',
  },
  selamlar: {
    sahur: 'శుభప్రదమైన సహరీ',
    bayram: 'ఈద్ ముబారక్',
    iftar: 'శుభప్రదమైన ఇఫ్తార్',
    kadir: 'శుభప్రదమైన లైలతుల్ ఖద్ర్',
    arefe: 'శుభప్రదమైన ఈద్ ముందు రోజు',
    hicriYilbasi: 'శుభప్రదమైన హిజ్రీ నూతన సంవత్సరం',
    cuma: 'జుమా ముబారక్',
    ramazan: 'రమదాన్ ముబారక్',
    sabah: 'శుభోదయం',
  },
};
