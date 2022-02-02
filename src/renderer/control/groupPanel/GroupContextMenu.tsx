/* eslint-disable no-return-assign */
import { Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { ItemHelper } from 'main/entity/ItemHelper';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { FC } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { DefaultKeeIcon } from 'renderer/entity/DefaultKeeIcon';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import {
  allItemSelector,
  selectItemSelector,
  yakpKdbxItemAtom,
  yakpKdbxItemAtomIds,
  yakpMetadataAtom,
} from 'renderer/state/atom';
import { closeItemContextMenu, groupContextMenuAtom } from 'renderer/state/panelStateAtom';
import { SvgPath } from '../common/SvgPath';

interface ISiblings {
  prev: YakpKdbxItem | undefined;
  next: YakpKdbxItem | undefined;
}

export const GroupContextMenu: FC = () => {
  // Global state
  //
  const [contextMenu, setContextMenuState] = useRecoilState(groupContextMenuAtom);
  const setNewItem = useRecoilCallback(({ set }) => (newItem: YakpKdbxItem) => {
    set(yakpKdbxItemAtomIds, (cur) => cur.concat(newItem.sid));
    set(yakpKdbxItemAtom(newItem.sid), newItem);
    set(selectItemSelector, newItem.sid);
  });
  const meta = useRecoilValue(yakpMetadataAtom);
  const setItemDelete = useRecoilCallback(({ set, snapshot }) => (deleted: YakpKdbxItem) => {
    const allItems = snapshot.getLoadable(allItemSelector).valueMaybe();
    const setChildDeleted = (parent: YakpKdbxItem) => {
      allItems
        ?.filter((i) => i.parentSid === parent.sid)
        .forEach((i) => {
          set(yakpKdbxItemAtom(i.sid), (cur) => ItemHelper.apply(cur, (e) => (e.isRecycled = true)));
          if (i.isGroup) setChildDeleted(i);
        });
    };
    set(selectItemSelector, deleted.parentSid);
    set(
      yakpKdbxItemAtom(deleted.sid),
      ItemHelper.apply(deleted, (e) => {
        e.parentSid = meta?.recycleBinSid;
        e.isRecycled = true;
      })
    );
    setChildDeleted(deleted);
  });

  const getSiblings = useRecoilCallback(({ snapshot }) => (group: YakpKdbxItem) => {
    const getSibling = (items: YakpKdbxItem[] | undefined, grp: YakpKdbxItem, isUp: boolean) =>
      items?.find((i) => i.groupSortOrder === (isUp ? grp.groupSortOrder - 1 : grp.groupSortOrder + 1));

    const parent = snapshot.getLoadable(yakpKdbxItemAtom(group.parentSid || '')).valueMaybe();
    if (!parent) return {} as ISiblings;
    const allSiblings = snapshot
      .getLoadable(allItemSelector)
      .valueMaybe()
      ?.filter((i) => i.parentSid === parent.sid);
    const prev = getSibling(allSiblings, group, true);
    const next = getSibling(allSiblings, group, false);
    return {
      prev: prev?.isRecycleBin ? getSibling(allSiblings, prev, true) : prev,
      next: next?.isRecycleBin ? getSibling(allSiblings, next, false) : next,
    } as ISiblings;
  });

  const setGroupShift = useRecoilCallback(({ set }) => (group: YakpKdbxItem, sibling: YakpKdbxItem) => {
    const groupOrder = group.groupSortOrder;
    const groupCopy = ItemHelper.clone(group);
    groupCopy.groupSortOrder = sibling.groupSortOrder;
    const siblingCopy = ItemHelper.clone(sibling);
    siblingCopy.groupSortOrder = groupOrder;
    set(yakpKdbxItemAtom(groupCopy.sid), groupCopy);
    set(yakpKdbxItemAtom(siblingCopy.sid), siblingCopy);
    if (group.parentSid) set(yakpKdbxItemAtom(group.parentSid), (cur) => ItemHelper.apply(cur, () => {}));
  });

  const siblings = contextMenu.entry ? getSiblings(contextMenu.entry) : ({} as ISiblings);

  // Handlers
  //
  const handleCreateItem = (isGroup: boolean) => {
    if (!contextMenu.entry) return;
    setContextMenuState(closeItemContextMenu);
    const newItem = ItemHelper.CreateItem(contextMenu.entry?.sid, isGroup, isGroup ? 'New Group' : 'New Entry');
    setNewItem(newItem);
  };

  const changeGroupOrder = (sibling: YakpKdbxItem | undefined) => {
    if (!contextMenu.entry || !sibling) return;
    setContextMenuState(closeItemContextMenu);
    setGroupShift(contextMenu.entry, sibling);
  };

  const handleDeleteGroup = () => {
    if (!contextMenu.entry) return;
    setContextMenuState(closeItemContextMenu);
    setItemDelete(contextMenu.entry);
  };

  return (
    <Menu
      open={contextMenu.isShowPanel}
      onClose={() => setContextMenuState(closeItemContextMenu)}
      anchorEl={contextMenu.panelAnchor}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <MenuItem onClick={() => handleCreateItem(false)}>
        <ListItemIcon>
          <SvgPath path={DefaultKeeIcon.key} />
        </ListItemIcon>
        Create Entry
      </MenuItem>

      <MenuItem onClick={() => handleCreateItem(true)}>
        <ListItemIcon>
          <SvgPath path={DefaultKeeIcon['folder-o']} />
        </ListItemIcon>
        Create Group
      </MenuItem>

      <Divider />

      <MenuItem disabled={!siblings.prev} onClick={() => changeGroupOrder(siblings.prev)}>
        <ListItemIcon>
          <SvgPath path={SystemIcon.cone_up} />
        </ListItemIcon>
        Move Up
      </MenuItem>

      <MenuItem disabled={!siblings.next} onClick={() => changeGroupOrder(siblings.next)}>
        <ListItemIcon>
          <SvgPath path={SystemIcon.cone_down} />
        </ListItemIcon>
        Move Down
      </MenuItem>

      <Divider />

      <MenuItem disabled={contextMenu.entry?.isDefaultGroup} onClick={() => handleDeleteGroup()}>
        <ListItemIcon>
          <SvgPath path={DefaultKeeIcon.trash} />
        </ListItemIcon>
        Delete Group
      </MenuItem>
    </Menu>
  );
};
