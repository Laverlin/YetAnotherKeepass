/* eslint-disable react/require-default-props */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import { styled, SvgIcon, SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

interface IProps {
  path: string;
  viewBox?: string;
}

export const SvgPathRaw: OverridableComponent<SvgIconTypeMap<IProps, 'svg'>> = (props: IProps) => {
  return (
    <SvgIcon {...props} viewBox={props.viewBox}>
      <path d={props.path} />
    </SvgIcon>
  );
};

export const SvgPath = styled(SvgPathRaw, {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size?: number }>(({ size }) => ({
  height: `${size}px`,
  width: `${size}px`,
}));
