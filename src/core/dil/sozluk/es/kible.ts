import type { Sozluk } from '../tr';

/** Kıble = "alquibla" (Diyanet ES); cümle içinde küçük harf, başlıkta büyük. */
export const kible: Sozluk['kible'] = {
  baslik: 'Alquibla',
  yon: {
    hizali: 'Está frente a la alquibla',
    arkada: 'La alquibla está detrás de usted, dese la vuelta',
    sagda: 'La alquibla está {derece}° a su derecha',
    solda: 'La alquibla está {derece}° a su izquierda',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'O' },
  sekme: {
    pusula: 'Brújula',
    pusulaErisim: 'Modo brújula',
    pusulaAciklama: 'Cuando la marca de la Kaaba llega a la muesca superior, está frente a la alquibla.',
    kamera: 'Cámara',
    kameraErisim: 'Modo cámara',
    kameraAciklama: 'Sostenga el teléfono en vertical; la marca de la Kaaba aparece en la dirección de la alquibla.',
  },
  sayfa: {
    baslatiliyor: 'Iniciando la brújula…',
    izinKapali: 'El permiso de ubicación está desactivado; se necesita su ubicación para encontrar la dirección.',
  },
  hata: {
    izinGerekli: 'Se necesita el permiso de ubicación para encontrar la dirección de la alquibla.',
    konumServisi: 'No se puede acceder a los servicios de ubicación. Compruebe los ajustes de ubicación de su dispositivo.',
    baslatilamadi: 'No se pudo iniciar el servicio de alquibla.',
  },
  pusula: {
    ufuk: 'horizonte',
    konumAliniyor: 'Obteniendo su ubicación…',
    hazirlaniyor: 'Preparando la brújula…',
    kuzeydenAci: 'Alquibla a {derece}° del norte',
    kabeUzakta: 'La Kaaba está a {mesafe}',
    kuzeydenSaatYonu: 'En el sentido de las agujas del reloj desde el norte',
    kuzeyden: '{derece}° del norte',
    kabeUzaktaKuzeyden: 'La Kaaba está a {mesafe}, {derece}° del norte',
    pusulaErisim: 'Brújula de la alquibla. {cumle}',
    pusulaYok: 'Este dispositivo no tiene brújula; mostramos la dirección respecto al norte.',
    kayiyorsa: 'Si la dirección se desvía, mueva el teléfono dibujando un 8 en el aire.',
    kamerayla: 'Ver con la cámara',
  },
  kamera: {
    pusulayiKullanin: 'Usar la brújula',
    kullanilamiyorBaslik: 'La vista de cámara no está disponible en este teléfono',
    kullanilamiyorMetin:
      'Los sensores de su teléfono no dan una dirección fiable en posición vertical. La brújula sigue mostrando la dirección correcta.',
    izinBaslik: 'Ver la alquibla con la cámara',
    izinMetin:
      'Sostenga el teléfono en vertical y mire a su alrededor; la marca de la Kaaba aparece en la dirección de la alquibla. Para ello se necesita el permiso de la cámara; la imagen no se guarda ni sale de su teléfono.',
    kamerayiAcin: 'Activar la cámara',
    izinKapaliBaslik: 'El permiso de la cámara está desactivado',
    izinKapaliMetin: 'Puede activar el permiso de la cámara en Ajustes para la vista de cámara. La brújula funciona sin ese permiso.',
    ayarlariAcin: 'Abrir ajustes',
    acilamadiBaslik: 'No se pudo abrir la cámara',
    acilamadiMetin: 'La cámara no está disponible en este momento. Puede encontrar la alquibla con la brújula.',
    hesaplaniyor: 'Calculando la dirección…',
    dikTutun: 'Sostenga el teléfono en vertical',
  },
  kalibrasyon: {
    tesekkurErisim: 'Gracias, la dirección ahora es más precisa',
    tesekkur: 'Gracias, la dirección ahora es más precisa ✓',
    baslik: 'Calibrar la brújula',
    sallayin: 'Mueva el teléfono dibujando un 8 en el aire.',
    metal: 'Aléjese de objetos metálicos y fundas magnéticas.',
    dogruluk: 'Precisión',
    simdiDegil: 'Ahora no',
  },
};
