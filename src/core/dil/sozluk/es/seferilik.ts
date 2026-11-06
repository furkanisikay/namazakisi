import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'hanafí', safii: 'shafií' },
  kaynaklar: {
    vatan: 'Domicilio de origen, lugar de residencia y estancia temporal en relación con el viaje (en turco)',
    cem: '¿Se pueden combinar los rezos (yam’)? (en turco)',
    baslangic: '¿Cuándo comienza la condición de viajero? (en turco)',
    ziyaret: '¿Es viajero quien va a la ciudad donde viven sus padres? (en turco)',
  },
  bilgiNotu:
    'Esto es información, no un dictamen. Que se le considere viajero depende del propósito y la duración de su viaje, y de su intención.',
  baslik: 'Parece que está de viaje',
  mesafeSatiri: 'Está a unos {km} km en línea recta de su lugar de residencia. Lo que transmite la Diyanet para la escuela {mezhep}:',
  maddeler: {
    hanefi: [
      'En la escuela hanafí, la distancia de viaje (safar) es de unos 90 km. Quien tiene la intención de quedarse menos de 15 días en el destino se considera viajero.',
      'El viajero reza los rezos obligatorios de cuatro rakats en dos rakats (qasr).',
      'En la escuela hanafí, combinar dos rezos (yam’) solo se hace durante el hayy, en Arafat y Muzdalifa. La Diyanet señala también que, ante una excusa importante como el viaje, se puede seguir la opinión de otras escuelas.',
    ],
    safii: [
      'En la escuela shafií, la distancia de viaje también es de unos 90 km. Si la estancia en el destino dura menos de 4 días, sin contar los días de llegada y salida, se siguen aplicando las normas del viaje.',
      'El viajero reza los rezos obligatorios de cuatro rakats en dos rakats (qasr).',
      'En la escuela shafií, el viaje es una de las excusas válidas para combinar (yam’) Dhuhr con Asr, y Maghrib con Isha.',
    ],
  },
  ozetAcik: 'Activado · {mezhep}',
  ozetKapali: 'Desactivado',
  baglantiAcilamadi: 'No se pudo abrir el enlace. Compruebe su conexión a internet.',
  ikametGuncellendi: 'Su lugar de residencia se actualizó',
  ikametKaydedilemedi: 'No se pudo guardar su lugar de residencia',
  kartiKapatin: 'Cerrar la tarjeta informativa de viaje',
  burasiEvimErisim: 'Esta es mi casa, guardar como lugar de residencia',
  burasiEvim: 'Esta es mi casa',
  diyanetteOkuyunErisim: 'Leer la fatua de la Diyanet en el navegador',
  diyanetteOkuyun: 'Leer en la web de la Diyanet',
  sayfa: {
    kayitliKonum: 'Ubicación guardada',
    henuzKaydedilmedi: 'Aún no guardada — su primera ubicación cuenta como lugar de residencia',
    buradasiniz: 'Está aquí',
    uzaktasiniz: 'Ahora está a unos {km} km en línea recta',
    konumBilinmiyor: 'Aún no se conoce su ubicación; elija primero una ubicación',
    giris:
      'Cuando esté a unos {km} km de su lugar de residencia, verá en la pantalla de inicio una breve tarjeta informativa que resume las fatuas de la Diyanet. Aparece una vez por viaje y no envía notificaciones.',
    bilgiKarti: 'Tarjeta informativa',
    kartBaslik: 'Tarjeta informativa de viaje',
    gosterilir: 'Se muestra en la pantalla de inicio',
    gosterilmez: 'No se muestra',
    mezhepNotu: 'El contenido de la tarjeta depende de su escuela jurídica; puede elegirla en Ajustes › Horas de rezo.',
    ikametYeri: 'Lugar de residencia',
    ikametYapErisim: 'Guardar su ubicación actual como lugar de residencia',
    ikametYap: 'Usar la ubicación actual como residencia',
    kaynaklar: 'Fuentes (Alto Consejo de Asuntos Religiosos de la Diyanet)',
    kaynakErisim: '{etiket}. Se abre en el navegador',
    /** Türkiye'ye özgü hizmet: Türkçe dışında gösterilmez. */
    fetvaHatti: 'Para sus preguntas, puede llamar a la línea de fatuas 190 de la Diyanet.',
  },
};
