import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { RecoilRoot } from 'recoil';
import { MainFrame } from './control/MainFrame';
import { OpenFilePanel } from './control/OpenFilePanel';
import { MainLayout } from './control/MainLayout';

const appTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflow: 'hidden',
        },
        '&::-webkit-scrollbar': {
          width: '12px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-button': {
          height: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'transparent',
          borderRadius: '10px',
          backgroundClip: 'padding-box',
          borderRight: '3px transparent solid',
          borderLeft: '3px transparent solid',
        },
        '&:hover': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(180, 180, 180, 0.6)',
          },
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#3a506b',
    },
    background: {
      default: '#F6F5F5',
    },
  },
});

render(
  <RecoilRoot>
    {/* <GlobalObserver /> */}
    <React.StrictMode>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Router>
          <MainFrame>
            <Routes>
              <Route path="/app" element={<MainLayout />} />
              <Route path="/" element={<OpenFilePanel />} />
            </Routes>
          </MainFrame>
        </Router>
      </ThemeProvider>
    </React.StrictMode>
  </RecoilRoot>,
  document.getElementById('root')
);
