import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * "Seri" = "racha"; "Toparlanma" = "recuperación" (kazanın "qada"sından ayrı). "Allah daim etsin" →
 * "Que Allah le mantenga en ello"; "Allah sebat versin" → "Que Allah le dé firmeza". Ünlem ("¡…!") yok.
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Su racha está encendida',
    enUzun: cogul({ one: 'Racha más larga: {n} día', other: 'Racha más larga: {n} días', many: 'Racha más larga: {n} de días' }),
    gunBuyuk: cogul({ one: 'DÍA', other: 'DÍAS', many: 'DE DÍAS' }),
    sonrakiHedef: 'Siguiente objetivo: día {hedef} ({durum})',
    kalanGun: cogul({ one: 'Falta {n} día', other: 'Faltan {n} días', many: 'Faltan {n} de días' }),
    tamamlandi: 'Completado',
    paylasErisim: 'Comparta su progreso',
    paylasBuyuk: 'COMPARTA SU PROGRESO',
  },

  hedefler: {
    ilk_adim: { ad: 'Primera semana', aciklama: 'Rece 7 días sin interrupción', cumle: 'Primera semana' },
    aliskanlik_ustasi: { ad: 'Maestro del hábito', aciklama: '21 días - el tiempo de crear un hábito', cumle: 'Maestro del hábito' },
    kararlilik: { ad: 'Constancia', aciklama: '60 días sin interrupción', cumle: 'Constancia' },
    efsane: { ad: 'Leyenda', aciklama: '90 días - una constancia excepcional', cumle: 'Leyenda' },
  },

  /** Klasik mertebe adları, İspanyolca transliterasyonla (çeviri değil). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Primer paso', aciklama: 'Completó su primera semana.', kosul: 'Racha de 7 días' },
    aliskanlik_ustasi: {
      ad: 'Maestro del hábito',
      aciklama: '21 días - completó el tiempo de crear un hábito.',
      kosul: 'Racha de 21 días',
    },
    kararlilik: { ad: 'Constante', aciklama: 'Rezó 60 días sin interrupción.', kosul: 'Racha de 60 días' },
    efsane: { ad: 'Leyenda', aciklama: '90 días - mostró una constancia excepcional.', kosul: 'Racha de 90 días' },
    toparlanma_ustasi: {
      ad: 'Maestro de la recuperación',
      aciklama: 'Completó el modo recuperación 3 veces.',
      kosul: '3 recuperaciones',
    },
    mukemmeliyetci: { ad: 'Perfeccionista', aciklama: 'Hizo los 5 rezos durante 30 días.', kosul: '30 días con 5/5 rezos' },
    yuz_namaz: { ad: '100 rezos', aciklama: 'Ha hecho 100 rezos en total.', kosul: 'Hacer 100 rezos' },
    bin_namaz: { ad: '1000 rezos', aciklama: 'Ha hecho 1000 rezos en total.', kosul: 'Hacer 1000 rezos' },
  },

  rozetSeviyeleri: { bronz: 'BRONCE', gumus: 'PLATA', altin: 'ORO', elmas: 'DIAMANTE' },

  gunBitis: {
    erken: 'Para quienes se acuestan temprano',
    varsayilan: 'Predeterminado - antes de Fajr en la mayoría de lugares',
    gec: 'Para quienes se acuestan tarde',
  },

  kutlama: {
    rozetEklendi: '🏅 Añadida a su colección de insignias',
    paylasin: 'Compartir',
    rozetBaslik: 'Que Allah le mantenga en ello',
    rozetMesaj: 'Obtuvo la insignia «{ad}».',
    hedefBaslik: cogul({ one: '{n} día', other: '{n} días', many: '{n} de días' }),
    hedefMesaj: 'Alcanzó el objetivo «{ad}». Que Allah le mantenga en ello.',
    yeniRank: 'Nuevo rango: {rank}',
    seviyeBaslik: 'Su nuevo nivel',
    seviyeMesaj: 'Ahora continúa como «{rank}». Que Allah le mantenga en ello.',
    toparlanmaBaslik: 'Recuperó su racha',
    toparlanmaMesaj: cogul({
      one: 'Su racha de {n} día continúa donde se quedó. Que Allah le dé firmeza.',
      other: 'Su racha de {n} días continúa donde se quedó. Que Allah le dé firmeza.',
      many: 'Su racha de {n} de días continúa donde se quedó. Que Allah le dé firmeza.',
    }),
    enUzunBaslik: 'Su racha más larga',
    enUzunMesaj: cogul({
      one: '{n} día: su racha más larga hasta ahora. Que Allah le mantenga en ello.',
      other: '{n} días: su racha más larga hasta ahora. Que Allah le mantenga en ello.',
      many: '{n} de días: su racha más larga hasta ahora. Que Allah le mantenga en ello.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Ahora no se puede leer su historial.',
    yenidenErisim: 'Volver a cargar los datos de la racha',
    yenidenDeneyin: 'Reintentar',
    yukleniyor: 'Cargando los datos de su racha...',
    gunlukSeri: 'días de racha',
    rekor: 'récord',
    sozErisim: '{metin} Fuente: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Siguiente objetivo',
    tumu: 'Obtuvo todas las insignias',
    kalan: cogul({
      one: 'Insignia {ad}: falta {n} día',
      other: 'Insignia {ad}: faltan {n} días',
      many: 'Insignia {ad}: faltan {n} de días',
    }),
    tumuErisim: 'Obtuvo todas las insignias: el tasbih está completo.',
    erisim: 'Insignia {ad}: {n} de {hedef} días completados.',
  },

  gok: {
    gunHarfleri: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({
      one: '{n} día con el objetivo cumplido',
      other: '{n} días con el objetivo cumplido',
      many: '{n} de días con el objetivo cumplido',
    }),
    besVakit: cogul({
      one: '{n} día con los cinco rezos',
      other: '{n} días con los cinco rezos',
      many: '{n} de días con los cinco rezos',
    }),
    dondurulmus: cogul({ one: '{n} día congelado', other: '{n} días congelados', many: '{n} de días congelados' }),
    mevcutSeri: cogul({ one: 'Racha actual: {n} día.', other: 'Racha actual: {n} días.', many: 'Racha actual: {n} de días.' }),
  },

  hedefAyar: {
    azalt: 'Reducir',
    deger: 'Valor',
    artir: 'Aumentar',
    esik: cogul({ one: '{n} rezo', other: '{n} rezos', many: '{n} de rezos' }),
    sifirlaBaslik: 'Restablecer la racha',
    sifirlaMesaj: 'Se restablecerán todos los datos de su racha (racha, insignias, puntos). Esta acción no se puede deshacer. ¿Quiere continuar?',
    sifirla: 'Restablecer',
    iptal: 'Cancelar',
    basarili: 'Hecho',
    sifirlandi: 'Se restablecieron los datos de su racha.',
    hedefAyarlari: 'AJUSTES DEL OBJETIVO',
    tamGunEsigi: 'Umbral de día completo',
    tamGunAciklama: 'Define el número mínimo de rezos al día para que ese día cuente en su racha',
    sifirlama: 'RESTABLECER',
    verileriSifirla: 'Restablecer los datos de la racha',
    verileriSifirlaAlt: 'Borra todos los datos de racha, insignias y puntos',
  },

  rozetKarti: {
    erisim: 'Insignia {ad}, {durum}',
    kazanildi: 'obtenida',
    kilitli: 'bloqueada',
  },

  toparlanma: {
    kartBaslik: 'MODO RECUPERACIÓN',
    kartAltBaslik: 'Puede recuperar su racha',
    kartMesaj: 'Puede continuar su racha {vurgu} donde la dejó.',
    oncekiGun: cogul({ one: 'de {n} día', other: 'de {n} días', many: 'de {n} de días' }),
    ilerleme: '{tamam}/{hedef} días completados',
    kalan: cogul({
      one: 'Complete los cinco rezos durante {n} día más y su racha continuará donde se quedó.',
      other: 'Complete los cinco rezos durante {n} días más y su racha continuará donde se quedó.',
      many: 'Complete los cinco rezos durante {n} de días más y su racha continuará donde se quedó.',
    }),
    bugun: 'Complete el día de hoy y su racha continuará donde se quedó.',
    uyari: 'Basta con que estos días sean seguidos; si falta un día en medio, la recuperación vuelve a empezar.',
    kapatErisim: 'Cerrar los detalles de la recuperación',
    anladim: 'Entendido',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Compartir su progreso',
    hazirDegilBaslik: 'La imagen no está lista',
    hazirDegilMesaj: 'La imagen aún no está lista. Vuelva a intentarlo en unos segundos.',
    olusturulamadiBaslik: 'No se pudo crear la imagen',
    olusturulamadiMesaj: 'Se produjo un error al crear la imagen. Vuelva a intentarlo.',
    kullanilamiyorBaslik: 'No se puede compartir',
    kullanilamiyorMesaj: 'La función de compartir no está disponible en este dispositivo.',
    kapat: 'Cerrar',
    hikaye: 'Añadir a su historia',
    platformlar: 'Se puede compartir en Instagram, WhatsApp y otras aplicaciones.',
    tamam: 'Aceptar',
    seriEnUzun: cogul({ one: 'Mi racha más larga: {n} día', other: 'Mi racha más larga: {n} días', many: 'Mi racha más larga: {n} de días' }),
    seriZincir: cogul({
      one: 'DÍA SIN ROMPER LA CADENA',
      other: 'DÍAS SIN ROMPER LA CADENA',
      many: 'DE DÍAS SIN ROMPER LA CADENA',
    }),
    seriSoz: '«Un pequeño paso cada día, una gran paz en mi alma. 🔥»',
    rozetYeni: 'HE OBTENIDO UNA NUEVA INSIGNIA',
    rozetSozleri: [
      'Hoy he dado un buen paso por mí. 🌟',
      'Sigo con determinación; esta insignia es mía. 💪',
      'He aprovechado la baraka de la mañana. 🌅',
      'Formo parte de este camino que hace bien a mi alma. ✨',
      'Los pequeños pasos traen una gran paz. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'HE OBTENIDO UNA NUEVA INSIGNIA',
      hedef_tamamlandi: 'OBJETIVO ALCANZADO',
      seviye_atlandi: 'NUEVO NIVEL',
      toparlanma_tamamlandi: 'DE NUEVO EN EL CAMINO',
      en_uzun_seri: 'NUEVO RÉCORD',
      varsayilan: 'LOGRO',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Que mi Señor me mantenga en ello. 🤲', 'Los pequeños pasos traen una gran paz. 🍃', 'Que Allah nos dé firmeza a todos. 🌱'],
      hedef_tamamlandi: ['Los pequeños pasos traen una gran paz. 🍃', 'Que Allah me mantenga en ello. 🤲', 'Un paso más cada día. 🌱'],
      seviye_atlandi: [
        'Avanzo un poco más cada día; que Allah me facilite el camino. 🍃',
        'Que Allah me mantenga en ello. 🤲',
        'El camino continúa. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Lo importante no es caer, sino levantarse. 🔄',
        'Que Allah me dé firmeza. 🤲',
        'Con paciencia se recorre cualquier camino. 🌱',
      ],
      en_uzun_seri: [
        'Un pequeño paso cada día, una gran paz en mi corazón. 🍃',
        'Que Allah me mantenga en ello. 🤲',
        'Que mi Señor nos dé firmeza a todos. 🌱',
      ],
    },
  },
};
