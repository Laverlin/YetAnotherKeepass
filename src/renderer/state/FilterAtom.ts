import { ProtectedValue } from 'kdbxweb';
import { allItemsGroup, allItemsGroupSid, YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { atom, selector } from 'recoil';
import { ISortMenuItem, sortMenuItems } from 'renderer/entity/ISortMenuItem';
import { allItemSelector, selectGroupAtom, yakpKdbxItemAtom } from './atom';

/**
 * Base selector to filter items in selected gorup.
 */
export const groupEntriesSelector = selector<YakpKdbxItem[]>({
  key: 'groupEntriesSelector',
  get: ({ get }) => {
    const groupSid = get(selectGroupAtom);
    if (!groupSid) return [];

    const selectedGroup = groupSid === allItemsGroupSid ? allItemsGroup : get(yakpKdbxItemAtom(groupSid));

    const filter = (item: YakpKdbxItem) => {
      return (
        ((!item.isGroup || selectedGroup.isRecycleBin) && item.parentSid === groupSid) ||
        (selectedGroup.isAllItemsGroup && !item.isRecycled && !item.isGroup) ||
        (selectedGroup.isRecycleBin && item.isRecycled)
      );
    };

    return get(allItemSelector).filter(filter);
  },
});

/**
 * Selector to get all available tags
 */
export const allTagSelector = selector<string[]>({
  key: 'allTagSelector',
  get: ({ get }) => {
    let tags: string[] = [];
    tags = get(allItemSelector)
      .map((i) => tags.concat(i.tags))
      .flat();
    return [...new Set(tags)].sort();
  },
});

/**
 * Atom to store the state of selected filters
 */
export const tagFilterAtom = atom<string[]>({
  key: 'tagFilterAtom',
  default: [],
});

/**
 * Atom to store the state of selected colors
 */
export const colorFilterAtom = atom<{ color: string }>({
  key: 'colorFilterAtom',
  default: { color: '' },
});

/**
 * Atom to store the state of query string
 */
export const searchFilterAtom = atom<string>({
  key: 'searchFilter',
  default: '',
});

/**
 * Atom to store the sort order state
 */
export const sortEntriesAtom = atom<ISortMenuItem>({
  key: 'top/sortMenu',
  default: sortMenuItems[0],
});

/**
 * Selector to filter items according to all available filters and sort them
 */
export const filteredIdsSelector = selector<string[]>({
  key: 'filteredIdsSelector',
  get: ({ get }) => {
    const filterQuery = (item: YakpKdbxItem, query: string): boolean => {
      const normalizedQuery = query.toLocaleLowerCase();
      return (
        !!Object.keys(item.fields).find((i) =>
          item.fields[i] instanceof ProtectedValue
            ? (item.fields[i] as ProtectedValue).getText().toLocaleLowerCase().includes(normalizedQuery)
            : (item.fields[i] as string).toLocaleLowerCase().includes(normalizedQuery)
        ) || !!item.tags.find((t) => t.toLocaleLowerCase().includes(normalizedQuery))
      );
    };

    const colorFilter = get(colorFilterAtom);
    const tagFilter = get(tagFilterAtom);
    const searchFilter = get(searchFilterAtom);
    const sortField = get(sortEntriesAtom);
    let filtered = get(groupEntriesSelector);

    if (colorFilter.color) filtered = filtered.filter((e) => e.bgColor === colorFilter.color);
    if (tagFilter.length > 0) filtered = filtered.filter((e) => e.tags.filter((t) => tagFilter.includes(t)).length > 0);
    if (searchFilter) filtered = filtered.filter((e) => filterQuery(e, searchFilter));
    filtered = filtered.slice().sort(sortField.compare);

    return filtered.map((i) => i.sid);
  },
});
