import { atomFamily, DefaultValue, selector } from 'recoil';
import { IHistoryState } from '../entity/IHistoryState';
import { YakpHistoryItem } from '../../main/entity/YakpHistoryItem';
import { atomAllItemIds } from './atomAllItemIds';

export const atomHistory = atomFamily<IHistoryState, string>({
  key: 'atomHistory',
  default: {
    isInHistory: false,
    historyIndex: 0,
  },
});

export const atomHistoryItems = atomFamily<YakpHistoryItem[], string>({
  key: 'atomHistoryItems',
  default: () => [],
});

export const selectorAllHistoryItems = selector<YakpHistoryItem[]>({
  key: 'selectorAllHistoryItems',
  get: ({ get }) =>
    get(atomAllItemIds).reduce((acc, i) => acc.concat(get(atomHistoryItems(i))), [] as YakpHistoryItem[]),
  set: ({ set, get, reset }, items) => {
    if (items instanceof DefaultValue) return;

    get(atomAllItemIds).forEach((i) => reset(atomHistoryItems(i)));

    [...new Set(items.map((i) => i.sid))].forEach((i) =>
      set(
        atomHistoryItems(i),
        items.filter((h) => h.sid === i)
      )
    );
  },
});
