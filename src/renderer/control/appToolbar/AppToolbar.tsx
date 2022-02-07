/* eslint-disable no-return-assign */
import { AppBar, IconButton, styled, Toolbar, Tooltip, Typography } from '@mui/material';
import { FC, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { SystemCommand } from '../../../main/IpcCommunication/IpcDispatcher';
import { allItemSelector, isDbSavedSelector, yakpCustomIconsAtom, yakpMetadataAtom } from '../../state/atom';
import {
  closePanel,
  ConfirmationChoice,
  confirmationDialogAtom,
  notificationAtom,
  openPanel,
  toolSortMenuAtom,
} from '../../state/panelStateAtom';
import { consts } from '../../entity/consts';
import { SystemIcon } from '../../entity/SystemIcon';
import { Spinner } from '../common/Spinner';
import { SvgPath } from '../common/SvgPath';
import { SearchBox } from './SearchBox';
import { SortMenu } from './SortMenu';
import { ConfirmationDialog } from './ConfirmationDialog';
import { IpcMainSaveChanges } from '../../../main/IpcCommunication/IpcExtention';
import { YakpItemChanges } from '../../../main/entity/YakpItemChanges';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  WebkitAppRegion: 'drag',
  minHeight: `${consts.topBarHeight}px`,
  backgroundColor: theme.palette.primary.dark,
}));

const Resizer = styled('div')(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  WebkitAppRegion: 'no-drag',
}));

const ButtonIcon = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isDisabled',
})<{ isDisabled?: boolean }>(({ theme, isDisabled }) => ({
  ...(!isDisabled && {
    WebkitAppRegion: 'no-drag',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  }),
  height: `${consts.topBarHeight}px`,
  width: `${consts.topBarHeight + 10}px`,
  borderRadius: 0,
  display: 'flex',
  ...(isDisabled && { color: theme.palette.grey[500] }),
}));

const ButtonCloseIcon = styled(ButtonIcon)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.error.main, // '#D70012',
  },
}));

const Space = styled('span')(({ theme }) => ({
  width: theme.spacing(3),
}));

const Asterisk = styled('div')(() => ({
  width: '15px',
}));

const DbName = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey.A100,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1 / 4),
}));

export const AppToolbar: FC = () => {
  const location = useLocation();
  const meta = useRecoilValue(yakpMetadataAtom);
  const [isDbChanged, setDbSaved] = useRecoilState(isDbSavedSelector);
  const setSortMenu = useSetRecoilState(toolSortMenuAtom);
  const setConfirmationState = useSetRecoilState(confirmationDialogAtom);
  const setNotification = useSetRecoilState(notificationAtom);

  const allIcons = useRecoilValue(yakpCustomIconsAtom);
  const allItems = useRecoilValue(allItemSelector);

  const resolver = useRef<{ resolve: (choice: ConfirmationChoice) => void }>();

  const [isMaximized, setMaximized] = useState(false);
  const [isSaving, setLoader] = useState(false);

  const handleSystemCommand = (command: SystemCommand) => {
    window.electron.ipcRenderer.systemCommand(command);
    if (command === 'maximize') setMaximized(true);
    else setMaximized(false);
  };

  const handleBackClick = () => {
    // eslint-disable-next-line no-restricted-globals
    history.back();
  };

  const handleSave = async () => {
    setLoader(true);
    // await currentContext().SaveContext();
    const changes = new YakpItemChanges();
    changes.Icons = allIcons;
    changes.Items = allItems;
    const saveResult = await IpcMainSaveChanges(changes);
    setNotification(`DB save is ${saveResult ? 'successful' : 'unsuccessful'}`);
    setDbSaved(true);
    setLoader(false);
  };

  const confirmAction = async (action: () => void) => {
    let userChoice: ConfirmationChoice = 'ignore';
    if (isDbChanged) {
      setConfirmationState({ ...closePanel, isShowPanel: true });
      userChoice = await new Promise((resolve) => (resolver.current = { resolve }));
    }

    switch (userChoice) {
      case 'save':
        await handleSave();
        action();
        break;
      case 'ignore':
        action();
        break;
      case 'cancel':
      default:
    }
  };

  return (
    <AppBar position="absolute">
      <StyledToolbar variant="dense" disableGutters>
        <Resizer />
        {location.pathname !== '/' && (
          <>
            <DbName> {`/// ${meta?.kdbxFileShort}`}</DbName>
            <Asterisk>{isDbChanged && <Typography variant="h5">*</Typography>}</Asterisk>
            {!isSaving ? (
              <Tooltip title={`Save ${meta?.kdbxFileShort}`}>
                <ButtonIcon color="inherit" isDisabled={!isDbChanged} onClick={handleSave}>
                  <SvgPath size={20} path={SystemIcon.save} />
                </ButtonIcon>
              </Tooltip>
            ) : (
              <Spinner size={20} />
            )}

            <Tooltip title="Open another file">
              <ButtonIcon color="inherit" onClick={() => confirmAction(handleBackClick)}>
                <SvgPath size={20} path={SystemIcon.openFile} />
              </ButtonIcon>
            </Tooltip>
            <div style={{ marginLeft: 'auto' }}>
              <SearchBox />
            </div>
            <Tooltip title="Sort">
              <ButtonIcon color="inherit" onClick={(e) => setSortMenu(openPanel(e.currentTarget))}>
                <SvgPath size={20} path={SystemIcon.sort} />
              </ButtonIcon>
            </Tooltip>
          </>
        )}
        <SortMenu />
        <Tooltip title="Settings">
          <ButtonIcon sx={{ marginLeft: 'auto' }} color="inherit" onClick={() => {}}>
            <SvgPath size={20} path={SystemIcon.settings} />
          </ButtonIcon>
        </Tooltip>
        <Space />
        <ButtonIcon color="inherit" onClick={() => handleSystemCommand('minimize')}>
          <SvgPath size={15} path={SystemIcon.minimizeThin} />
        </ButtonIcon>
        <ButtonIcon color="inherit" onClick={() => handleSystemCommand(isMaximized ? 'restore' : 'maximize')}>
          {isMaximized ? (
            <SvgPath size={15} path={SystemIcon.restoreThin} />
          ) : (
            <SvgPath size={15} path={SystemIcon.maximizeThin} />
          )}
        </ButtonIcon>
        <ButtonCloseIcon color="inherit" onClick={() => confirmAction(() => handleSystemCommand('exit'))}>
          <SvgPath size={15} path={SystemIcon.xMarkThin} />
        </ButtonCloseIcon>
      </StyledToolbar>
      <ConfirmationDialog resolver={resolver} />
    </AppBar>
  );
};
