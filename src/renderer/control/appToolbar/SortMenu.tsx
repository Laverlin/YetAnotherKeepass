import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { FC } from 'react';
import { useRecoilState } from 'recoil';
import { ISortMenuItem, sortMenuItems } from 'renderer/entity/ISortMenuItem';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { sortEntriesAtom } from 'renderer/state/FilterAtom';
import { closePanel, toolSortMenuAtom } from 'renderer/state/panelStateAtom';
import { SvgPath } from '../common/SvgPath';

export const SortMenu: FC = () => {
  const [sortField, setSortField] = useRecoilState(sortEntriesAtom);
  const [sortMenu, setSortMenu] = useRecoilState(toolSortMenuAtom);

  const handleSort = (field: ISortMenuItem) => {
    setSortField({ ...field });
    setSortMenu(closePanel);
  };

  return (
    <Menu
      keepMounted
      open={sortMenu.isShowPanel}
      onClose={() => setSortMenu(closePanel)}
      anchorEl={sortMenu.panelAnchor}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      {sortMenuItems.map((item) => (
        <MenuItem onClick={() => handleSort(item)} key={item.id}>
          {item.displayName}
          <ListItemIcon sx={{ marginLeft: 'auto' }}>
            {sortField.id === item.id && (
              <SvgPath sx={{ marginLeft: 'auto' }} size={15} path={SystemIcon.sortArrowAsc} />
            )}
          </ListItemIcon>
        </MenuItem>
      ))}
    </Menu>
  );
};
