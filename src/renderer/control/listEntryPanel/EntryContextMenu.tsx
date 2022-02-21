/* eslint-disable no-return-assign */
import { Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { ItemHelper } from 'main/entity/ItemHelper';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import React, { FC } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { DefaultKeeIcon } from '../../entity/DefaultKeeIcon';
import { displayFieldName } from '../../entity/DisplayFieldName';
import { SystemIcon } from '../../entity/SystemIcon';
import {
  closeItemContextMenu,
  entryContextMenuAtom,
  notificationAtom,
  selectorYakpItem,
  atomMetadata,
} from '../../state';
import { SvgPath } from '../common/SvgPath';

export const EntryContextMenu: FC = () => {
  const [contextMenuState, setContextMenuState] = useRecoilState(entryContextMenuAtom);
  const setNotification = useSetRecoilState(notificationAtom);
  const setEntry = useSetRecoilState(selectorYakpItem(contextMenuState.entry?.sid || ''));
  const metadata = useRecoilValue(atomMetadata);

  const handleCopy = (fieldName: string, event: React.MouseEvent<Element, MouseEvent>): void => {
    event.stopPropagation();
    if (!contextMenuState.entry) return;
    setContextMenuState(closeItemContextMenu);
    navigator.clipboard.writeText(ItemHelper.stripProtection(contextMenuState.entry.fields[fieldName]));
    setNotification(`${displayFieldName(fieldName)} is copied`);
  };

  const handleDeleteEntry = () => {
    if (!contextMenuState.entry || !metadata?.isRecycleBinAvailable) return;
    setContextMenuState(closeItemContextMenu);
    setEntry(
      ItemHelper.apply(contextMenuState.entry, (e) => {
        e.parentSid = metadata.recycleBinSid;
        e.isRecycled = true;
      })
    );
  };

  const handleOpenUrl = (entry: YakpKdbxItem) => {
    setContextMenuState(closeItemContextMenu);
    window.electron.ipcRenderer.systemCommand('openUrl', entry.fields.URL.toString());
  };

  const { entry } = contextMenuState;
  if (!entry) return null;

  return (
    <Menu
      keepMounted
      open={contextMenuState.isShowPanel}
      onClose={() => setContextMenuState(closeItemContextMenu)}
      anchorEl={contextMenuState.panelAnchor}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {!entry.isGroup && (
        <MenuItem key="copyPwd" disabled={!entry.hasPassword} onClick={(event) => handleCopy('Password', event)}>
          <ListItemIcon>
            <SvgPath path={DefaultKeeIcon.key} />
          </ListItemIcon>
          Copy Password
        </MenuItem>
      )}
      {!entry.isGroup && (
        <MenuItem
          key="copyUserName"
          disabled={!entry.fields.UserName}
          onClick={(event) => handleCopy('UserName', event)}
        >
          <ListItemIcon>
            <SvgPath path={SystemIcon.user} />
          </ListItemIcon>
          Copy User Name
        </MenuItem>
      )}
      {!entry.isGroup && (
        <MenuItem key="copyUrl" disabled={!entry.fields.URL} onClick={(event) => handleCopy('URL', event)}>
          <ListItemIcon>
            <SvgPath path={DefaultKeeIcon.link} />
          </ListItemIcon>
          Copy Url
        </MenuItem>
      )}
      {!entry.isGroup && <Divider />}
      <MenuItem key="goUrl" onClick={() => handleOpenUrl(entry)} disabled={!entry.fields.URL}>
        <ListItemIcon>
          <SvgPath path={DefaultKeeIcon.bolt} />
        </ListItemIcon>
        Open Url
      </MenuItem>
      <MenuItem key="autotype" onClick={() => setContextMenuState(closeItemContextMenu)} disabled>
        <ListItemIcon>
          <SvgPath path={DefaultKeeIcon.terminal} />
        </ListItemIcon>
        Auto-Type
      </MenuItem>
      <Divider />
      <MenuItem key="delete" onClick={() => handleDeleteEntry()} disabled={entry.isRecycled}>
        <ListItemIcon>
          <SvgPath path={DefaultKeeIcon.trash} />
        </ListItemIcon>
        Delete Entry
      </MenuItem>
    </Menu>
  );
};
