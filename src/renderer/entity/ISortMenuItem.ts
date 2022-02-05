import { ItemHelper } from '../../main/entity/ItemHelper';
import { YakpKdbxItem } from '../../main/entity/YakpKdbxItem';

/**
 * Interface to type the sort item state
 */
export interface ISortMenuItem {
  id: number;
  displayName: string;
  compare: (a: YakpKdbxItem, b: YakpKdbxItem) => number;
}

export const sortMenuItems = [
  {
    displayName: 'Sort by Title',
    compare: (a: YakpKdbxItem, b: YakpKdbxItem) =>
      ItemHelper.stripProtection(a.title)?.localeCompare(ItemHelper.stripProtection(b.title)),
    id: 0,
  },
  {
    displayName: 'Sort by User Name',
    compare: (a: YakpKdbxItem, b: YakpKdbxItem) =>
      ItemHelper.stripProtection(a.fields.UserName)?.localeCompare(ItemHelper.stripProtection(b.fields.UserName)),
    id: 1,
  },
  {
    displayName: 'Sort by URL',
    compare: (a: YakpKdbxItem, b: YakpKdbxItem) =>
      ItemHelper.stripProtection(a.fields.URL)?.localeCompare(ItemHelper.stripProtection(b.fields.URL)),
    id: 2,
  },
  {
    displayName: 'Sort by Creation Time',
    compare: (a: YakpKdbxItem, b: YakpKdbxItem) => a.creationTime.valueOf() - b.creationTime.valueOf(),
    id: 3,
  },
];
