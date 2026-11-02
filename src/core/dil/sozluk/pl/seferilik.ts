import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'hanafizm', safii: 'szafiizm' },
  kaynaklar: {
    vatan: 'Miejsce zamieszkania, pobytu i tymczasowego postoju w podróży (po turecku)',
    cem: 'Czy można łączyć modlitwy (dżam)? (po turecku)',
    baslangic: 'Kiedy zaczyna się podróż? (po turecku)',
    ziyaret: 'Czy osoba odwiedzająca miejscowość rodziców jest podróżnym? (po turecku)',
  },
  bilgiNotu:
    'To informacja, a nie orzeczenie. To, czy liczysz się jako podróżny, zależy od celu i długości podróży oraz od Twojej intencji.',
  baslik: 'Wygląda na to, że jesteś w podróży',
  mesafeSatiri: 'Jesteś około {km} km w linii prostej od miejsca zamieszkania. Co Diyanet przekazuje dla szkoły prawnej ({mezhep}):',
  maddeler: {
    hanefi: [
      'W szkole hanafickiej odległość podróży (safar) wynosi około 90 km. Kto zamierza zostać w miejscu docelowym krócej niż 15 dni, liczy się jako podróżny.',
      'Podróżny odprawia czterorakatowe modlitwy obowiązkowe jako dwa rakaty (qasr).',
      'W szkole hanafickiej łączenie dwóch modlitw (dżam) jest tylko podczas hadżdżu, w Arafat i Muzdalifie. Diyanet zaznacza też, że przy poważnych przeszkodach, takich jak podróż, można przyjąć pogląd innych szkół.',
    ],
    safii: [
      'W szkole szafiickiej odległość podróży również wynosi około 90 km. Jeśli pobyt w miejscu docelowym, nie licząc dni przyjazdu i wyjazdu, trwa krócej niż 4 dni, zasady podróży nadal obowiązują.',
      'Podróżny odprawia czterorakatowe modlitwy obowiązkowe jako dwa rakaty (qasr).',
      'W szkole szafiickiej podróż jest ważnym powodem łączenia (dżam) Zuhr z Asr oraz Maghrib z Isza.',
    ],
  },
  ozetAcik: 'Wł. · {mezhep}',
  ozetKapali: 'Wył.',
  baglantiAcilamadi: 'Nie udało się otworzyć linku. Sprawdź połączenie z internetem.',
  ikametGuncellendi: 'Zaktualizowano miejsce zamieszkania',
  ikametKaydedilemedi: 'Nie udało się zapisać miejsca zamieszkania',
  kartiKapatin: 'Zamknij kartę podróży',
  burasiEvimErisim: 'To mój dom, zapisz jako miejsce zamieszkania',
  burasiEvim: 'To mój dom',
  diyanetteOkuyunErisim: 'Przeczytaj fatwę Diyanet w przeglądarce',
  diyanetteOkuyun: 'Czytaj w Diyanet',
  sayfa: {
    kayitliKonum: 'Zapisana lokalizacja',
    henuzKaydedilmedi: 'Jeszcze nie zapisano — pierwsza lokalizacja liczy się jako miejsce zamieszkania',
    buradasiniz: 'Jesteś teraz tutaj',
    uzaktasiniz: 'Jesteś teraz około {km} km dalej w linii prostej',
    konumBilinmiyor: 'Lokalizacja nie jest jeszcze znana; najpierw wybierz lokalizację',
    giris:
      'Gdy jesteś około {km} km od miejsca zamieszkania, na ekranie głównym pojawia się krótka karta informacyjna streszczająca fatwy Diyanet. Karta pojawia się raz na podróż i nie wysyła powiadomień.',
    bilgiKarti: 'Karta informacyjna',
    kartBaslik: 'Karta informacji o podróży',
    gosterilir: 'Widoczna na ekranie głównym',
    gosterilmez: 'Niewidoczna',
    mezhepNotu: 'Karta uwzględnia wybraną szkołę prawną; możesz ją wybrać w Ustawienia › Czasy modlitw.',
    ikametYeri: 'Miejsce zamieszkania',
    ikametYapErisim: 'Zapisz bieżącą lokalizację jako miejsce zamieszkania',
    ikametYap: 'Ustaw tu miejsce zamieszkania',
    kaynaklar: 'Źródła (Najwyższa Rada ds. Religijnych Diyanet)',
    kaynakErisim: '{etiket}. Otwiera się w przeglądarce',
    /** Not shown outside Turkish (Türkiye-only service). */
    fetvaHatti: 'W razie pytań możesz zadzwonić na linię fatw Diyanet 190.',
  },
};
