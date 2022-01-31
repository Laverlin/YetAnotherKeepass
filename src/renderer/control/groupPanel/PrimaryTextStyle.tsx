import { styled } from '@mui/material';

export const PrimaryTextStyle = styled('div')(({ theme }) => ({
  fontSize: theme.typography.body1.fontSize,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  color: theme.palette.background.default,
}));
