import { atom } from 'recoil';

export const atomAllItemIds = atom<string[]>({
  key: 'atomAllItemIds',
  default: [],
});
