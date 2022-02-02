import { ListItemButton, styled } from '@mui/material';

export const GroupItemStyle = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'nestLevel',
})<{ nestLevel: number }>(({ theme, nestLevel }) => ({
  height: theme.spacing(6),
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1 + 4 * nestLevel),
  '&:hover, &:focus': {
    backgroundColor: 'rgba(170, 170, 170, 0.2)',
  },
  '&:hover': {
    '& #contextMenuButton': {
      display: 'block',
    },
  },
  '&.Mui-selected': {
    backgroundColor: '#4481C2',
    '& #contextMenuButton': {
      display: 'block',
    },
    '&:hover': {
      backgroundColor: '#4481C2',
    },
  },
}));
