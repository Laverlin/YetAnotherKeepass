import { darken, IconButton, styled } from '@mui/material';
import { ProtectedValue } from 'kdbxweb';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import React, { FC } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { DefaultKeeIcon } from 'renderer/entity/DefaultKeeIcon';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { selectItemSelector, yakpCustomIconSelector, yakpKdbxItemAtom } from 'renderer/state/atom';
import { notificationAtom } from 'renderer/state/panelStateAtom';
import { LightTooltip } from '../common/LightToolTip';
import { SvgPath } from '../common/SvgPath';

const ListEntry = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected: boolean }>(({ isSelected, theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  height: theme.spacing(9 + 1 / 2),
  borderBottom: '1px dotted lightgray',
  '&:hover': {
    backgroundColor: theme.palette.background.default,
    '& #contextMenuButton': {
      visibility: 'visible',
    },
  },
  ...(isSelected && {
    backgroundColor: darken(theme.palette.background.default, 0.03),
    '&:hover': {
      backgroundColor: darken(theme.palette.background.default, 0.03),
    },
    '& #contextMenuButton': {
      visibility: 'visible',
    },
  }),
}));

const ChangeMark = styled('div')(() => ({
  position: 'absolute',
  margin: '10px',
  height: '10px',
  width: '10px',
  backgroundColor: '#f35b04',
  borderRadius: '50%',
  display: 'block',
}));

const MainIcon = styled('div', {
  shouldForwardProp: (prop) => prop !== 'hasPassword',
})<{ hasPassword: boolean }>(({ hasPassword }) => ({
  width: 50,
  height: 50,
  margin: 16,
  display: 'flex',
  cursor: hasPassword ? 'pointer' : 'default',
}));

const MainIconCustom = styled('img')(() => ({
  marginLeft: 'auto',
  width: 28,
  height: 28,
}));

const MainIconDefault = styled(SvgPath)(() => ({
  marginLeft: 'auto',
  width: 28,
  height: 28,
}));

const ItemContent = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minWidth: 0,
}));

const ItemContentRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  minWidth: 0,
  paddingRight: theme.spacing(1),
}));

const Title = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isExpired' && prop !== 'isGroup',
})<{ isExpired: boolean; isGroup: boolean }>(({ isExpired, isGroup, theme }) => ({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  fontFamily: theme.typography.subtitle1.fontFamily,
  fontWeight: isGroup ? 'bold' : theme.typography.subtitle1.fontWeight,
  fontSize: theme.typography.subtitle1.fontSize,
  lineHeight: theme.typography.subtitle1.lineHeight,
  letterSpacing: theme.typography.subtitle1.letterSpacing,
  textDecoration: isExpired ? 'line-through' : 'none',
}));

const SubTitle = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isExpired' && prop !== 'isAlignRight',
})<{ isExpired?: boolean; isAlignRight?: boolean }>(({ isExpired, isAlignRight, theme }) => ({
  color: isExpired ? theme.palette.error.main : theme.palette.text.secondary,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  fontFamily: theme.typography.caption.fontFamily,
  fontWeight: theme.typography.caption.fontWeight,
  fontSize: theme.typography.caption.fontSize,
  lineHeight: theme.typography.caption.lineHeight,
  letterSpacing: theme.typography.caption.letterSpacing,
  marginLeft: isAlignRight ? 'auto' : '2px',
  display: 'inline-block',
}));

const LastRow = styled(SubTitle)(() => ({
  color: '#CCCCCC',
  marginRight: 30,
}));

const InlineIcon = styled(SvgPath, {
  shouldForwardProp: (prop) => prop !== 'isCopyAllowed',
})<{ isCopyAllowed?: boolean }>(({ isCopyAllowed, theme }) => ({
  width: '16px',
  height: '16px',
  paddingRight: theme.spacing(1),
  cursor: isCopyAllowed ? 'pointer' : 'default',
  paddingTop: '7px',
}));

