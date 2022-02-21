import { YakpHistoryItem } from 'main/entity/YakpHistoryItem';
import { atomFamily, DefaultValue, selector, selectorFamily } from 'recoil';
import { atomHistoryItems } from './atomHistory';
import { allItemsGroup, allItemsGroupSid, YakpKdbxItem } from '../../main/entity/YakpKdbxItem';
import { atomAllItemIds } from '.';

const atomYakpItem = atomFamily<YakpKdbxItem, string>({
  key: 'atomYakpItem',
  default: (sid) => (sid === allItemsGroupSid ? allItemsGroup : new YakpKdbxItem()),
});

export const selectorYakpItem = selectorFamily<YakpKdbxItem, string>({
  key: 'selectorYakpItem',
  get:
    (sid) =>
    ({ get }) =>
      get(atomYakpItem(sid)),
  set:
    (sid) =>
    ({ set }, newValue) => {
      if (newValue instanceof DefaultValue) return;
      let oldValue: YakpKdbxItem | undefined;
      set(atomYakpItem(sid), (cur) => {
        oldValue = cur;
        return newValue;
      });
      if (oldValue && !oldValue.isChanged && newValue.isChanged)
        set(atomHistoryItems(sid), (cur) =>
          cur.concat([{ ...oldValue, historyIndex: cur.length } as YakpHistoryItem])
        );
    },
});

export const selectorAllItems = selector<YakpKdbxItem[]>({
  key: 'selectorAllItems',
  get: ({ get }) => get(atomAllItemIds).map((i) => get(selectorYakpItem(i))),
  set: ({ get, set, reset }, items) => {
    if (items instanceof DefaultValue) return;

    // reset previous state
    //
    get(atomAllItemIds).forEach((i) => reset(selectorYakpItem(i)));
    reset(atomAllItemIds);

    // set new state
    //
    items.map((i) => set(selectorYakpItem(i.sid), i));
    set(
      atomAllItemIds,
      items.map((i) => i.sid)
    );
  },
});
