/* eslint-disable no-return-assign */
import { Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { ItemHelper } from 'main/entity/ItemHelper';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { FC } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { DefaultKeeIcon } from 'renderer/entity/DefaultKeeIcon';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import {
  selectorAllItems,
  selectorSelectedItem,
  selectorYakpItem,
  atomAllItemIds,
  atomMetadata,
  closeItemContextMenu,
  groupContextMenuAtom,
} from '../../state';
import { SvgPath } from '../common/SvgPath';

interface ISiblings {
  prev: YakpKdbxItem | undefined;
  next: YakpKdbxItem | undefined;
}

export const GroupContextMenu: FC = () => {
  // Global state
  //
  const [contextMenu, setContextMenuState] = useRecoilState(groupContextMenuAtom);
  const setNewItem = useRecoilCallback(({ set, snapshot }) => (newItem: YakpKdbxItem) => {
    if (newItem.isGroup) {
      const siblingsOrder = snapshot
        .getLoadable(selectorAllItems)
        .valueMaybe()
        ?.filter((i) => i.parentSid === newItem.parentSid && i.isGroup)
        .map((i) => i.groupSortOrder) || [0];
      const index = Math.min(...siblingsOrder);
      newItem.groupSortOrder = index - 1;
    }
    set(atomAllItemIds, (cur) => cur.concat(newItem.sid));
    set(selectorYakpItem(newItem.sid), newItem);
    set(selectorSelectedItem, newItem.sid);
  });
  const meta = useRecoilValue(atomMetadata);
  const setItemDelete = useRecoilCallback(({ set, snapshot }) => (deleted: YakpKdbxItem) => {
    if (!meta?.isRecycleBinAvailable) return;
    const allItems = snapshot.getLoadable(selectorAllItems).valueMaybe();
    const setChildDeleted = (parent: YakpKdbxItem) => {
      allItems
        ?.filter((i) => i.parentSid === parent.sid)
        .forEach((i) => {
          set(selectorYakpItem(i.sid), (cur) => ItemHelper.apply(cur, (e) => (e.isRecycled = true)));
          if (i.isGroup) setChildDeleted(i);
        });
    };
    set(selectorSelectedItem, deleted.parentSid);
    set(
      selectorYakpItem(deleted.sid),
      ItemHelper.apply(deleted, (e) => {
        e.parentSid = meta.recycleBinSid;
        e.isRecycled = true;
      })
    );
    setChildDeleted(deleted);
  });

  const getSiblings = useRecoilCallback(({ snapshot }) => (group: YakpKdbxItem) => {
    const getSibling = (items: YakpKdbxItem[] | undefined, grp: YakpKdbxItem, isUp: boolean) =>
      items?.find((i) => i.groupSortOrder === (isUp ? grp.groupSortOrder - 1 : grp.groupSortOrder + 1));

    const parent = snapshot.getLoadable(selectorYakpItem(group.parentSid || '')).valueMaybe();
    if (!parent) return {} as ISiblings;
    const allSiblings = snapshot
      .getLoadable(selectorAllItems)
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
    const groupCopy = ItemHelper.apply(group, (g) => (g.groupSortOrder = sibling.groupSortOrder));
    const siblingCopy = ItemHelper.apply(sibling, (g) => (g.groupSortOrder = groupOrder));
    set(selectorYakpItem(groupCopy.sid), groupCopy);
    set(selectorYakpItem(siblingCopy.sid), siblingCopy);
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
