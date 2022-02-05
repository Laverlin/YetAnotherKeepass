/* eslint-disable react/require-default-props */
import { keyframes, styled } from '@mui/material';
import { FC } from 'react';

const rotate1 = keyframes`
  from {
    transform: rotateX(35deg) rotateY(-45deg) rotateZ(0);
  }

  to {
    transform: rotateX(35deg) rotateY(-45deg) rotateZ(1turn);
  }
`;

const rotate2 = keyframes`
  from {
    transform: rotateX(50deg) rotateY(10deg) rotateZ(0);
  }

  to {
    transform: rotateX(50deg) rotateY(10deg) rotateZ(1turn);
  }
`;

const rotate3 = keyframes`
  from {
    transform: rotateX(35deg) rotateY(55deg) rotateZ(0);
  }

  to {
    transform: rotateX(35deg) rotateY(55deg) rotateZ(1turn);
`;

const Spin = styled('div', {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size: number }>(({ size }) => ({
  position: 'relative',
  width: size,
  height: size,
  transformStyle: 'preserve-3d',
  perspective: '800px',
}));

const Arc = styled('div', {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color?: string }>(({ color }) => ({
  position: 'absolute',
  content: '""',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  borderBottom: `3px solid ${color || '#4481C2'}`,

  '&:nth-child(1)': {
    animation: `${rotate1} 1.15s linear infinite`,
    animationDelay: '-0.8s',
  },

  '&:nth-child(2)': {
    animation: `${rotate2} 1.15s linear infinite`,
    animationDelay: '-0.4s',
  },

  '&:nth-child(3)': {
    animation: `${rotate3} 1.15s linear infinite`,
    animationDelay: '0s',
  },
}));

export const Spinner: FC<{ size: number; color?: string }> = ({ size, color }) => {
  return (
    <Spin size={size}>
      <Arc color={color} />
      <Arc color={color} />
      <Arc color={color} />
    </Spin>
  );
};
