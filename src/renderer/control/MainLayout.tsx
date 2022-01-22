import { styled } from '@mui/material';
import React, { useState } from 'react';
import { GroupPanel } from './groupPanel/GroupPanel';

/**
 * Object to store and calculate dragger position
 */
class DraggerPosition {
  private calcPosition: (x: number) => number;

  constructor(position: number, min: number, max: number, calcPosition: (x: number) => number) {
    this.position = position;
    this.maxPosition = max;
    this.minPosition = min;
    this.calcPosition = calcPosition;
    this.setPosition = this.setPosition.bind(this);
  }

  /**
   * Set new position and return updated object
   */
  setPosition(cursorPosition: number) {
    let moved = this.calcPosition(cursorPosition);
    moved = moved > this.minPosition ? moved : this.minPosition;
    moved = moved < this.maxPosition ? moved : this.maxPosition;
    return { ...this, position: moved };
  }

  position: number;

  minPosition: number;

  maxPosition: number;
}

const Bar = styled('div')(({ theme }) => ({
  overflow: 'hidden',
  position: 'absolute',
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.primary.main,
}));

const MiddleBar = styled(Bar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

const RightBar = styled(Bar)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
}));

const Dragger = styled('div')(({ theme }) => ({
  width: '3px',
  cursor: 'ew-resize',
  padding: '6px 0 0',
  position: 'absolute',
  top: 0,
  bottom: 0,
  '&:hover': {
    background: theme.palette.info.main,
  },
  transitionDuration: '.5s',
  transitionProperty: 'background',
  zIndex: 1000,
}));

/**
 * Holding the three main bars and two draggers between
 */
export const MainLayout = () => {
  const [leftDragger, setLeftDragger] = useState(
    new DraggerPosition(300, 90, 400, (x: number) => x - document.body.offsetLeft)
  );
  const [rightDragger, setRightDragger] = useState(
    new DraggerPosition(450, 390, 630, (x: number) => document.body.offsetWidth - x - 1)
  );

  const handleMousedown = (
    _: React.MouseEvent<HTMLDivElement, MouseEvent>,
    setDragger: React.Dispatch<React.SetStateAction<DraggerPosition>>
  ) => {
    const handleMouseMove = (e: MouseEvent) => {
      setDragger((cur) => {
        return cur.setPosition(e.clientX);
      });
      e.preventDefault();
    };

    const handleMouseUp = () => {
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('mousemove', handleMouseMove, true);
    };

    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
  };

  return (
    <>
      <Bar style={{ left: 0, width: leftDragger.position }}>
        <GroupPanel />
      </Bar>
      <Dragger onMouseDown={(e) => handleMousedown(e, setLeftDragger)} style={{ left: leftDragger.position }} />
      <MiddleBar style={{ left: leftDragger.position, right: rightDragger.position }}>
        {/* <EntryListPanel /> */}
      </MiddleBar>

      <Dragger onMouseDown={(e) => handleMousedown(e, setRightDragger)} style={{ right: rightDragger.position }} />
      <RightBar style={{ right: 0, width: rightDragger.position }}>{/*  <DetailPanel /> */}</RightBar>
      {/* <NotificationPanel /> */}
    </>
  );
};
