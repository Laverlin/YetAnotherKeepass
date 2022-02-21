import { IconButton, InputAdornment, styled, TextField } from '@mui/material';
import { ProtectedValue } from 'kdbxweb';
import { ItemHelper } from 'main/entity/ItemHelper';
import { FC, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { displayFieldName } from 'renderer/entity/DisplayFieldName';
import { YakpKdbxItem } from '../../../main/entity/YakpKdbxItem';
import { SystemIcon } from '../../entity/SystemIcon';
import { selectorYakpItem, customPropertyMenuAtom, notificationAtom, openPanel, passwordPanelAtom } from '../../state';
import { SvgPath } from '../common/SvgPath';

const FieldInput = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
}));

const CopyButton = styled(IconButton)(() => ({
  position: 'absolute',
  top: '2px',
  right: '2px',
}));

const UrlButton = styled(IconButton)(() => ({
  position: 'absolute',
  top: '28px',
  right: '2px',
}));

const AdorButtton = styled('div')(() => ({
  marginRight: '10px',
}));

interface IProp {
  entry: YakpKdbxItem;
  fieldId: string;
  inputValue: string;
  isProtected: boolean;
  isMultiline: boolean;
  isCustomProperty: boolean;
  // eslint-disable-next-line react/require-default-props
  disabled?: boolean;
}

export const PropertyInput: FC<IProp> = ({
  entry,
  fieldId,
  inputValue,
  isProtected,
  isMultiline,
  isCustomProperty,
  disabled,
}) => {
  // global state
  //
  const setEntryState = useSetRecoilState(selectorYakpItem(entry.sid));
  const setMenuState = useSetRecoilState(customPropertyMenuAtom);
  const setPwdPanelState = useSetRecoilState(passwordPanelAtom);
  const setNotification = useSetRecoilState(notificationAtom);

  // local state
  //
  const [isShowText, toggleShowText] = useState<boolean>(!isProtected);
  useEffect(() => {
    toggleShowText(!isProtected);
  }, [isProtected, entry]);

  // handlers
  //
  const handlePropertyChande = (field: string, value: string) => {
    const fieldValue = isProtected ? ProtectedValue.fromString(value) : value;
    setEntryState(ItemHelper.setField(entry, field, fieldValue));
  };

  const handleCopy = (e: React.MouseEvent, field: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ItemHelper.stripProtection(entry.fields[field]));
    setNotification(`${displayFieldName(field)} is copied`);
  };

  const handleGoUrl = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.electron.ipcRenderer.systemCommand('openUrl', url);
  };

  // helpers
  //
  const adornment = {
    endAdornment: (
      <InputAdornment position="end">
        <AdorButtton>
          {isProtected && (
            <IconButton aria-label="toggle text visibility" onClick={() => toggleShowText(!isShowText)}>
              <SvgPath path={isShowText ? SystemIcon.visibilityOn : SystemIcon.visibilityOff} />
            </IconButton>
          )}
          {isCustomProperty && (
            <IconButton
              aria-label="context menu"
              onClick={(e) =>
                setMenuState({
                  isShowPanel: true,
                  panelAnchor: e.currentTarget,
                  isProtected,
                  fieldId,
                })
              }
              disabled={disabled}
            >
              <SvgPath path={SystemIcon.dot_hamburger} />
            </IconButton>
          )}
          {fieldId === 'Password' && (
            <IconButton
              aria-label="password panel"
              onClick={(e) => setPwdPanelState(openPanel(e.currentTarget))}
              disabled={disabled}
            >
              <SvgPath path={SystemIcon.dot_hamburger} />
            </IconButton>
          )}
        </AdorButtton>
        <CopyButton onClick={(e) => handleCopy(e, fieldId)} size="small" disabled={!inputValue}>
          <SvgPath path={SystemIcon.copyFile} size={16} />
        </CopyButton>
        {fieldId === 'URL' && (
          <UrlButton onClick={(e) => handleGoUrl(e, inputValue)} size="small" disabled={!inputValue}>
            <SvgPath path={SystemIcon.urlLink} size={16} />
          </UrlButton>
        )}
      </InputAdornment>
    ),
  };

  return (
    <FieldInput>
      <TextField
        disabled={disabled}
        id={fieldId}
        fullWidth
        multiline={isMultiline}
        type={isShowText ? 'text' : 'password'}
        label={displayFieldName(fieldId)}
        variant="outlined"
        value={inputValue}
        onChange={(e) => handlePropertyChande(fieldId, e.target.value)}
        InputProps={adornment}
      />
    </FieldInput>
  );
};
