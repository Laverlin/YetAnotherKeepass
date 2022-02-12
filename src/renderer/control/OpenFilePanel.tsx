import {
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { ProtectedValue } from 'kdbxweb';
import { ItemHelper } from 'main/entity/ItemHelper';
import { RenderSetting } from 'main/entity/RenderSetting';
import { IpcMainOpenDialog, IpcMainReadKdbx } from 'main/IpcCommunication/IpcExtention';

import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { allHistoryItemsSelector, allItemSelector, yakpCustomIconsAtom, yakpMetadataAtom } from 'renderer/state/atom';
import { DefaultKeeIcon } from '../entity/DefaultKeeIcon';
import { SystemIcon } from '../entity/SystemIcon';
import { Spinner } from './common/Spinner';
import { SvgPath } from './common/SvgPath';

const Form = styled('form')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
}));

const Content = styled('div')(() => ({
  width: '60%',
  marginTop: '150px',
  marginBottom: 'auto',
}));

const InputRow = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'top',
  height: '100px',
}));

const EnterButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginTop: -theme.spacing(2),
  height: '76px',
  width: '76px',
}));

const EnterPlaceholder = styled('div')(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginTop: -theme.spacing(2),
  height: '76px',
  width: '76px',
  paddingTop: '16px',
}));

const SelectedFile = styled('div')(() => ({
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
}));

const SelectedFileIcon = styled(SvgPath)(() => ({
  marginRight: '40px',
  marginLeft: '20px',
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
  display: 'none',
  height: theme.spacing(5),
}));

const FileItemRow = styled(ListItem)(({ theme }) => ({
  height: theme.spacing(5),
  width: '100%',
  '&:hover': {
    '& #clearButton': {
      display: 'block',
    },
  },
})) as unknown as typeof ListItem;

const useFocus = () => {
  const htmlElRef = useRef<HTMLElement | null>(null);
  const setFocus = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus] as const;
};

export const OpenFilePanel: FC = () => {
  const [inputRef, setInputFocus] = useFocus();

  const [selectedFileName, setFileName] = useState<string>('');
  const [error, setError] = useState('');
  const [isShowPassword, toggleShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [setting, setSetting] = useState<RenderSetting | undefined>(undefined);

  const setItems = useSetRecoilState(allItemSelector);
  const setHistoryItems = useSetRecoilState(allHistoryItemsSelector);
  const setMetadata = useSetRecoilState(yakpMetadataAtom);
  const setCustomIcons = useSetRecoilState(yakpCustomIconsAtom);

  const navigate = useNavigate();

  useEffect(() => {
    window.electron.ipcRenderer.onSetting((s) => {
      setSetting(s);
      if (s.recentFiles && s.recentFiles.length > 0) {
        setInputFocus();
        setFileName(s.recentFiles[0]);
      }
    });
    window.electron.ipcRenderer.getSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = (selectedFile: string) => {
    setFileName(selectedFile);
    setError('');
    setPassword('');
    setLoading(false);
    setInputFocus();
  };

  const handleOpenFile = async () => {
    const fileName = await IpcMainOpenDialog();
    setFileName(fileName);
    setPassword('');
    setError('');
    if (fileName) setInputFocus();
  };

  const updateRecentFiles = (file: string, isRemove = false) => {
    if (!setting) return;
    const updated = { ...setting };
    updated.recentFiles = updated.recentFiles.filter((f) => f !== file);
    if (!isRemove && updated.recentFiles.unshift(file) > 8) updated.recentFiles.pop();
    setSetting(updated);
    window.electron.ipcRenderer.saveSetting(updated);
  };

  const handleFileRemove = (event: React.MouseEvent<HTMLButtonElement>, file: string) => {
    event.stopPropagation();
    updateRecentFiles(file, true);
  };

  const handleReadKdbx = async () => {
    const pwd = ProtectedValue.fromString(password);
    setLoading(true);
    const readKdbxResult = await IpcMainReadKdbx(selectedFileName, pwd.value, pwd.salt);
    setLoading(false);
    if (readKdbxResult.yakpError) {
      const errorMsg =
        readKdbxResult.yakpError.errorId === 'InvalidKey'
          ? 'Wrong Password'
          : `${readKdbxResult.yakpError.errorId}: ${readKdbxResult.yakpError.message}`;
      setError(errorMsg);
    } else {
      updateRecentFiles(readKdbxResult.yakpMetadata.kdbxFile);

      const items = readKdbxResult.yakpKdbxItems.map((i) => ItemHelper.fromSerialized(i));
      const historyItems = readKdbxResult.yakpHistoryItems.map((i) => ItemHelper.fromSerializedHistory(i));

      setMetadata(readKdbxResult.yakpMetadata);
      setCustomIcons(readKdbxResult.customIcons);
      setHistoryItems(historyItems);
      setItems(items);
      navigate('/app');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      handleReadKdbx();
      event.preventDefault();
    }
  };

  return (
    <Form onKeyPress={handleKeyPress}>
      <Content>
        <div>
          <IconButton
            onClick={() => {
              handleOpenFile();
            }}
          >
            <SvgPath size={60} path={DefaultKeeIcon[`folder-o`]} />
          </IconButton>
        </div>

        <InputRow>
          <TextField
            sx={{ marginTop: '14px' }}
            id="password"
            inputRef={inputRef}
            fullWidth
            autoFocus
            disabled={!selectedFileName}
            label={selectedFileName && `Password for ${selectedFileName}`}
            error={!!error}
            helperText={error}
            variant="outlined"
            placeholder="Password "
            type={isShowPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    disabled={!selectedFileName}
                    onClick={() => toggleShowPassword(!isShowPassword)}
                  >
                    {isShowPassword ? (
                      <SvgPath path={SystemIcon.visibilityOn} />
                    ) : (
                      <SvgPath path={SystemIcon.visibilityOff} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {!isLoading ? (
            <EnterButton onClick={() => handleReadKdbx()} disabled={!selectedFileName}>
              <SvgPath size={50} path={SystemIcon.enterKey} />
            </EnterButton>
          ) : (
            <EnterPlaceholder>
              <Spinner size={50} />
            </EnterPlaceholder>
          )}
        </InputRow>
        <SelectedFile>
          {selectedFileName && (
            <>
              <SelectedFileIcon size={15} path={SystemIcon.cone_right} />
              <Typography variant="caption">{selectedFileName}</Typography>
            </>
          )}
        </SelectedFile>
        <List>
          {setting?.recentFiles.map((file) => (
            <FileItemRow
              button
              key={file}
              onClick={() => handleFileSelect(file)}
              onSelect={() => handleFileSelect(file)}
            >
              <ListItemIcon>
                <SvgPath path={DefaultKeeIcon.database} />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body1">{file}</Typography>
              </ListItemText>
              <ClearButton id="clearButton" onClick={(e) => handleFileRemove(e, file)}>
                <SvgPath path={SystemIcon.clear} />
              </ClearButton>
            </FileItemRow>
          ))}
        </List>
      </Content>
    </Form>
  );
};
