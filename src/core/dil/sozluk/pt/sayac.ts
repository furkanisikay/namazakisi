import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Contagem da oração',
    kanalAciklama: 'Notificação de contagem decrescente antes do fim da hora da oração',
    baslik: '⏱️ Oração de {ad}',
    govde: 'A hora de {ad} está a terminar.',
  },
  canli: {
    vakitGovde: 'Tempo até ao fim de {ad}',
    cumaBaslik: '🕌 Oração de Jumu’ah',
    cumaGovde: 'Tempo até ao Zuhr (o sermão)',
    nafileGovde: 'Tempo até ao fim de {ad}',
  },
  iftar: {
    kanal: 'Contagem do iftar',
    kanalAciklama: 'Notificação de contagem decrescente para a hora do iftar',
    baslik: '🌙 Contagem do iftar',
    govde: 'Não quebre o jejum antes de ouvir o Azán.',
    girdiBaslik: '🌙 Hora do iftar',
    girdiGovde: 'Bom iftar, com bênçãos.',
    girdiUzun: 'Bom iftar, com bênçãos.\n\n⚠️ Não quebre o jejum antes de ouvir o Azán. Lembre-se de nós nas suas súplicas :)',
  },
  sahur: {
    kanal: 'Contagem do suhur',
    kanalAciklama: 'Notificação de contagem decrescente para o fim do suhur (Fajr)',
    baslik: '🌙 Contagem do suhur',
    govde: 'Ainda pode comer e beber; o jejum começa em breve.',
    girdiBaslik: '🌙 Terminou o suhur',
    girdiGovde: 'É hora de fazer a intenção.',
    girdiUzun: 'Começou a hora do Fajr; não se esqueça de fazer a intenção.\n\n⚠️ Já pode rezar o Fajr. Lembre-se de nós nas suas súplicas :)',
  },
  seri: {
    kanal: 'Contagem da sequência',
    kanalAciklama: 'Contagem decrescente para o fim do dia da sequência',
    baslik: '🔥 A sua sequência está em risco',
    govde: 'As orações de hoje estão incompletas; não perca a sua sequência.',
    girdiBaslik: '🔥 Terminou o dia da sequência',
    girdiGovde: 'Começou um novo dia.',
  },
};
