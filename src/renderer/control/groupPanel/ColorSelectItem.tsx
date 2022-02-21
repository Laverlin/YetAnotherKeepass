import { IconButton, ListItemText, styled } from '@mui/material';
import { FC, useState } from 'react';
import { useRecoilState } from 'recoil';
import { DefaultColors } from 'renderer/entity/DefaultColors';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { atomColorFilter } from 'renderer/state/atomFilter';
import { SvgPath } from '../common/SvgPath';
import { GroupIconStyle } from './GroupIconStyle';
import { GroupItemStyle } from './GroupItemStyle';
import { PrimaryTextStyle } from './PrimaryTextStyle';

const ColorSelectorStyle = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  marginTop: theme.spacing(1 + 1 / 4),
  marginLeft: theme.spacing(2 + 3 / 4),
}));

const ColorIconStyle = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1 / 4),
}));

const FlagIcon = styled(SvgPath, {
  shouldForwardProp: (prop) => prop !== 'fcolor',
})<{ fcolor: string }>(({ theme, fcolor }) => ({
  color: fcolor || theme.palette.grey.A100,
}));

export const ColorSelectItem: FC = () => {
  const [colorFilter, setColorFilter] = useRecoilState(atomColorFilter);
  const [isShowColorSelection, setShowColorSelection] = useState(false);

  const colors = [
    DefaultColors.yellow,
    DefaultColors.green,
    DefaultColors.red,
    DefaultColors.orange,
    DefaultColors.blue,
    DefaultColors.purple,
  ];

  return (
    <GroupItemStyle
      nestLevel={0}
      onMouseEnter={() => setShowColorSelection(true)}
      onMouseLeave={() => setShowColorSelection(false)}
    >
      <GroupIconStyle>
        <FlagIcon path={SystemIcon.colorFilled} fcolor={colorFilter.color} />
      </GroupIconStyle>
      <ListItemText primary={<PrimaryTextStyle>Colors</PrimaryTextStyle>} hidden={isShowColorSelection} />

      <ColorSelectorStyle hidden={!isShowColorSelection}>
        <ColorIconStyle onClick={() => setColorFilter({ color: '' })}>
          <FlagIcon path={SystemIcon.colorFilled} fcolor={colorFilter.color} />
        </ColorIconStyle>
        {colors.map((color) => (
          <ColorIconStyle key={color} onClick={() => setColorFilter({ color })}>
            <FlagIcon path={SystemIcon.colorEmpty} fcolor={color} />
          </ColorIconStyle>
        ))}
      </ColorSelectorStyle>
    </GroupItemStyle>
  );
};
