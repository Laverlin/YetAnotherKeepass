import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { ProtectedValue } from 'kdbxweb';
import { ItemHelper } from 'main/entity/ItemHelper';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { FC } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { DefaultKeeIcon } from 'renderer/entity/DefaultKeeIcon';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { selectorYakpItem, closePanel, customPropertyMenuAtom } from 'renderer/state';
import { SvgPath } from '../common/SvgPath';

interface IProp {
  entry: YakpKdbxItem;
}

export const CustomPropertyMenu: FC<IProp> = ({ entry }) => {
  // Global state
  //
  const [menuState, setMenuState] = useRecoilState(customPropertyMenuAtom);
  const setEntryState = useSetRecoilState(selectorYakpItem(entry.sid));

  // Handlers
  //
  const handlePropertyProtection = () => {
    const fieldOriginal = entry.fields[menuState.fieldId];
    const fieldUpdated =
      fieldOriginal instanceof ProtectedValue ? fieldOriginal.getText() : ProtectedValue.fromString(fieldOriginal);
    setEntryState(ItemHelper.setField(entry, menuState.fieldId, fieldUpdated));
    setMenuState({ ...closePanel, isProtected: false, fieldId: '' });
  };

  const handleDeleteProperty = (fieldId: string) => {
    setEntryState(ItemHelper.apply(entry, (e) => delete e.fields[fieldId]));
    setMenuState({ ...closePanel, isProtected: false, fieldId: '' });
  };

  return (
    <Menu
      open={menuState.isShowPanel}
      onClose={() => setMenuState({ isShowPanel: false, panelAnchor: null, isProtected: false, fieldId: '' })}
      anchorEl={menuState.panelAnchor}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem onClick={() => handlePropertyProtection()}>
        <ListItemIcon>
          <SvgPath path={menuState.isProtected ? DefaultKeeIcon['unlock-alt'] : DefaultKeeIcon.lock} />
        </ListItemIcon>
        {menuState.isProtected ? 'Remove Protection' : 'Protect Value'}
      </MenuItem>
      <MenuItem onClick={() => handleDeleteProperty(menuState.fieldId)}>
        <ListItemIcon>
          <SvgPath path={SystemIcon.delete} />
        </ListItemIcon>
        Delete Property
      </MenuItem>
    </Menu>
  );
};
