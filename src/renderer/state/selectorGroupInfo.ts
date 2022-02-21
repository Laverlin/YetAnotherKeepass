import { selectorFamily } from 'recoil';
import { YakpKdbxItem } from '../../main/entity/YakpKdbxItem';
import { GroupStatistic } from '../entity/GroupStatistic';
import { selectorAllItems, selectorYakpItem } from './atomYakpItem';

export const selectorGroupInfo = selectorFamily<GroupStatistic, string>({
  key: 'selectorGroupInfo',
  get:
    (sid) =>
    ({ get }) => {
      const group = get(selectorYakpItem(sid));

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
      return get(selectorAllItems).reduce(reducer, new GroupStatistic());
    },
});
