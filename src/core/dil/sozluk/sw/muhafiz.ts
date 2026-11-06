import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Wito wa ibada kwa Kiswahili: amri fupi ya umoja, bila "tafadhali". Amri ni "Simamisha Swala"
 * (17:78); "swali" peke yake HAITUMIKI (maana yake "soru"), kitenzi huandikwa "uswali"/"kuswali".
 * "Kusujudu" haitumiki (ikizi ya marufuku ya "secdeye kapan"). Kichwani kipimo ni "dk":
 * "Magharibi · 10dk" kinaingia katika herufi 16 za kwanza.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}dk zimepita · ni wakati wa Swala ⏰',
    giris2: '{ad} · {dk}dk zimepita · usichelewe kuswali ⚠️',
    giris3: '{ad} · {dk}dk zimepita · Swala yako inakusubiri 🔥',
    giris4: '{ad} · {dk}dk zimepita · SIMAMISHA SWALA 🚨',
    erken3: '{ad} · {dk}dk zimebaki · Swala yako inakusubiri 🔥',
    erken4: '{ad} · {dk}dk zimebaki · SIMAMISHA SWALA 🚨',
    cikis1: '{ad} · {dk}dk zimebaki ⏰',
    cikis2: '{ad} · {dk}dk · muda unapungua ⚠️',
    cikis3: '{ad} · {dk}dk · muda unakwisha 🔥',
    cikis4: '{ad} · {dk}dk · WAKATI UNAISHA 🚨',
  },
  girisHavuzu: {
    s1: ['Ni wakati wa Swala; simamisha Swala ukiwa bado una nafasi.', 'Simamisha Swala wakati bado uko upande wako; usiiache baadaye.'],
    s2: ['Kadiri unavyoiahirisha, ndivyo inavyozidi kuwa nzito; usiiache Swala yako hadi mwisho.', 'Muda unasonga — simamisha Swala sasa.'],
    s3: [
      'Kadiri unavyochelewa, ndivyo unavyokaribia kuikosa; simamisha Swala sasa.',
      'Usiseme "nitaswali baadaye"; unaweza kuswali sasa.',
      'Inuka sasa kuliko kusema "laiti" baada ya dakika chache.',
    ],
    s4: ['Usiichelewesha Swala yako tena — simamisha Swala sasa.', 'Weka chini unachofanya na usimamishe Swala.'],
  },
  govde: {
    s1: 'Muda unaanza kupungua; simamisha Swala ukiwa bado una nafasi.',
    s2: 'Usiiache Swala yako hadi mwisho; sasa ni wakati mzuri wa kuswali.',
    s3: 'Muda karibu umekwisha; bado unaweza kuswali sasa.',
    s4: 'Kama umeswali, gusa "Nimeswali"; kama bado, simamisha Swala sasa.',
  },
  serit: {
    giris4: 'USICHELEWESHE SWALA YAKO. Simamisha Swala sasa. (dakika {dk} zimepita)',
    giris2: 'Muda unasonga; usiiache Swala yako hadi mwisho. (dakika {dk} zimepita)',
    giris1: cogul({ one: 'Imepita dakika {n} tangu wakati wa Swala uingie.', other: 'Zimepita dakika {n} tangu wakati wa Swala uingie.' }),
    erken4: 'Usiichelewesha Swala yako; simamisha Swala sasa. (dakika {dk} zimebaki)',
    cikis4: 'WAKATI UNAISHA. Simamisha Swala sasa. (dakika {dk} zimebaki)',
    cikis2: 'Muda unapungua; usiiache Swala yako hadi mwisho. (dakika {dk} zimebaki)',
    cikis1: cogul({ one: 'Imebaki dakika {n} hadi wakati wa Swala uishe.', other: 'Zimebaki dakika {n} hadi wakati wa Swala uishe.' }),
  },
  geceCapasi: {
    baslik: '{ad} · uswali kabla ya kulala ⏰',
    govde: 'Saa za utulivu zinaanza baada ya dakika {dk}; simamisha Swala ya Isha kabla ya kwenda kulala.',
  },
  icerik: {
    firsat: 'Muda unaanza kupungua; simamisha Swala ukiwa bado una nafasi.',
    sonaBirakma: 'Usiiache Swala yako hadi mwisho; sasa ni wakati mzuri wa kuswali.',
    fisilti: 'Usiseme "nitaswali baadaye"; muda karibu umekwisha, unaweza kuswali sasa.',
    omur: 'Muda unapita; bado una nafasi ya kuiswali Swala hii kwa wakati wake.',
    keske: 'Inuka sasa kuliko kusema "laiti" baada ya dakika chache.',
    namazaDur: 'Kama umeswali, gusa "Nimeswali"; kama bado, simamisha Swala sasa.',
    sonDakika: 'Dakika za mwisho. Weka chini unachofanya na usimamishe Swala.',
  },
};
