import { ProtectedValue } from 'kdbxweb';
import { atom, selector } from 'recoil';
import { selectorAllItems, selectorYakpItem } from './atomYakpItem';
import { atomSelectedGroup } from './atomSelectItem';
import { allItemsGroup, allItemsGroupSid, YakpKdbxItem } from '../../main/entity/YakpKdbxItem';
import { ISortMenuItem, sortMenuItems } from '../entity/ISortMenuItem';

/**
 * Base selector to filter items in selected gorup.
 */
export const selectorGroupEntries = selector<YakpKdbxItem[]>({
  key: 'selectorGroupEntries',
  get: ({ get }) => {
    const groupSid = get(atomSelectedGroup);
    if (!groupSid) return [];

    const selectedGroup = groupSid === allItemsGroupSid ? allItemsGroup : get(selectorYakpItem(groupSid));

    const filter = (item: YakpKdbxItem) => {
      return (
        ((!item.isGroup || selectedGroup.isRecycleBin) && item.parentSid === groupSid) ||
        (selectedGroup.isAllItemsGroup && !item.isRecycled && !item.isGroup) ||
        (selectedGroup.isRecycleBin && item.isRecycled)
      );
    };

    return get(selectorAllItems).filter(filter);
  },
});

/**
 * Selector to get all available tags
 */
export const selectorAllTags = selector<string[]>({
  key: 'allTagSelector',
  get: ({ get }) => {
    let tags: string[] = [];
    tags = get(selectorAllItems)
      .map((i) => tags.concat(i.tags))
      .flat();
    return [...new Set(tags)].sort();
  },
});

/**
 * Atom to store the state of selected filters
 */
export const atomTagFilter = atom<string[]>({
  key: 'tagFilterAtom',
  default: [],
});

/**
 * Atom to store the state of selected colors
 */
export const atomColorFilter = atom<{ color: string }>({
  key: 'colorFilterAtom',
  default: { color: '' },
});

/**
 * Atom to store the state of query string
 */
export const atomSearchFilter = atom<string>({
  key: 'searchFilter',
  default: '',
});

/**
 * Atom to store the sort order state
 */
export const atomSortEntries = atom<ISortMenuItem>({
  key: 'top/sortMenu',
  default: sortMenuItems[0],
});

/**
 * Selector to filter items according to all available filters and sort them
 */
export const selectorFilteredEntryIds = selector<string[]>({
  key: 'selectorFilteredEntryIds',
  get: ({ get }) => {
    const filterQuery = (item: YakpKdbxItem, query: string): boolean => {
      const normalizedQuery = query.toLocaleLowerCase();
      return (
        !!Object.keys(item.fields).find((i) =>
          item.fields[i] instanceof ProtectedValue
            ? (item.fields[i] as ProtectedValue).getText().toLocaleLowerCase().includes(normalizedQuery)
            : (item.fields[i] as string).toLocaleLowerCase().includes(normalizedQuery)
        ) ||
        !!item.tags.find((t) => t.toLocaleLowerCase().includes(normalizedQuery)) ||
        item.title.toLocaleLowerCase().includes(normalizedQuery)
      );
    };

    const colorFilter = get(atomColorFilter);
    const tagFilter = get(atomTagFilter);
    const searchFilter = get(atomSearchFilter);
    const sortField = get(atomSortEntries);
    let filtered = get(selectorGroupEntries);

    if (colorFilter.color) filtered = filtered.filter((e) => e.bgColor === colorFilter.color);
    if (tagFilter.length > 0) filtered = filtered.filter((e) => e.tags.filter((t) => tagFilter.includes(t)).length > 0);
    if (searchFilter) filtered = filtered.filter((e) => filterQuery(e, searchFilter));
    filtered = filtered.slice().sort(sortField.compare);

    return filtered.map((i) => i.sid);
  },
  set: ({ reset }) => {
    reset(atomColorFilter);
    reset(atomTagFilter);
    reset(atomSearchFilter);
    reset(atomSortEntries);
  },
});