const AtachIcon = styled('div')(() => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  marginRight: 44,
  color: 'gray',
}));

const ContextMenuButton = styled('div')(() => ({
  visibility: 'hidden',
  display: 'flex',
  justifyContent: 'middle',
}));

const ContextMenuIcon = styled(IconButton)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const isExpired = (item: YakpKdbxItem): boolean => {
  return item.isExpires && (item.expiryTime?.valueOf() || 0) < Date.now();
};

interface IProps {
  entrySid: string;
}

export const EntryItemRaw: FC<IProps> = ({ entrySid }) => {
  const setSelection = useSetRecoilState(selectItemSelector);
  //  const setContextMenuState = useSetRecoilState(entryContextMenuAtom);
  const setNotification = useSetRecoilState(notificationAtom);
  const entry = useRecoilValue(yakpKdbxItemAtom(entrySid));
  const customIcon = useRecoilValue(yakpCustomIconSelector(entry.customIconSid || ''));

  const handleCopy = (fieldName: string) => {
    const value = entry.fields[fieldName];
    const normalizedValue = value instanceof ProtectedValue ? value.getText() : value;
    if (normalizedValue) {
      navigator.clipboard.writeText(normalizedValue);
      setNotification(`${fieldName} is copied`);
    } else {
      setNotification(`Nothing to copy`);
    }
  };

  return (
    <LightTooltip title={entry.fields.Notes || ''} arrow disableInteractive>
      <ListEntry
        isSelected={entry.isSelected}
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text', entry.sid)}
        onClick={() => setSelection(entry.sid)}
      >
        <div style={{ width: '8px', background: entry.bgColor }} />
        {entry.isChanged && <ChangeMark />}
        <MainIcon onDoubleClick={() => entry.hasPassword && handleCopy('Password')} hasPassword={entry.hasPassword}>
          {entry.customIconSid ? (
            <MainIconCustom src={customIcon?.b64image} />
          ) : (
            <MainIconDefault path={DefaultKeeIcon.get(entry.defaultIconId)} />
          )}
        </MainIcon>

        <ItemContent>
          <ItemContentRow>
            <Title isExpired={isExpired(entry)} isGroup={entry.isGroup}>
              {entry.title}
            </Title>
            {entry.isExpires && (
              <SubTitle isExpired={isExpired(entry)} isAlignRight>
                <InlineIcon path={SystemIcon.expire} />
                {entry.expiryTime?.toDateString()}
              </SubTitle>
            )}
          </ItemContentRow>
          <ItemContentRow>
            <SubTitle>
              {!entry.isGroup && entry.fields.UserName && (
                <>
                  <InlineIcon isCopyAllowed path={SystemIcon.user} onDoubleClick={() => handleCopy('UserName')} />
                  {entry.fields.UserName}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                </>
              )}
              {!entry.isGroup && entry.fields.URL && (
                <>
                  <InlineIcon isCopyAllowed path={DefaultKeeIcon.link} onDoubleClick={() => handleCopy('URL')} />
                  {!entry.isGroup && entry.fields.URL}
                </>
              )}
            </SubTitle>
          </ItemContentRow>

          <LastRow>
            {entry.tags.length > 0 && (
              <>
                <InlineIcon path={SystemIcon.tag} />
                {entry.tags.join(', ')}
              </>
            )}
          </LastRow>
        </ItemContent>

        <AtachIcon>{!entry.isGroup && entry.binaries.length > 0 && <SvgPath path={SystemIcon.attachFile} />}</AtachIcon>
        <ContextMenuButton id="contextMenuButton">
          <ContextMenuIcon>
            <SvgPath path={SystemIcon.dot_hamburger} />
          </ContextMenuIcon>
        </ContextMenuButton>
      </ListEntry>
    </LightTooltip>
  );
};

export const EntryItem = React.memo(EntryItemRaw);
