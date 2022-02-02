import { styled } from '@mui/material';

export const SecondaryText = styled('span')(({ theme }) => ({
  fontSize: theme.typography.caption.fontSize,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  color: theme.palette.grey[400],
}));
