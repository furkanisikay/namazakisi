import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'hanafita', safii: 'xafeíta' },
  kaynaklar: {
    vatan: 'Residência, domicílio e estadia temporária em matéria de viagem (em turco)',
    cem: 'Podem as orações ser juntadas (jam‘)? (em turco)',
    baslangic: 'Quando começa a viagem? (em turco)',
    ziyaret: 'Quem visita a terra dos pais é viajante? (em turco)',
  },
  bilgiNotu:
    'Isto é informação, não uma decisão religiosa. Ser ou não considerado viajante depende do objetivo e da duração da viagem e da sua intenção.',
  baslik: 'Parece que está em viagem',
  mesafeSatiri: 'Está a cerca de {km} km do seu local de residência em linha reta. O que a Diyanet transmite para a escola {mezhep}:',
  maddeler: {
    hanefi: [
      'Na escola hanafita, a distância de viagem é de cerca de 90 km. Quem tenciona ficar menos de 15 dias no destino é considerado viajante.',
      'O viajante reza as orações obrigatórias de quatro rakats como dois rakats (qasr).',
      'Na escola hanafita, juntar duas orações (jam‘) só acontece durante o Hajj, em Arafat e Muzdalifa. A Diyanet refere também que, em impedimentos sérios como a viagem, se pode seguir a opinião das outras escolas.',
    ],
    safii: [
      'Na escola xafeíta, a distância de viagem também é de cerca de 90 km. Se a estadia no destino for inferior a 4 dias, sem contar os dias de chegada e de partida, mantêm-se as regras da viagem.',
      'O viajante reza as orações obrigatórias de quatro rakats como dois rakats (qasr).',
      'Na escola xafeíta, a viagem é um impedimento válido para juntar (jam‘) o Zuhr com o Assr e o Magrib com o Ishá.',
    ],
  },
  ozetAcik: 'Ativado · {mezhep}',
  ozetKapali: 'Desativado',
  baglantiAcilamadi: 'Não foi possível abrir a ligação. Verifique a sua ligação à Internet.',
  ikametGuncellendi: 'O seu local de residência foi atualizado',
  ikametKaydedilemedi: 'Não foi possível guardar o seu local de residência',
  kartiKapatin: 'Fechar o cartão de viagem',
  burasiEvimErisim: 'Esta é a minha casa, guardar como local de residência',
  burasiEvim: 'Esta é a minha casa',
  diyanetteOkuyunErisim: 'Ler o parecer da Diyanet no navegador',
  diyanetteOkuyun: 'Ler na Diyanet',
  sayfa: {
    kayitliKonum: 'Localização guardada',
    henuzKaydedilmedi: 'Ainda não guardada — a sua primeira localização conta como local de residência',
    buradasiniz: 'Está aqui agora',
    uzaktasiniz: 'Está agora a cerca de {km} km em linha reta',
    konumBilinmiyor: 'A sua localização ainda não é conhecida; escolha primeiro uma localização',
    giris:
      'Quando estiver a cerca de {km} km do seu local de residência, aparece no ecrã principal um breve cartão informativo que resume os pareceres da Diyanet. O cartão aparece uma vez por viagem e não envia notificações.',
    bilgiKarti: 'Cartão informativo',
    kartBaslik: 'Cartão de viagem',
    gosterilir: 'Mostrado no ecrã principal',
    gosterilmez: 'Não mostrado',
    mezhepNotu: 'O cartão segue a sua escola jurídica; pode escolhê-la em Definições › Horários das orações.',
    ikametYeri: 'Local de residência',
    ikametYapErisim: 'Guardar a localização atual como local de residência',
    ikametYap: 'Tornar a localização atual a minha residência',
    kaynaklar: 'Fontes (Alto Conselho de Assuntos Religiosos da Diyanet)',
    kaynakErisim: '{etiket}. Abre no navegador',
    fetvaHatti: 'Para dúvidas, pode ligar para a linha de pareceres 190 da Diyanet.',
  },
};
