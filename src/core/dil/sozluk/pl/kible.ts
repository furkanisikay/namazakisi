import type { Sozluk } from '../tr';

/** Kıble "kibla" (pl.wikipedia madde adı); pusula harfleri uluslararası N/E/S/W (Lehçe pusulalarda da). */
export const kible: Sozluk['kible'] = {
  baslik: 'Kibla',
  yon: {
    hizali: 'Kibla jest przed Tobą',
    arkada: 'Kibla jest za Tobą, odwróć się',
    sagda: 'Kibla jest {derece}° w prawo',
    solda: 'Kibla jest {derece}° w lewo',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'W' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Tryb kompasu',
    pusulaAciklama: 'Gdy znak Kaaby dotrze do wycięcia u góry, kibla jest przed Tobą.',
    kamera: 'Aparat',
    kameraErisim: 'Tryb aparatu',
    kameraAciklama: 'Trzymaj telefon pionowo; znak Kaaby pojawi się w kierunku kibli.',
  },
  sayfa: {
    baslatiliyor: 'Uruchamianie kompasu…',
    izinKapali: 'Dostęp do lokalizacji jest wyłączony; do wyznaczenia kierunku potrzebna jest lokalizacja.',
  },
  hata: {
    izinGerekli: 'Do wyznaczenia kierunku kibli potrzebny jest dostęp do lokalizacji.',
    konumServisi: 'Usługi lokalizacji są niedostępne. Sprawdź ustawienia lokalizacji urządzenia.',
    baslatilamadi: 'Nie udało się uruchomić usługi kibli.',
  },
  pusula: {
    ufuk: 'horyzont',
    konumAliniyor: 'Pobieranie lokalizacji…',
    hazirlaniyor: 'Przygotowywanie kompasu…',
    kuzeydenAci: 'Kibla jest {derece}° od północy',
    kabeUzakta: 'Kaaba jest w odległości {mesafe}',
    kuzeydenSaatYonu: 'Od północy zgodnie z ruchem wskazówek zegara',
    kuzeyden: '{derece}° od północy',
    kabeUzaktaKuzeyden: 'Kaaba jest w odległości {mesafe}, {derece}° od północy',
    pusulaErisim: 'Kompas kibli. {cumle}',
    pusulaYok: 'To urządzenie nie ma kompasu; kierunek jest pokazany względem północy.',
    kayiyorsa: 'Jeśli kierunek się przesuwa, poruszaj telefonem w powietrzu ruchem ósemki.',
    kamerayla: 'Pokaż w aparacie',
  },
  kamera: {
    pusulayiKullanin: 'Użyj kompasu',
    kullanilamiyorBaslik: 'Widok z aparatu jest niedostępny na tym telefonie',
    kullanilamiyorMetin:
      'Czujniki telefonu nie podają wiarygodnego kierunku, gdy jest trzymany pionowo. Kompas nadal pokazuje kierunek prawidłowo.',
    izinBaslik: 'Zobacz kiblę w aparacie',
    izinMetin:
      'Trzymaj telefon pionowo i rozejrzyj się; znak Kaaby pojawi się w kierunku kibli. Potrzebny jest dostęp do aparatu; obraz nie jest nagrywany i nie opuszcza telefonu.',
    kamerayiAcin: 'Włącz aparat',
    izinKapaliBaslik: 'Dostęp do aparatu jest wyłączony',
    izinKapaliMetin: 'Dostęp do aparatu dla widoku z aparatu możesz włączyć w Ustawieniach. Kompas działa bez niego.',
    ayarlariAcin: 'Otwórz Ustawienia',
    acilamadiBaslik: 'Nie udało się otworzyć aparatu',
    acilamadiMetin: 'Aparat jest teraz niedostępny. Kiblę możesz znaleźć kompasem.',
    hesaplaniyor: 'Wyznaczanie kierunku…',
    dikTutun: 'Trzymaj telefon pionowo',
  },
  kalibrasyon: {
    tesekkurErisim: 'Dziękujemy, kierunek jest teraz dokładniejszy',
    tesekkur: 'Dziękujemy, kierunek jest teraz dokładniejszy ✓',
    baslik: 'Skalibruj kompas',
    sallayin: 'Poruszaj telefonem w powietrzu ruchem ósemki.',
    metal: 'Odsuń się od metalowych przedmiotów i magnetycznych etui.',
    dogruluk: 'Dokładność',
    simdiDegil: 'Nie teraz',
  },
};
