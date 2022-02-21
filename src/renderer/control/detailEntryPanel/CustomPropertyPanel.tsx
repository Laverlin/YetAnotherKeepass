/* eslint-disable no-return-assign */
import { Checkbox, FormControlLabel, IconButton, Popover, styled, TextField } from '@mui/material';
import { ProtectedValue } from 'kdbxweb';
import { ItemHelper } from 'main/entity/ItemHelper';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { FC, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { selectorYakpItem, closePanel, customPropertyPanelAtom } from 'renderer/state';
import { SvgPath } from '../common/SvgPath';

const Panel = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  width: 450,
  height: 100,
}));

interface IProps {
  entry: YakpKdbxItem;
}

export const CustomPropertyPanel: FC<IProps> = ({ entry }) => {
  // Global state
  //
  const [panelState, setPanelState] = useRecoilState(customPropertyPanelAtom);
  const setEntry = useSetRecoilState(selectorYakpItem(entry.sid));

  // Local state
  //
  const [customPropertyName, setCustomPropName] = useState('');
  const [isProtected, toggleIsProtected] = useState(false);

  // handlers
  //
  const handleAddCustomProperty = () => {
    if (!customPropertyName) return;

    setEntry(
      ItemHelper.apply(entry, (e) => (e.fields[customPropertyName] = isProtected ? ProtectedValue.fromString('') : ''))
    );
    setCustomPropName('');
    toggleIsProtected(false);
    setPanelState(closePanel);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      handleAddCustomProperty();
      event.preventDefault();
    }
  };

  return (
    <Popover
      open={panelState.isShowPanel}
      anchorEl={panelState.panelAnchor}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      onClose={() => setPanelState(closePanel)}
    >
      <Panel onKeyPress={handleKeyPress}>
        <TextField
          id="customProperty"
          fullWidth
          label="Property Name"
          variant="outlined"
          value={customPropertyName}
          onChange={(e) => setCustomPropName(e.target.value)}
          size="small"
        />
        <FormControlLabel
          control={<Checkbox checked={isProtected} onChange={() => toggleIsProtected(!isProtected)} color="primary" />}
          label="Protected Value"
        />
        <IconButton onClick={handleAddCustomProperty}>
          <SvgPath path={SystemIcon.enterKey} />
        </IconButton>
      </Panel>
    </Popover>
  );
};
