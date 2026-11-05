import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Nasambeli', kazayaEkle: 'Bobakisa na qada', inceleyin: 'Botala' },
  kanal: {
    genel: 'Mayebisi ya ndɛngɛ nyɔnsɔ',
    muhafiz: 'Mokɛngɛli ya losambo',
    muhafizAciklama: 'Bokundoli ya ntango ya losambo',
    acil: 'Bokundoli ya noki ya losambo',
    acilAciklama: 'Ntango ya losambo ekosila noki - bokundoli ya noki',
    vakit: 'Bangonga ya losambo',
    vakitAciklama: 'Bokundoli etindamaka ntango ya losambo ebandi',
    muhafizSes: 'Mokɛngɛli ya losambo · {ses}',
    acilSes: 'Bokundoli ya noki · {ses}',
    acilSesAciklama: 'Ntango ya losambo ekosila noki — bokundoli ya noki',
    titresimli: '{kanal} · Koningana',
    alarm: 'Alarme ya losambo',
    alarmSes: 'Alarme ya losambo · {ses}',
    uygulamaSesi: 'Lokito ya aplikasiɔ',
    seciliSes: 'Lokito oyo boponi',
  },
  cuma: {
    baslik: "Jumu'a · {sure} etikali · losambo ekomi pene",
    govdeIlk: 'Etikali {sure} tii Dhuhr. Bomibongisa mpe bokende na moskeye.',
    govde: 'Etikali {sure} tii Dhuhr. Bokende na moskeye.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk}m tii adhan · bomibongisa mpɔ na moskeye',
    hazirlanGovde: 'Bomibongisa mpɔ na kokuta {ad} na moskeye; bobima na miniti {sonra} — adhan na miniti {dk}.',
    yolaCikBaslik: '{ad} · {dk}m tii adhan · bokende na moskeye',
    yolaCikGovde: 'Bokende na moskeye mpɔ na kokuta {ad} — adhan na miniti {dk}.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({
      one: 'Likambo {n} na manaka na bino',
      other: 'Makambo {n} oyo elandani na manaka na bino',
    }),
    etkinlikBir: 'Likambo mɔkɔ na manaka na bino',
    sonAnIkindi: 'ntango ya suka oyo ebongi mpɔ na Asr ezali {saat} (nsima na yango makruh)',
    sonAnVakit: 'ntango ya {kucuk} ekosila na {saat}',
    onceBaslik: '{ad} · likambo na {saat} · bosambela liboso',
    onceGovde: '{etkinlik} ezali {aralik}; {sonAn}. Bosambela {kucuk} liboso likambo ebanda.',
    kaplarBaslik: '{ad} · likambo ezipi ntango ya losambo',
    kaplarGovde:
      '{etkinlik} ezali {aralik} mpe ezipi ntango ya {kucuk} ({giris}–{son}). Bobongisa sikoyo mpɔ na kopema mwa moke mpe kosambela {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · bosambela liboso ya kolala 🌙',
    yatsiGovde: 'Ntango ya {ad} ezali naino; botelema mpɔ na losambo liboso pɔngi ekamata bino.',
    ozet: 'Lɛlɔ {kilinan}/5 · {liste} ezali na elembo te',
    tekOto: 'Soki bosambeli yango, botia elembo. {oto}',
    tekKaza: 'Soki bosambeli yango, botia elembo; soki bokokaki te, bobakisa yango na Buku ya qada.',
    tekSuruyor: 'Soki bosambeli yango, botia elembo. Ntango ya losambo ezali naino.',
    cokluOto: 'Bofungola aplikasiɔ mpɔ na kotala mpe kotia elembo na losambo oyo bosambeli. {oto}',
    coklu: 'Bofungola aplikasiɔ mpɔ na kotala mpe kotia elembo na losambo oyo bosambeli.',
    otoSor: 'Soki botii elembo te, bakotuna bino mpɔ na mokɔlɔ oyo na Buku ya qada.',
    otoEkle: 'Soki botii elembo te, ekobakisama na qada ntango mokɔlɔ ya losambo esili.',
  },
  gunSonu: {
    baslik: 'Lɛlɔ esili naino te · mokoba',
    govde: 'Soki botii elembo na losambo oyo bosambeli liboso mokɔlɔ esila, mokoba na bino ekokoba.',
  },
};
