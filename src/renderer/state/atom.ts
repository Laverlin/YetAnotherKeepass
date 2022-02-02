/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { CustomIcon } from 'main/entity/CustomIcon';
import { ItemHelper } from 'main/entity/ItemHelper';
import { allItemsGroup, allItemsGroupSid, YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { YakpMetadata } from 'main/entity/YakpMetadata';
import { atom, atomFamily, DefaultValue, selector, selectorFamily } from 'recoil';
import { GroupStatistic } from './GroupStatistic';

export const yakpMetadataAtom = atom<YakpMetadata | undefined>({
  key: 'yakpMetadataAtom',
  default: undefined,
});

export const yakpKdbxItemAtomIds = atom<string[]>({
  key: 'yakpKdbxItemAtomIds',
  default: [],
});

export const yakpKdbxItemAtom = atomFamily<YakpKdbxItem, string>({
  key: 'yakpKdbxItemAtom',
  default: (sid) => (sid === allItemsGroupSid ? allItemsGroup : new YakpKdbxItem()),
});

export const allItemSelector = selector<YakpKdbxItem[]>({
  key: 'allItemSelector',
  get: ({ get }) => get(yakpKdbxItemAtomIds).map((i) => get(yakpKdbxItemAtom(i))),
  set: ({ get, set, reset }, items) => {
    if (items instanceof DefaultValue) return;

    // reset previous state
    //
    get(yakpKdbxItemAtomIds).map((i) => reset(yakpKdbxItemAtom(i)));
    reset(yakpKdbxItemAtomIds);

    // set new state
    //
    items.map((i) => set(yakpKdbxItemAtom(i.sid), i));
    set(
      yakpKdbxItemAtomIds,
      items.map((i) => i.sid)
    );
  },
});

export const groupStatSelector = selectorFamily<GroupStatistic, string>({
  key: 'groupStatSelector',
  get:
    (sid) =>
    ({ get }) => {
      const group = get(yakpKdbxItemAtom(sid));

      const filter = (item: YakpKdbxItem) => {
        return (
          (!item.isGroup && item.parentSid === group.sid) ||
          group.isAllItemsGroup ||
          (group.isRecycleBin && item.isRecycled)
        );
      };

      const toDate = (value: number) => {
        return value > 0 ? new Date(value) : undefined;
      };

      const reducer = (acc: GroupStatistic, item: YakpKdbxItem) => {
        if (!filter(item)) return acc;
        acc.totalEntries += 1;
        acc.lastChanged = toDate(Math.max(acc.lastChanged?.valueOf() || 0, item.lastModifiedTime?.valueOf() || 0));
        acc.closeExpired =
          item.isExpires && (item.expiryTime?.valueOf() || 0) > Date.now()
            ? toDate(
                !acc.closeExpired
                  ? item.expiryTime?.valueOf() || 0
                  : Math.min(acc.closeExpired?.valueOf() || 0, item.expiryTime?.valueOf() || 0)
              )
            : acc.closeExpired;
        return acc;
      };
      return get(allItemSelector).reduce(reducer, new GroupStatistic());
    },
});

/**
 * state (uuid) of selected group
 */
export const selectGroupAtom = atom<string | undefined>({
  key: 'selectGroupAtom',
  default: allItemsGroupSid,
});

/**
 * state (uuid) of selected entry
 */
export const selectEntryAtom = atom<string | undefined>({
  key: 'selectEntryAtom',
  default: undefined,
});

/**
 * get - returns selected entry if one exists, otherwise returns selected group \
 * set - set selected item (entry or group), and change selected states of previously selected and new selected group
 */
export const selectItemSelector = selector<string | undefined>({
  key: 'selectItemSelector',
  get: ({ get }) => get(selectEntryAtom) || get(selectGroupAtom),
  set: ({ get, set }, selectedSid) => {
    if (!selectedSid || selectedSid instanceof DefaultValue) return;

    const dropSelection = (i: YakpKdbxItem) => {
      const cloned = ItemHelper.clone(i);
      cloned.isSelected = false;
      return cloned;
    };

    const selectedItem = ItemHelper.clone(get(yakpKdbxItemAtom(selectedSid)));
    if (selectedItem.isGroup && !selectedItem.isRecycled) {
      set(selectEntryAtom, (curEntId) => {
        curEntId && set(yakpKdbxItemAtom(curEntId), dropSelection);
        return undefined;
      });
      set(selectGroupAtom, (curGrpId) => {
        curGrpId && set(yakpKdbxItemAtom(curGrpId), dropSelection);
        return selectedSid;
      });
    } else {
      set(selectEntryAtom, (curEntId) => {
        curEntId && set(yakpKdbxItemAtom(curEntId), dropSelection);
        return selectedSid;
      });
    }

    selectedItem.isSelected = true;
    set(yakpKdbxItemAtom(selectedSid), selectedItem);
  },
});

export const yakpCustomIconsAtom = atom<CustomIcon[]>({
  key: 'yakpCustomIconsAtom',
  default: [],
});

export const yakpCustomIconSelector = selectorFamily<CustomIcon | undefined, string>({
  key: 'yakpCustomIconSelector',
  get:
    (sid) =>
    ({ get }) =>
      get(yakpCustomIconsAtom).find((i) => i.key === sid),
});
