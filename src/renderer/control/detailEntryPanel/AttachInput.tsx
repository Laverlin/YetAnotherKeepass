/* eslint-disable no-return-assign */
import { Chip, IconButton, styled, Tooltip, Typography } from '@mui/material';
import { ItemHelper } from 'main/entity/ItemHelper';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { IpcMainAddAttechments } from 'main/IpcCommunication/IpcExtention';
import { FC } from 'react';
import { useSetRecoilState } from 'recoil';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { yakpKdbxItemAtom } from 'renderer/state/atom';
import { SvgPath } from '../common/SvgPath';

const Outlined = styled('div', {
  shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled: boolean }>(({ disabled, theme }) => ({
  width: '100%',
  display: 'flex',
  marginLeft: theme.spacing(1),
  position: 'relative',
  minWidth: 0,
  overflowY: 'visible',
  border: 1,
  borderColor: theme.palette.action.disabled,
  borderStyle: 'solid',
  borderRadius: '4px',
  '&:hover': disabled
    ? {}
    : {
        borderColor: theme.palette.text.primary,
      },
}));

const Caption = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  transform: 'translate(14px, -10px) ',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.default,
}));

const Content = styled('div')(({ theme }) => ({
  width: '100%',
  marginLeft: theme.spacing(1 / 2),
  marginRight: theme.spacing(1 / 2),
  alignItems: 'center',
  display: 'flex',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const Echip = styled(Chip)(() => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  margin: '2px',
}));

const EmptyScreen = styled('div')(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  fontFamily: theme.typography.body1.fontFamily,
  marginLeft: theme.spacing(1),
  color: theme.palette.text.secondary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

interface IProps {
  entry: YakpKdbxItem;
  disabled: boolean;
}

export const AttachInput: FC<IProps> = ({ entry, disabled }) => {
  const setEntryState = useSetRecoilState(yakpKdbxItemAtom(entry.sid));

  const handleAddAttachment = async () => {
    const attachments = await IpcMainAddAttechments(entry.sid);
    if (attachments) setEntryState(ItemHelper.apply(entry, (e) => (e.binaries = e.binaries.concat(attachments))));
  };

  const handleDeleteAttachment = (key: string) => {
    setEntryState(ItemHelper.apply(entry, (e) => (e.binaries = e.binaries.filter((f) => f !== key))));
  };

  const handleSaveAttachment = async (key: string) => {
    window.electron.ipcRenderer.saveAttachment(entry.sid, key);
  };

  return (
    <Outlined disabled={!!disabled}>
      <Caption variant="caption">&nbsp;Attached&nbsp;</Caption>
      <Content>
        {entry.binaries.map((k) => (
          <Tooltip title={k} key={k}>
            <Echip
              variant="outlined"
              size="small"
              label={k}
              onDoubleClick={() => {
                handleSaveAttachment(k);
              }}
              onDelete={
                disabled
                  ? undefined
                  : () => {
                      handleDeleteAttachment(k);
                    }
              }
            />
          </Tooltip>
        ))}
        {entry.binaries.length === 0 && <EmptyScreen>No Attachments</EmptyScreen>}
        <div style={{ marginLeft: 'auto' }}>
          <IconButton disabled={disabled} onClick={handleAddAttachment}>
            <SvgPath path={SystemIcon.attachFile} />
          </IconButton>
        </div>
      </Content>
    </Outlined>
  );
};
