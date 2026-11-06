import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Bildirim düğmesi kısa ve kişisiz: "✅ Odprawiono" (cinsiyetli "Modliłem/Modliłam się" yazılmaz). */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Odprawiono', kazayaEkle: 'Do zaległych', inceleyin: 'Przejrzyj' },
  kanal: {
    genel: 'Powiadomienia ogólne',
    muhafiz: 'Strażnik modlitwy',
    muhafizAciklama: 'Przypomnienia o czasie modlitwy',
    acil: 'Pilne przypomnienie o modlitwie',
    acilAciklama: 'Czas modlitwy zaraz się skończy - pilne przypomnienia',
    vakit: 'Czasy modlitw',
    vakitAciklama: 'Przypomnienia wysyłane na początku czasu modlitwy',
    muhafizSes: 'Strażnik modlitwy · {ses}',
    acilSes: 'Pilne przypomnienie · {ses}',
    acilSesAciklama: 'Czas modlitwy zaraz się skończy — pilne przypomnienia',
    titresimli: '{kanal} · Wibracje',
    alarm: 'Alarm modlitwy',
    alarmSes: 'Alarm modlitwy · {ses}',
    uygulamaSesi: 'Dźwięk aplikacji',
    seciliSes: 'Wybrany dźwięk',
  },
  cuma: {
    baslik: 'Dżumu’a · zostało {sure} · modlitwa blisko',
    govdeIlk: 'Do Zuhr: {sure}. Przygotuj się i idź do meczetu.',
    govde: 'Do Zuhr: {sure}. Idź do meczetu.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} min do adhanu · szykuj się do meczetu',
    hazirlanGovde: 'Przygotuj się, by zdążyć na {ad} w meczecie; wyjdź za {sonra} min — adhan za {dk} min.',
    yolaCikBaslik: '{ad} · {dk} min do adhanu · idź do meczetu',
    yolaCikGovde: 'Idź do meczetu, by zdążyć na {ad} — adhan za {dk} min.',
  },
  takvim: {
    etkinlikTek: '„{ad}”',
    etkinlikCoklu: cogul({
      one: '{n} wydarzenie w kalendarzu',
      few: '{n} kolejne wydarzenia w kalendarzu',
      many: '{n} kolejnych wydarzeń w kalendarzu',
      other: '{n} kolejnego wydarzenia w kalendarzu',
    }),
    etkinlikBir: 'Wydarzenie w kalendarzu',
    sonAnIkindi: 'ostatni odpowiedni czas na Asr to {saat} (później czas niezalecany)',
    sonAnVakit: 'czas modlitwy {kucuk} kończy się o {saat}',
    onceBaslik: '{ad} · wydarzenie o {saat} · najpierw modlitwa',
    onceGovde: '{etkinlik}: {aralik}; {sonAn}. Odpraw modlitwę {kucuk} przed rozpoczęciem wydarzenia.',
    kaplarBaslik: '{ad} · wydarzenie w czasie modlitwy',
    kaplarGovde:
      '{etkinlik}: {aralik}, w całym czasie modlitwy {kucuk} ({giris}–{son}). Zaplanuj już teraz krótką przerwę, by odprawić modlitwę {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · odpraw przed snem 🌙',
    yatsiGovde: 'Czas modlitwy {ad} wciąż trwa; stań do modlitwy, zanim zaśniesz.',
    ozet: 'Dziś {kilinan}/5 · nieoznaczone: {liste}',
    tekOto: 'Jeśli modlitwa jest odprawiona, oznacz ją. {oto}',
    tekKaza: 'Jeśli modlitwa jest odprawiona, oznacz ją; jeśli nie, dodaj ją do rejestru zaległych modlitw.',
    tekSuruyor: 'Jeśli modlitwa jest odprawiona, oznacz ją. Czas modlitwy wciąż trwa.',
    cokluOto: 'Otwórz aplikację, aby przejrzeć i oznaczyć odprawione modlitwy. {oto}',
    coklu: 'Otwórz aplikację, aby przejrzeć i oznaczyć odprawione modlitwy.',
    otoSor: 'Jeśli ich nie oznaczysz, rejestr zaległych modlitw zapyta o ten dzień.',
    otoEkle: 'Jeśli ich nie oznaczysz, po zakończeniu dnia modlitwy trafią do zaległych.',
  },
  gunSonu: {
    baslik: 'Dzień niepełny · seria',
    govde: 'Jeśli przed końcem dnia oznaczysz odprawione modlitwy, seria będzie trwać.',
  },
};
