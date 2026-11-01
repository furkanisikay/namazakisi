import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'No telemóvel',
    telefonAciklama: 'O alarme do Fajr e o despertar para o Tahajjud tocam no telemóvel.',
    saatBaslik: 'No relógio, em silêncio',
    saatAciklama:
      'Só o pulso vibra, por isso quem dorme ao seu lado não acorda. Se não o desligar no relógio, o telemóvel toca como reserva {dk} minutos depois. Se o Namaz Akışı não estiver no relógio ou não estiver atualizado, o telemóvel toca {dk} minutos mais tarde todas as manhãs.',
    saatAciklamaIos:
      'Só o pulso vibra, por isso quem dorme ao seu lado não acorda. Se não o desligar no relógio, o iPhone toca como reserva {dk} minutos depois.',
    ikisiBaslik: 'Em ambos',
    ikisiAciklama: 'O relógio e o telemóvel tocam ao mesmo tempo; desligar no relógio também silencia o telemóvel.',
    ikisiAciklamaIos: 'O relógio e o iPhone tocam ao mesmo tempo; desligar no relógio também silencia o iPhone.',
  },
  anons: {
    otomatikBaslik: 'No telemóvel, no relógio quando o telemóvel está longe',
    otomatikAciklama:
      'Quando o telemóvel está consigo, é ele que lê em voz alta e o relógio fica propositadamente calado (para os dois dispositivos não lerem a mesma frase). Quando o telemóvel está longe, é o relógio que lê.',
    saatBaslik: 'Só no relógio',
    saatAciklama:
      'O relógio lê sempre em voz alta e o telemóvel fica calado. Enquanto o relógio está a carregar, sem ligação ao telemóvel ou sem o Namaz Akışı, nada é lido; se não quiser isso, use a primeira opção.',
    telefonBaslik: 'Só no telemóvel',
    telefonAciklama: 'O relógio nunca fala.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Se o Namaz Akışı estiver instalado no Apple Watch, divide o trabalho com o iPhone. Aqui escolhe onde toca o despertar.',
    giris:
      'Se o Namaz Akışı estiver instalado no relógio, divide o trabalho com o telemóvel. Aqui escolhe onde toca o despertar e onde se ouve a leitura em voz alta.',
    uyandirmaBaslik: 'Onde deve tocar o despertar?',
    uyandirmaNotu:
      'O despertar é o alarme verdadeiro que ativa para o Fajr no lembrete "Antes do fim da hora" e o despertar para o Tahajjud que ativa em Orações voluntárias.',
    uyandirmaNotuIos:
      'O watchOS só consegue definir um alarme silencioso com a aplicação do relógio aberta: abra o Namaz Akışı no relógio uma vez por dia e o despertar seguinte fica definido nesse momento. Enquanto o relógio está a carregar ou se a aplicação não foi aberta, toca a reserva do iPhone.',
    uyandirmaNotuAndroid: 'O relógio não toca enquanto está a carregar; nesse caso toca o telemóvel.',
    muhafizAyarlari: 'Abrir as definições de "Antes do fim da hora"',
    nafileAyarlari: 'Abrir as definições das orações voluntárias',
    bilektenBaslik: 'O que pode fazer a partir do pulso',
    bilektenIos: [
      'Quando o iPhone está longe, os lembretes tocam no relógio; não tocam nos dois.',
      'Marca as orações que rezou a partir do pulso; o iPhone regista-as.',
      'Conta o tasbih com a Digital Crown e encontra a Quibla no relógio.',
    ],
    anonsBaslik: 'Onde deve ser feita a leitura em voz alta?',
    anonsNotu:
      'Só são lidos os lembretes com leitura em voz alta ativada. Os dois dispositivos não leem a mesma frase em conjunto. O relógio também fica calado quando está na mesquita ou com o Modo oração ativado. Se o relógio não tiver altifalante, motor de leitura de texto ou voz em português, só vibra. Pode testar já o som do relógio com "Testar o som" na aplicação Namaz Akışı do relógio.',
    bilekten: [
      'Pode ativar e desativar o Modo oração com o botão do relógio (até ao fim da hora da oração, no máximo 30 minutos).',
      'Na mesquita, o relógio mostra o estado; responde a "Isto não é uma mesquita" e "Está na mesquita?" a partir do pulso.',
      'Os ecrãs que não cabem no relógio (Registo de reposições, Na mesquita, definições) abrem-se no telemóvel com "Abrir no telemóvel".',
    ],
    namazModuNotu: 'Para ativar o Modo oração a partir do relógio, ative-o primeiro uma vez no telemóvel.',
    namazModuAyarlari: 'Abrir as definições do Modo oração',
  },
  sayfa: {
    akilliSaat: 'Relógio inteligente',
    appleWatchOzet: 'Onde toca o despertar',
    saatOzet: 'Onde tocam o despertar e a leitura em voz alta',
    canliEtkinlikler: 'Atividades em direto',
    canliSayaclar: 'Contagens em direto',
    geriSayim: 'Contagem decrescente',
    gelismisErisim: 'Avançado. Automatizações e aplicações que marcam Rezei',
    gelismis: 'Avançado',
    otomasyonlar: 'Automatizações',
    otomasyonBaslik: 'Usar com automatizações',
    otomasyonOzet: 'Samsung Rotinas, Tasker, MacroDroid',
    kildimBaslik: 'Aplicações que marcam Rezei',
    kildimOzet: 'Aplicações que autorizou',
  },
};
