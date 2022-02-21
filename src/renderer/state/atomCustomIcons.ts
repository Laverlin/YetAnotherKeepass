import { atom, selectorFamily } from 'recoil';
import { CustomIcon } from '../../main/entity/CustomIcon';

export const atomCustomIcons = atom<CustomIcon[]>({
  key: 'atomCustomIcons',
  default: [],
});

export const selectorCustomIcon = selectorFamily<CustomIcon | undefined, string>({
  key: 'selectorCustomIcon',
  get:
    (sid) =>
    ({ get }) =>
      get(atomCustomIcons).find((i) => i.key === sid),
});
