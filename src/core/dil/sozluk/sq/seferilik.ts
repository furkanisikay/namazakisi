import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanefi', safii: 'Shafii' },
  kaynaklar: {
    vatan: 'Vendlindja, vendbanimi dhe qëndrimi i përkohshëm për sa i përket udhëtimit (në turqisht)',
    cem: 'A mund të bashkohen namazet (xhem)? (në turqisht)',
    baslangic: 'Kur fillon udhëtimi (seferi)? (në turqisht)',
    ziyaret: 'A llogaritet udhëtar ai që shkon në vendin ku jetojnë prindërit? (në turqisht)',
  },
  bilgiNotu:
    'Ky është informacion, jo vendim fetar. Nëse llogariteni udhëtar apo jo varet nga qëllimi dhe kohëzgjatja e udhëtimit dhe nga nijeti juaj.',
  baslik: 'Duket se jeni në udhëtim',
  mesafeSatiri: 'Jeni rreth {km} km larg vendbanimit tuaj në vijë ajrore. Ç’përcjell Diyaneti për medhhebin {mezhep}:',
  maddeler: {
    hanefi: [
      'Në medhhebin hanefi, distanca e udhëtimit (seferit) është rreth 90 km. Ai që ka nijet të qëndrojë më pak se 15 ditë në vendin ku shkon llogaritet udhëtar.',
      'Udhëtari i fal namazet farz me katër rekate si dy rekate (kasr).',
      'Në medhhebin hanefi, bashkimi i dy namazeve (xhem) bëhet vetëm në haxh, në Arafat dhe në Muzdelife. Diyaneti shton se në arsye të rëndësishme, si udhëtimi, mund të veprohet sipas mendimit të medhhebeve të tjera.',
    ],
    safii: [
      'Edhe në medhhebin shafii distanca e udhëtimit është rreth 90 km. Nëse qëndrimi në vendin ku shkohet është më pak se 4 ditë, pa llogaritur ditët e mbërritjes dhe të nisjes, dispozitat e udhëtimit vazhdojnë.',
      'Udhëtari i fal namazet farz me katër rekate si dy rekate (kasr).',
      'Në medhhebin shafii, udhëtimi është arsye e vlefshme për bashkimin (xhem) e drekës me ikindinë dhe të akshamit me jacinë.',
    ],
  },
  ozetAcik: 'Aktiv · {mezhep}',
  ozetKapali: 'Joaktiv',
  baglantiAcilamadi: 'Lidhja nuk u hap. Kontrolloni lidhjen me internetin.',
  ikametGuncellendi: 'Vendbanimi juaj u përditësua',
  ikametKaydedilemedi: 'Vendbanimi juaj nuk u ruajt',
  kartiKapatin: 'Mbyllni kartën e udhëtimit',
  burasiEvimErisim: 'Këtu është shtëpia ime, ruajeni si vendbanimin tim',
  burasiEvim: 'Këtu është shtëpia',
  diyanetteOkuyunErisim: 'Lexoni fetvanë e Diyanetit në shfletues',
  diyanetteOkuyun: 'Lexoni te Diyaneti',
  sayfa: {
    kayitliKonum: 'Vendndodhja e ruajtur',
    henuzKaydedilmedi: 'Ende e paruajtur — vendndodhja juaj e parë llogaritet vendbanim',
    buradasiniz: 'Tani jeni këtu',
    uzaktasiniz: 'Tani jeni rreth {km} km larg në vijë ajrore',
    konumBilinmiyor: 'Vendndodhja juaj nuk dihet ende; zgjidhni fillimisht një vendndodhje',
    giris:
      'Kur largoheni rreth {km} km nga vendbanimi juaj, në ekranin kryesor shfaqet një kartë e shkurtër informative që përmbledh fetvatë e Diyanetit. Karta shfaqet një herë për çdo udhëtim dhe nuk dërgon njoftime.',
    bilgiKarti: 'Karta informative',
    kartBaslik: 'Karta informative e udhëtimit',
    gosterilir: 'Shfaqet në ekranin kryesor',
    gosterilmez: 'Nuk shfaqet',
    mezhepNotu: 'Përmbajtja e kartës është sipas medhhebit tuaj; medhhebin mund ta zgjidhni te Cilësimet › Kohët e namazit.',
    ikametYeri: 'Vendbanimi',
    ikametYapErisim: 'Ruajeni vendndodhjen aktuale si vendbanim',
    ikametYap: 'Bëjeni vendndodhjen aktuale vendbanim',
    kaynaklar: 'Burimet (Këshilli i Lartë i Çështjeve Fetare i Diyanetit)',
    kaynakErisim: '{etiket}. Hapet në shfletues',
    fetvaHatti: 'Për pyetje mund të telefononi linjën e fetvave 190 të Diyanetit.',
  },
};
