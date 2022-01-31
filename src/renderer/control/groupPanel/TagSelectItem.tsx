import { Checkbox, ListItemText, Menu, MenuItem, styled } from '@mui/material';
import { FC, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { DefaultColors } from 'renderer/entity/DefaultColors';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { allTagSelector, tagFilterAtom } from 'renderer/state/FilterAtom';
import { SvgPath } from '../common/SvgPath';
import { GroupIconStyle } from './GroupIconStyle';
import { GroupItemStyle } from './GroupItemStyle';
import { PrimaryTextStyle } from './PrimaryTextStyle';
import { SecondaryText } from './SecondaryText';

const MenuStyle = styled(Menu)(() => ({
  '.MuiMenu-paper': {
    maxHeight: 200,
    width: 250,
  },
}));

export const TagSelectListItem: FC = () => {
  // global state
  //
  const [tagFilter, setTagFilter] = useRecoilState(tagFilterAtom);
  const tags = useRecoilValue(allTagSelector);

  // local state
  //
  const [isShowTagSelection, setShowTagSelection] = useState(false);
  const [isShowClear, setShowClearButton] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<Element | null>(null);

  // event handlers
  //
  const handleClearTags = (event: React.MouseEvent) => {
    setTagFilter([]);
    event.stopPropagation();
  };

  const handleAddTag = (tag: string) => {
    const filterTags = tagFilter.includes(tag) ? tagFilter.filter((t) => t !== tag) : tagFilter.concat(tag);
    setTagFilter([...filterTags]);
  };

  const toggleTagMenu = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLDivElement).blur();
    setMenuAnchor(e.currentTarget);
    setShowTagSelection(!isShowTagSelection);
    setShowClearButton(false);
  };

  return (
    <GroupItemStyle
      nestLevel={0}
      disabled={!tags || tags.length === 0}
      onClick={(e) => toggleTagMenu(e)}
      onMouseEnter={() => tagFilter.length > 0 && setShowClearButton(true)}
      onMouseLeave={() => setShowClearButton(false)}
      ref={(element) => setMenuAnchor(element)}
    >
      <GroupIconStyle>
        <SvgPath path={SystemIcon.tag} style={{ color: tagFilter.length > 0 ? DefaultColors.green : '' }} />
      </GroupIconStyle>
      <ListItemText
        primary={<PrimaryTextStyle>Tags</PrimaryTextStyle>}
        secondary={<SecondaryText>{tagFilter.join(', ')}</SecondaryText>}
      />
      <div hidden={!isShowClear}>
        <GroupIconStyle onClick={(e) => handleClearTags(e)}>
          <SvgPath path={SystemIcon.clear} />
        </GroupIconStyle>
      </div>
      <MenuStyle
        open={isShowTagSelection}
        anchorEl={menuAnchor}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        onClose={() => setShowTagSelection(false)}
      >
        {tags.map((tag) => (
          <MenuItem onClick={() => handleAddTag(tag)} key={tag} value={tag}>
            <Checkbox checked={tagFilter.includes(tag)} />
            {tag}
          </MenuItem>
        ))}
      </MenuStyle>
    </GroupItemStyle>
  );
};
