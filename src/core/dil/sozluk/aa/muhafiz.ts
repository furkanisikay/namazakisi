import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı: çoğul kısa emir (QE 2:43 "Salat Soolisaay"), secde yok, "!" yok. "Namaza dur" =
 * "Salaatah soola" (sool = ayağa kalkmak, IH "soolaah"); "geciktirme" = "ma raaqisina" (IH
 * "salat le waktik raaqisam" = namazı vaktinden geciktirmek). Başlıkta süre "{dk}daq" (bileklik
 * 16 karakter: "Magrib · 655daq"). Türetildi; yerli okuyucu baksın.
 */
export const muhafiz: Sozluk['muhafiz'] = {
  baslik: {
    giris1: '{ad} · {dk}daq gexe · salat wakti ⏰',
    giris2: '{ad} · {dk}daq gexe · salat ma raaqisina ⚠️',
    giris3: '{ad} · {dk}daq gexe · salat sin qambaalta 🔥',
    giris4: '{ad} · {dk}daq gexe · SALAATAH SOOLA 🚨',
    erken3: '{ad} · {dk}daq raqte · salat sin qambaalta 🔥',
    erken4: '{ad} · {dk}daq raqte · SALAATAH SOOLA 🚨',
    cikis1: '{ad} · {dk}daq raqte ⏰',
    cikis2: '{ad} · {dk}daq · wakti dagoowta ⚠️',
    cikis3: '{ad} · {dk}daq · wakti gexa 🔥',
    cikis4: '{ad} · {dk}daq · WAKTI DUDDUMTA 🚨',
  },
  girisHavuzu: {
    s1: ['Salat wakti; dudda tanih salat aba.', 'Wakti sin luk tanih salat aba; lakal ma cabina.'],
    s2: ['Raaqiseenik gibdoowta; sinni salat ellecabol ma cabina.', 'Wakti gexa; asaaku salat aba.'],
    s3: [
      'Raaqiseenik bayissam xayyoowta; asaaku salat aba.',
      '«Lakal abenno» ma axcina; asaaku salat abaanam duddan.',
      'Daqiiqa dago lakal nadaamatak dumak, asaaku ugutta.',
    ],
    s4: ['Sinni salat kaadu ma raaqisina; asaaku salaatah soola.', 'Abtan taama cabaay salaatah soola.'],
  },
  govde: {
    s1: 'Wakti dagoowta; dudda tanih salat aba.',
    s2: 'Sinni salat ellecabol ma cabina; asaaku salaatah meqe wakti.',
    s3: 'Wakti duddumam yaybulle; hanna asaaku salat abaanam duddan.',
    s4: 'Salat abteenik «Salat abe» xagisa; hinnay asaaku salaatah soola.',
  },
  serit: {
    giris4: 'SINNI SALAT MA RAAQISINA. Asaaku salaatah soola. ({dk} daq gexe)',
    giris2: 'Wakti gexa; sinni salat ellecabol ma cabina. ({dk} daq gexe)',
    giris1: cogul({ one: 'Salat wakti culek {n} daqiiqa gexe.', other: 'Salat wakti culek {n} daqiiqa gexe.' }),
    erken4: 'Sinni salat ma raaqisina; asaaku salaatah soola. ({dk} daq raqte)',
    cikis4: 'WAKTI DUDDUMTA. Asaaku salaatah soola. ({dk} daq raqte)',
    cikis2: 'Wakti dagoowta; sinni salat ellecabol ma cabina. ({dk} daq raqte)',
    cikis1: cogul({ one: 'Salat wakti gexam fanah {n} daqiiqa raqte.', other: 'Salat wakti gexam fanah {n} daqiiqa raqte.' }),
  },
  geceCapasi: {
    baslik: '{ad} · xiinam dumak salat aba ⏰',
    govde: 'Xongolo mali saaqoota {dk} daq lakal qimbisa; xiinam dumak Qisha salat aba.',
  },
  icerik: {
    firsat: 'Wakti dagoowta; dudda tanih salat aba.',
    sonaBirakma: 'Sinni salat ellecabol ma cabina; asaaku salaatah meqe wakti.',
    fisilti: '«Lakal abenno» ma axcina; wakti duddumam yaybulle, asaaku salat abaanam duddan.',
    omur: 'Wakti gexa; ama salat isi waktil abaanam hanna duddan.',
    keske: 'Daqiiqa dago lakal nadaamatak dumak, asaaku ugutta.',
    namazaDur: 'Salat abteenik «Salat abe» xagisa; hinnay asaaku salaatah soola.',
    sonDakika: 'Ellecabo daqiiqa. Abtan taama cabaay salaatah soola.',
  },
};
