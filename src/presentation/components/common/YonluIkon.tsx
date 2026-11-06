/**
 * `FontAwesome5` yerine geçen ikon: ad yönlüyse (`YONLU_IKONLAR`) sağdan sola çizimde yatay
 * aynalanır, değilse olduğu gibi çizilir. Veriden gelen ikon adlarını (ör. `ikon: 'arrow-right'`)
 * çizen ortak bileşenlerde de güvenle kullanılır. Kural ve istisnalar: `./yon.ts`.
 */
import * as React from 'react';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { yonluIkonStili } from './yon';

type Props = React.ComponentProps<typeof FontAwesome5>;

export const YonluIkon: React.FC<Props> = ({ style, ...props }) => {
  const ayna = yonluIkonStili(props.name);
  return <FontAwesome5 {...props} style={ayna ? [style, ayna] : style} />;
};
