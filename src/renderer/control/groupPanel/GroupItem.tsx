import { styled, ListItemText, IconButton } from '@mui/material';
import React, { FC } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { format } from 'date-fns';
import { groupContextMenuAtom, openItemContextMenu } from '../../state/panelStateAtom';
import { DefaultKeeIcon } from '../../entity/DefaultKeeIcon';
import { SystemIcon } from '../../entity/SystemIcon';
import { groupStatSelector, selectItemSelector, yakpKdbxItemAtom } from '../../state/atom';
import {} from '../../../main/entity/YakpKbdxItemExtention';
import { LightTooltip } from '../common/LightToolTip';
import { SvgPath } from '../common/SvgPath';
import { GroupItemStyle } from './GroupItemStyle';
import { GroupIconStyle } from './GroupIconStyle';
import { PrimaryTextStyle } from './PrimaryTextStyle';
import { SecondaryText } from './SecondaryText';

const SmallIcon = styled(SvgPath)(({ theme }) => ({
  width: theme.spacing(1),
  height: theme.spacing(1),
  marginRight: theme.spacing(1 / 2),
}));

const ContextMenuIcon = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey.A100,
  justifyContent: 'center',
}));

const ContextMenu = styled('div')(() => ({
  display: 'none',
}));

const ChangedMark = styled('div')(() => ({
  position: 'absolute',
  marginTop: '-20px',
  marginLeft: '-5px',
  height: '10px',
  width: '10px',
  backgroundColor: '#f35b04',
  borderRadius: '50%',
  display: 'block',
}));

interface IProps {
  itemSid: string;
  nestLevel: number;
  // eslint-disable-next-line react/require-default-props
  isContextMenuDisabled?: boolean;
}

export const GroupItemRaw: FC<IProps> = ({ itemSid, nestLevel, isContextMenuDisabled = false }) => {
  const item = useRecoilValue(yakpKdbxItemAtom(itemSid));
  const setSelection = useSetRecoilState(selectItemSelector);
  const setContextMenu = useSetRecoilState(groupContextMenuAtom);
  /*
  const setTreeState = useSetRecoilState(itemIdsUpdateSelector);
  const getDropped = useRecoilCallback(({snapshot}) => (uuid: string) => {
    return snapshot.getLoadable(itemStateAtom(uuid)).valueMaybe()
  })
*/
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    // const entryId = event.dataTransfer.getData('text');
    event.dataTransfer.clearData();
    // const droppedItem = getDropped(entryId);
    // setTreeState(droppedItem?.moveItem(entryUuid));
  };

  const groupStat = useRecoilValue(groupStatSelector(itemSid));

  const showTotalEntries = () => {
    return (
      <>
        <SmallIcon path={DefaultKeeIcon.key} />
        {groupStat.totalEntries}
      </>
    );
  };

  const showCloseEpire = () => {
    if (!groupStat.closeExpired) return null;
    return (
      <>
        <SmallIcon path={SystemIcon.expire} />
        {format(groupStat.closeExpired, 'dd MMM yyyy')}
      </>
    );
  };

  const showLastModified = () => {
    if (!groupStat.lastChanged) return null;
    return (
      <>
        <SmallIcon path={SystemIcon.save} />
        {format(groupStat.lastChanged, 'dd MMM yyyy')}
      </>
    );
  };

  return (
    <LightTooltip title={item.fields.Notes || ''} arrow disableInteractive>
      <GroupItemStyle
        nestLevel={nestLevel}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.focus();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.blur();
        }}
        onMouseLeave={(e) => {
          e.preventDefault();
          e.currentTarget.blur();
        }}
        selected={item.isSelected}
        onClick={() => setSelection(item.sid)}
      >
        <GroupIconStyle>
          <SvgPath path={item.isAllItemsGroup ? SystemIcon.allItems : DefaultKeeIcon.get(item.defaultIconId)} />
        </GroupIconStyle>

        {item.isChanged && <ChangedMark />}
        <ListItemText
          draggable={!item.isDefaultGroup && !item.isRecycleBin}
          onDragStart={(e) => {
            e.dataTransfer.setData('text', itemSid);
            e.stopPropagation();
          }}
          onDrop={handleDrop}
          primary={<PrimaryTextStyle>{item.title}</PrimaryTextStyle>}
          secondary={
            <SecondaryText>
              {groupStat.totalEntries > 0 && (
                <>
                  {showTotalEntries()}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {item.isAllItemsGroup ? showLastModified() : showCloseEpire()}
                </>
              )}
            </SecondaryText>
          }
        />
        {!isContextMenuDisabled && (
          <ContextMenu id="contextMenuButton">
            <ContextMenuIcon onClick={(e) => setContextMenu(openItemContextMenu(e.currentTarget, item))}>
              <SvgPath path={SystemIcon.dot_hamburger} />
            </ContextMenuIcon>
          </ContextMenu>
        )}
      </GroupItemStyle>
    </LightTooltip>
  );
};

export const GroupItem = React.memo(GroupItemRaw);
