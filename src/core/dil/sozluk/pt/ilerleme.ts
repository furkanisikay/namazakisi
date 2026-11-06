import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Progresso',
  kilma: {
    baslik: 'Taxa de oração',
    haftalik: 'Semanal',
    aylik: 'Mensal',
    donemErisim: 'Período da taxa de oração',
    hesaplaniyor: 'A calcular a sua taxa de oração',
    bosBaslik: 'Ainda sem registos',
    bosAciklama: 'Aparece aqui à medida que marca as suas orações.',
    yuzde: '{n}%',
    kilinan: 'Rezadas',
    oran: 'Taxa',
    enIyiGun: 'Melhor dia',
    haftaHedefi: 'Objetivo desta semana',
    hedefAlt: cogul({ one: 'Segundo o seu objetivo de sequência: {n} oração por dia', many: 'Segundo o seu objetivo de sequência: {n} de orações por dia', other: 'Segundo o seu objetivo de sequência: {n} orações por dia' }),
    kilinanNamaz: 'Orações rezadas',
    hedefeUlasan: 'Dias com objetivo cumprido',
    ayYil: '{ay} de {yil}',
    namazKilinanGun: 'Dias com oração',
    vakitVakit: 'Por oração',
    yuzdeErisim: '{ad}: {n} por cento',
  },
  rozetler: {
    baslik: 'Nível e distintivos',
    seviye: 'Nível {n}',
    puan: 'Pontos',
    kalanErisim: cogul({ one: 'Falta {n} ponto para o nível {rank}', many: 'Faltam {n} de pontos para o nível {rank}', other: 'Faltam {n} pontos para o nível {rank}' }),
    enYuksek: 'Está no nível mais alto',
    kalan: cogul({ one: 'Falta {n} ponto para {rank}', many: 'Faltam {n} de pontos para {rank}', other: 'Faltam {n} pontos para {rank}' }),
    kilinanErisim: cogul({ one: '{n} oração rezada', many: '{n} de orações rezadas', other: '{n} orações rezadas' }),
    namaz: cogul({ one: 'oração', many: 'orações', other: 'orações' }),
    rozetErisim: '{n} de {toplam} distintivos conquistados',
    rozet: cogul({ one: 'distintivo', many: 'distintivos', other: 'distintivos' }),
  },
};
