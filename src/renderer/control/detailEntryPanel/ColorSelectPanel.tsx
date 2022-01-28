/* eslint-disable no-return-assign */
import { Grid, IconButton, Popover, styled } from '@mui/material';
import { ItemHelper } from 'main/entity/YakpKbdxItemExtention';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { FC } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { DefaultColors } from 'renderer/entity/DefaultColors';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { yakpKdbxItemAtom } from 'renderer/state/atom';
import { closePanel, colorChoisePanelAtom } from 'renderer/state/panelStateAtom';
import { SvgPath } from '../common/SvgPath';

const Panel = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  overflow: 'hidden',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
}));

const GridListStyled = styled(Grid)(() => ({
  justifyContent: 'center',
  alignItems: 'center',
  width: 392,
  height: 56,
}));

const ColorIcon = styled(SvgPath)(({ theme }) => ({
  width: theme.spacing(5),
  height: theme.spacing(5),
}));

const ColorButton = styled(IconButton)(({ theme }) => ({
  width: theme.spacing(7),
  height: theme.spacing(7),
}));

interface IProps {
  entry: YakpKdbxItem;
}

export const ColorSelectPanel: FC<IProps> = ({ entry }) => {
  const [panelState, setPanelState] = useRecoilState(colorChoisePanelAtom);
  const setEntryState = useSetRecoilState(yakpKdbxItemAtom(entry.sid));

  const handleSetColor = (color: string) => {
    setEntryState(ItemHelper.apply(entry, (e) => (e.bgColor = color)));
    setPanelState(closePanel);
  };

  const colors = Object.keys(DefaultColors);
  colors.push('black');

  return (
    <Popover
      open={panelState.isShowPanel}
      anchorEl={panelState.panelAnchor}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      onClose={() => setPanelState(closePanel)}
    >
      <Panel>
        <GridListStyled>
          {colors.map((i) => (
            <ColorButton key={i} size="medium" onClick={() => handleSetColor(Reflect.get(DefaultColors, i))}>
              <ColorIcon path={SystemIcon.colorEmpty} style={{ color: Reflect.get(DefaultColors, i) }} />
            </ColorButton>
          ))}
        </GridListStyled>
      </Panel>
    </Popover>
  );
};
