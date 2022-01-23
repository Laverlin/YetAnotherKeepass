import { AppBar, IconButton, styled, Toolbar, Tooltip } from '@mui/material';
import { SystemCommand } from 'main/IpcCommunication/IpcDispatcher';
import { FC, useState } from 'react';
import { consts } from '../../entity/consts';
import { SystemIcon } from '../../entity/SystemIcon';
import { SvgPath } from '../common/SvgPath';

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

const ButtonIcon = styled(IconButton)(({ theme }) => ({
  WebkitAppRegion: 'no-drag',
  height: `${consts.topBarHeight}px`,
  width: `${consts.topBarHeight + 10}px`,
  borderRadius: 0,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  display: 'flex',
}));

const ButtonCloseIcon = styled(ButtonIcon)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.error.main, // '#D70012',
  },
}));

const Space = styled('span')(({ theme }) => ({
  width: theme.spacing(3),
}));

export const AppToolbar: FC = () => {
  const [isMaximized, setMaximized] = useState(false);

  const handleSystemCommand = (command: SystemCommand) => {
    window.electron.ipcRenderer.systemCommand(command);
    if (command === 'maximize') setMaximized(true);
    else setMaximized(false);
  };

  return (
    <AppBar position="absolute">
      <StyledToolbar variant="dense" disableGutters>
        <Resizer />

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
        <ButtonCloseIcon color="inherit" onClick={() => handleSystemCommand('exit')}>
          <SvgPath size={15} path={SystemIcon.xMarkThin} />
        </ButtonCloseIcon>
      </StyledToolbar>
    </AppBar>
  );
};
