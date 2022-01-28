/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/material';
import { FC } from 'react';
import { consts } from '../entity/consts';
import { AppToolbar } from './appToolbar/AppToolbar';
import { NotificationPanel } from './NotificationPanel';

const TopBar = styled('div')(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: consts.topBarHeight,
}));

const MainContent = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: consts.topBarHeight,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  background: theme.palette.background.paper,
}));

export const MainFrame: FC = ({ children }) => {
  return (
    <>
      <TopBar>
        <AppToolbar />
      </TopBar>
      <MainContent>{children}</MainContent>
      <NotificationPanel />
    </>
  );
};
