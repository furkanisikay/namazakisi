import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı Yorubada tekil emir ("Kírun", 11:114; "dúró kírun" = namaza dur, 2:238),
 * iyelik "rẹ". Secde karşılığı YAZILMAZ. Başlıkta dakika "ìṣj": "Mọgrib · ìṣj 655" ilk 16
 * karaktere sığar.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · ìṣj {dk} kọjá · àkókò ìrun ti tó ⏰',
    giris2: '{ad} · ìṣj {dk} kọjá · má fi ìrun rẹ falẹ̀ ⚠️',
    giris3: '{ad} · ìṣj {dk} kọjá · ìrun rẹ ń dúró dè ọ́ 🔥',
    giris4: '{ad} · ìṣj {dk} kọjá · DÚRÓ KÍRUN 🚨',
    erken3: '{ad} · ìṣj {dk} ló kù · ìrun rẹ ń dúró dè ọ́ 🔥',
    erken4: '{ad} · ìṣj {dk} ló kù · DÚRÓ KÍRUN 🚨',
    cikis1: '{ad} · ìṣj {dk} ló kù ⏰',
    cikis2: '{ad} · ìṣj {dk} · àkókò ń kúrú ⚠️',
    cikis3: '{ad} · ìṣj {dk} · àkókò ń yọ̀ lọ 🔥',
    cikis4: '{ad} · ìṣj {dk} · ÀKÓKÒ Ń PARÍ 🚨',
  },
  girisHavuzu: {
    s1: ['Àkókò ìrun ti tó; kírun nígbà tí àǹfààní ṣì wà.', 'Kírun nígbà tí àkókò ṣì wà fún ọ; má ṣe fi í sílẹ̀ di ẹ̀yìn.'],
    s2: ['Bí o bá ṣe ń sún un síwájú tó, bẹ́ẹ̀ ni yóò ṣe wúwo tó; má fi ìrun rẹ sílẹ̀ di òpin.', 'Àkókò ń lọ — kírun báyìí.'],
    s3: [
      'Bí o bá ṣe ń fi falẹ̀ tó, bẹ́ẹ̀ ni o ṣe ń súnmọ́ pípàdánù rẹ̀ tó; kírun báyìí.',
      'Má sọ pé “Màá kírun lẹ́yìn náà”; o lè kírun báyìí.',
      'Dìde báyìí kí o má baà sọ pé “ìbá ṣe pé” ní ìṣẹ́jú díẹ̀ sí i.',
    ],
    s4: ['Má fi ìrun rẹ falẹ̀ mọ́ — dúró kírun báyìí.', 'Fi ohun tí ò ń ṣe sílẹ̀, kí o sì dúró kírun.'],
  },
  govde: {
    s1: 'Àkókò ti ń kúrú; kírun nígbà tí àǹfààní ṣì wà.',
    s2: 'Má fi ìrun rẹ sílẹ̀ di òpin; àsìkò tó dára láti kírun ni báyìí.',
    s3: 'Àkókò ti fẹ́rẹ̀ẹ́ tán; o ṣì lè kírun báyìí.',
    s4: 'Tí o bá ti kírun, tẹ “Mo ti kírun”; tí o kò bá tíì kírun, dúró kírun báyìí.',
  },
  serit: {
    giris4: 'MÁ FI ÌRUN RẸ FALẸ̀. Dúró kírun báyìí. (ìṣj {dk} ti kọjá)',
    giris2: 'Àkókò ń lọ; má fi ìrun rẹ sílẹ̀ di òpin. (ìṣj {dk} ti kọjá)',
    giris1: cogul({ other: 'Ìṣẹ́jú {n} ti kọjá láti ìgbà tí àkókò ìrun ti wọlé.' }),
    erken4: 'Má fi ìrun rẹ falẹ̀; dúró kírun báyìí. (ìṣj {dk} ló kù)',
    cikis4: 'ÀKÓKÒ Ń PARÍ. Dúró kírun báyìí. (ìṣj {dk} ló kù)',
    cikis2: 'Àkókò ń kúrú; má fi ìrun rẹ sílẹ̀ di òpin. (ìṣj {dk} ló kù)',
    cikis1: cogul({ other: 'Ìṣẹ́jú {n} ló kù kí àkókò ìrun tó parí.' }),
  },
  geceCapasi: {
    baslik: '{ad} · kírun kí o tó sùn ⏰',
    govde: 'Àkókò ìdákẹ́jẹ́ẹ́ yóò bẹ̀rẹ̀ lẹ́yìn ìṣẹ́jú {dk}; kí ìrun ‘Iṣā’ kí o tó lọ sùn.',
  },
  icerik: {
    firsat: 'Àkókò ti ń kúrú; kírun nígbà tí àǹfààní ṣì wà.',
    sonaBirakma: 'Má fi ìrun rẹ sílẹ̀ di òpin; àsìkò tó dára láti kírun ni báyìí.',
    fisilti: 'Má sọ pé “Màá kírun lẹ́yìn náà”; àkókò ti fẹ́rẹ̀ẹ́ tán, o lè kírun báyìí.',
    omur: 'Àkókò ń kọjá; o ṣì ní àǹfààní láti kí ìrun yìí ní àkókò rẹ̀.',
    keske: 'Dìde báyìí kí o má baà sọ pé “ìbá ṣe pé” ní ìṣẹ́jú díẹ̀ sí i.',
    namazaDur: 'Tí o bá ti kírun, tẹ “Mo ti kírun”; tí o kò bá tíì kírun, dúró kírun báyìí.',
    sonDakika: 'Ìṣẹ́jú tó kẹ́yìn. Fi ohun tí ò ń ṣe sílẹ̀, kí o sì dúró kírun.',
  },
};
