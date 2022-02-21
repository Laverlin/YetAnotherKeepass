/* eslint-disable @typescript-eslint/no-unused-expressions */
import { atom, DefaultValue, selector } from 'recoil';
import { ItemHelper } from '../../main/entity/ItemHelper';
import { allItemsGroupSid, YakpKdbxItem } from '../../main/entity/YakpKdbxItem';
import { selectorYakpItem } from './atomYakpItem';

/**
 * state (uuid) of selected group
 */
export const atomSelectedGroup = atom<string | undefined>({
  key: 'selectGroupAtom',
  default: allItemsGroupSid,
});

/**
 * state (uuid) of selected entry
 */
export const atomSelectedEntry = atom<string | undefined>({
  key: 'selectEntryAtom',
  default: undefined,
});

/**
 * get - returns selected entry if one exists, otherwise returns selected group \
 * set - set selected item (entry or group), and change selected states of previously selected and new selected group
 */
export const selectorSelectedItem = selector<string | undefined>({
  key: 'selectItemSelector',
  get: ({ get }) => get(atomSelectedEntry) || get(atomSelectedGroup) || allItemsGroupSid,
  set: ({ get, set }, selectedSid) => {
    if (!selectedSid || selectedSid instanceof DefaultValue) return;

    const dropSelection = (i: YakpKdbxItem) => {
      const cloned = ItemHelper.clone(i);
      cloned.isSelected = false;
      return cloned;
    };

    const selectedItem = ItemHelper.clone(get(selectorYakpItem(selectedSid)));
    if (selectedItem.isGroup && !selectedItem.isRecycled) {
      set(atomSelectedEntry, (curEntId) => {
        curEntId && set(selectorYakpItem(curEntId), dropSelection);
        return undefined;
      });
      set(atomSelectedGroup, (curGrpId) => {
        curGrpId && set(selectorYakpItem(curGrpId), dropSelection);
        return selectedSid;
      });
    } else {
      set(atomSelectedEntry, (curEntId) => {
        curEntId && set(selectorYakpItem(curEntId), dropSelection);
        return selectedSid;
      });
    }

    selectedItem.isSelected = true;
    set(selectorYakpItem(selectedSid), selectedItem);
  },
});
