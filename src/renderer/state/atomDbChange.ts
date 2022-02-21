/* eslint-disable no-return-assign */
import { atom, selector } from 'recoil';
import { ItemHelper } from '../../main/entity/ItemHelper';
import { selectorAllItems, selectorYakpItem } from './atomYakpItem';

export const atomDbChange = atom<boolean>({
  key: 'atomDbChange',
  default: false,
});

export const selectorIsDbSaved = selector<boolean>({
  key: 'electorIsDbSaved',
  get: ({ get }) => {
    return !!get(selectorAllItems).find((i) => i.isChanged) || get(atomDbChange);
  },
  set: ({ get, set }) => {
    get(selectorAllItems)
      .filter((i) => i.isChanged)
      .forEach((i) => set(selectorYakpItem(i.sid), (cur) => ItemHelper.apply(cur, (e) => (e.isChanged = false))));
    set(atomDbChange, false);
  },
});
