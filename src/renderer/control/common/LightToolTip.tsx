/* eslint-disable react/jsx-props-no-spreading */
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

export const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary, // 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.pxToRem(14),
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white, // 'rgba(0, 0, 0, 0.87)',
  },
}));
