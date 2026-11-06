import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'En el teléfono',
    telefonAciklama: 'La alarma de Fajr y el despertador de Tahajjud suenan en su teléfono.',
    saatBaslik: 'En el reloj, en silencio',
    saatAciklama:
      'Solo vibra su muñeca; quien duerme a su lado no se despierta. Si no la detiene en el reloj, su teléfono suena como respaldo {dk} minutos después. Si Namaz Akışı no está instalado en su reloj o no está actualizado, su teléfono suena cada mañana con {dk} minutos de retraso.',
    saatAciklamaIos:
      'Solo vibra su muñeca; quien duerme a su lado no se despierta. Si no la detiene en el reloj, su iPhone suena como respaldo {dk} minutos después.',
    ikisiBaslik: 'En los dos',
    ikisiAciklama: 'El reloj y el teléfono suenan a la vez; detenerla en el reloj también silencia el teléfono.',
    ikisiAciklamaIos: 'El reloj y el iPhone suenan a la vez; detenerla en el reloj también silencia el iPhone.',
  },
  anons: {
    otomatikBaslik: 'En el teléfono; en el reloj si está lejos',
    otomatikAciklama:
      'Cuando su teléfono está cerca, la lectura la hace el teléfono y su reloj calla a propósito (para que los dos dispositivos no lean la misma frase). Cuando su teléfono está lejos, la lectura la hace su reloj.',
    saatBaslik: 'Solo en el reloj',
    saatAciklama:
      'La lectura en voz alta la hace siempre su reloj y su teléfono calla. Si su reloj se está cargando, no está conectado a su teléfono o no tiene Namaz Akışı, no se oye nada; si no quiere esto, use la primera opción.',
    telefonBaslik: 'Solo en el teléfono',
    telefonAciklama: 'Su reloj nunca habla.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Si Namaz Akışı está instalado en su Apple Watch, comparte el trabajo con su iPhone. Aquí elige dónde suena el despertador.',
    giris:
      'Si Namaz Akışı está instalado en su reloj, comparte el trabajo con su teléfono. Aquí elige dónde suena el despertador y dónde se leen los avisos en voz alta.',
    uyandirmaBaslik: '¿Dónde debe sonar el despertador?',
    uyandirmaNotu:
      'El despertador es la alarma real que activa para Fajr en el recordatorio «Antes de que termine la hora» y el despertador de Tahajjud que activa en Rezos voluntarios.',
    uyandirmaNotuIos:
      'watchOS solo puede programar una alarma silenciosa con la app del reloj abierta: abra Namaz Akışı en su reloj una vez al día y el siguiente despertador se programa en ese momento. Si el reloj se está cargando o la app no se ha abierto, suena el respaldo de su iPhone.',
    uyandirmaNotuAndroid: 'Su reloj no suena mientras se carga; entonces suena su teléfono.',
    muhafizAyarlari: 'Abrir los ajustes de «Antes de que termine la hora»',
    nafileAyarlari: 'Abrir los ajustes de los rezos voluntarios',
    bilektenBaslik: 'Lo que puede hacer desde la muñeca',
    bilektenIos: [
      'Cuando su iPhone está lejos, los recordatorios suenan en su reloj; los dos no suenan a la vez.',
      'Marca desde la muñeca los rezos que hizo; su iPhone los registra.',
      'Cuenta el tasbih con la Digital Crown y encuentra la alquibla en su reloj.',
    ],
    anonsBaslik: '¿Dónde debe hacerse la lectura en voz alta?',
    anonsNotu:
      'Solo se leen los recordatorios que tienen activada la lectura en voz alta. Los dos dispositivos no leen la misma frase a la vez. Su reloj también calla cuando está en la mezquita o con el modo rezo activado. Si su reloj no tiene altavoz, motor de lectura o voz en el idioma de la aplicación, solo vibra. Puede probar ya el sonido del reloj con «Probar el sonido» en la app Namaz Akışı del reloj.',
    bilekten: [
      'Puede activar y desactivar el modo rezo con el botón del reloj (hasta el final de la hora del rezo, 30 minutos como máximo).',
      'En la mezquita, su reloj muestra el estado; responde desde la muñeca a «Esto no es una mezquita» y «¿Está en la mezquita?».',
      'Las pantallas que no caben en el reloj (Registro de qada, En la mezquita, ajustes) se abren en su teléfono con «Abrir en el teléfono».',
    ],
    namazModuNotu: 'Para activar el modo rezo desde el reloj, actívelo antes una vez en su teléfono.',
    namazModuAyarlari: 'Abrir los ajustes del modo rezo',
  },
  sayfa: {
    akilliSaat: 'Reloj inteligente',
    appleWatchOzet: 'Dónde suena el despertador',
    saatOzet: 'Dónde suenan el despertador y la lectura en voz alta',
    canliEtkinlikler: 'Actividades en directo',
    canliSayaclar: 'Cuentas atrás en directo',
    geriSayim: 'Cuenta atrás',
    gelismisErisim: 'Avanzado. Automatizaciones y aplicaciones que marcan «Ya recé»',
    gelismis: 'Avanzado',
    otomasyonlar: 'Automatizaciones',
    otomasyonBaslik: 'Usar con automatizaciones',
    otomasyonOzet: 'Rutinas de Samsung, Tasker, MacroDroid',
    kildimBaslik: 'Aplicaciones que marcan «Ya recé»',
    kildimOzet: 'Las aplicaciones que usted autorizó',
  },
};
