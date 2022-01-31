import { List, styled } from '@mui/material';
import { allItemsGroupSid } from 'main/entity/YakpKdbxItem';
import { FC, ReactFragment } from 'react';
import { useRecoilValue } from 'recoil';
import { allItemSelector, yakpMetadataAtom } from '../../state/atom';
import { ColorSelectItem } from './ColorSelectItem';
import { GroupItem } from './GroupItem';
import { TagSelectListItem } from './TagSelectItem';

const OptionList = styled('div')(({ theme }) => ({
  overflow: 'hidden',
  position: 'absolute',
  paddingTop: theme.spacing(1),
  top: 0,
  left: 0,
  right: 0,
  height: theme.spacing(6 * 3 + 2),
  borderBottomWidth: '1px',
  borderBottomColor: theme.palette.grey.A100,
  borderBottomStyle: 'solid',
}));

const divOverlayY = styled('div')`
  overflow: hidden;
  overflow-y: overlay;
`;
const MainList = styled(divOverlayY, {
  shouldForwardProp: (prop) => prop !== 'isWithRecycle',
})<{ isWithRecycle: boolean }>(({ theme, isWithRecycle }) => ({
  position: 'absolute',
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  bottom: isWithRecycle ? theme.spacing(8) : 0,
  top: theme.spacing(6 * 3 + 2),
  left: 0,
  right: 0,
}));

const RecycleBinItem = styled('div')(({ theme }) => ({
  overflow: 'hidden',
  position: 'absolute',
  paddingTop: theme.spacing(1),
  bottom: 0,
  height: theme.spacing(8),
  right: 0,
  left: 0,
  borderTopWidth: '1px',
  borderTopColor: theme.palette.grey.A100,
  borderTopStyle: 'solid',
}));

export const GroupPanel: FC = () => {
  const items = useRecoilValue(allItemSelector);
  const metadata = useRecoilValue(yakpMetadataAtom);
  if (!metadata) throw new Error('Metadata are not available, possible db open error');

  const renderChildGroups = (groupSid: string, nestLevel = 0): ReactFragment => {
    return (
      <div key={groupSid}>
        <GroupItem itemSid={groupSid} nestLevel={nestLevel} />
        {items
          .filter((e) => e.isGroup && e.parentSid && e.parentSid === groupSid && !e.isRecycleBin)
          .sort((a, b) => a.groupSortOrder - b.groupSortOrder)
          .map((childGroup) => renderChildGroups(childGroup.sid, nestLevel + 1))}
      </div>
    );
  };

  return (
    <>
      <OptionList>
        <List disablePadding>
          <GroupItem itemSid={allItemsGroupSid} nestLevel={0} isContextMenuDisabled />
          <ColorSelectItem />
          <TagSelectListItem />
        </List>
      </OptionList>

      <MainList isWithRecycle={!!metadata?.recycleBinSid}>{renderChildGroups(metadata.defaultGroupSid)}</MainList>

      {!!metadata?.recycleBinSid && (
        <RecycleBinItem>
          <GroupItem itemSid={metadata.recycleBinSid} nestLevel={1} isContextMenuDisabled />
        </RecycleBinItem>
      )}
    </>
  );
};
