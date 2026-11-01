import type { Sozluk } from '../tr';

/** Kıble "Quibla" (IslamHouse pt), Kâbe "Caaba"; yön harfleri pt-PT: Norte, Este, Sul, Oeste. */
export const kible: Sozluk['kible'] = {
  baslik: 'Quibla',
  yon: {
    hizali: 'A Quibla está à sua frente',
    arkada: 'A Quibla está atrás de si, volte-se',
    sagda: 'A Quibla está {derece}° à sua direita',
    solda: 'A Quibla está {derece}° à sua esquerda',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'O' },
  sekme: {
    pusula: 'Bússola',
    pusulaErisim: 'Modo bússola',
    pusulaAciklama: 'Quando a marca da Caaba chegar ao entalhe no topo, a Quibla está à sua frente.',
    kamera: 'Câmara',
    kameraErisim: 'Modo câmara',
    kameraAciklama: 'Segure o telemóvel na vertical; a marca da Caaba aparece na direção da Quibla.',
  },
  sayfa: {
    baslatiliyor: 'A iniciar a bússola…',
    izinKapali: 'A autorização de localização está desativada; a sua localização é necessária para encontrar a direção.',
  },
  hata: {
    izinGerekli: 'É necessária a autorização de localização para encontrar a direção da Quibla.',
    konumServisi: 'Não é possível aceder aos serviços de localização. Verifique as definições de localização do dispositivo.',
    baslatilamadi: 'Não foi possível iniciar o serviço da Quibla.',
  },
  pusula: {
    ufuk: 'horizonte',
    konumAliniyor: 'A obter a sua localização…',
    hazirlaniyor: 'A preparar a bússola…',
    kuzeydenAci: 'Quibla a {derece}° do norte',
    kabeUzakta: 'A Caaba está a {mesafe}',
    kuzeydenSaatYonu: 'No sentido dos ponteiros do relógio a partir do norte',
    kuzeyden: '{derece}° do norte',
    kabeUzaktaKuzeyden: 'A Caaba está a {mesafe}, {derece}° do norte',
    pusulaErisim: 'Bússola da Quibla. {cumle}',
    pusulaYok: 'Este dispositivo não tem bússola; mostramos a direção em relação ao norte.',
    kayiyorsa: 'Se a direção se desviar, mova o telemóvel no ar desenhando um 8.',
    kamerayla: 'Ver com a câmara',
  },
  kamera: {
    pusulayiKullanin: 'Usar a bússola',
    kullanilamiyorBaslik: 'A vista de câmara não está disponível neste telemóvel',
    kullanilamiyorMetin:
      'Os sensores do seu telemóvel não dão uma direção fiável na vertical. A bússola continua a mostrar a direção corretamente.',
    izinBaslik: 'Veja a Quibla com a câmara',
    izinMetin:
      'Segure o telemóvel na vertical e olhe à sua volta; a marca da Caaba aparece na direção da Quibla. Para isso é necessária a autorização da câmara; a imagem não é gravada e nunca sai do telemóvel.',
    kamerayiAcin: 'Ativar a câmara',
    izinKapaliBaslik: 'A autorização da câmara está desativada',
    izinKapaliMetin: 'Pode permitir o acesso à câmara nas Definições para usar a vista de câmara. A bússola funciona sem ela.',
    ayarlariAcin: 'Abrir Definições',
    acilamadiBaslik: 'Não foi possível abrir a câmara',
    acilamadiMetin: 'A câmara não está disponível neste momento. Pode encontrar a Quibla com a bússola.',
    hesaplaniyor: 'A calcular a direção…',
    dikTutun: 'Segure o telemóvel na vertical',
  },
  kalibrasyon: {
    tesekkurErisim: 'Obrigado, a direção está agora mais precisa',
    tesekkur: 'Obrigado, a direção está agora mais precisa ✓',
    baslik: 'Calibrar a bússola',
    sallayin: 'Mova o telemóvel no ar desenhando um 8.',
    metal: 'Afaste-se de objetos metálicos e de capas magnéticas.',
    dogruluk: 'Precisão',
    simdiDegil: 'Agora não',
  },
};
