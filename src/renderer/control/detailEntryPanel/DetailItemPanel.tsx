/* eslint-disable no-return-assign */
/* eslint-disable react/jsx-props-no-spreading */
import { Autocomplete, Chip, IconButton, Input, styled, TextField, Tooltip, Typography } from '@mui/material';
import { allItemsGroupSid } from 'main/entity/YakpKdbxItem';
import { FC } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { selectItemSelector, yakpCustomIconSelector, yakpKdbxItemAtom } from 'renderer/state/atom';
import { DatePicker } from '@mui/lab';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { historyAtom } from 'renderer/state/historyAtom';
import { DefaultKeeIcon } from 'renderer/entity/DefaultKeeIcon';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import {
  colorChoisePanelAtom,
  customPropertyPanelAtom,
  iconChoisePanelAtom,
  openPanel,
} from 'renderer/state/panelStateAtom';
import { allTagSelector } from 'renderer/state/FilterAtom';
import { ProtectedValue } from 'kdbxweb';
import DateFnsUtils from '@date-io/date-fns';
import { SvgPath } from '../common/SvgPath';
import { PropertyInput } from './PropertyInput';
import { AttachInput } from './AttachInput';
import { DetailToolbar } from './DetailToolbar';
import { ItemInfoCard } from './ItemInfoCard';
import { CustomPropertyMenu } from './CustomPropertyMenu';
import { CustomPropertyPanel } from './CustomPropertyPanel';
import { ColorSelectPanel } from './ColorSelectPanel';
import { IconSelectPanel } from './IconSelectPanel';
import { PasswordGeneratorPanel } from './PasswordGeneratorPanel';
import { ItemHelper } from '../../../main/entity/YakpKbdxItemExtention';

class FieldInfo {
  sortOrder: number = 0;

  isMultiline: boolean = false;

  isProtected: boolean = false;
}

const EmptyScreen = styled(Typography)(({ theme }) => ({
  width: '100%',
  textAlign: 'center',
  marginTop: theme.spacing(7),
  color: theme.palette.action.disabled,
}));

const ItemTitle = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  display: 'inline-flex',
  flexDirection: 'row',
  height: theme.spacing(9),
  paddingTop: theme.spacing(1),
}));

const TitleIconButton = styled(IconButton)(({ theme }) => ({
  width: theme.spacing(8),
  height: theme.spacing(8),
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(1 / 2),
}));

const TitleImgIcon = styled('img')(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
  margin: theme.spacing(2),
  paddingTop: 4,
}));

const TitleSvgIcon = styled(SvgPath)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
  margin: theme.spacing(2),
  paddingTop: 4,
}));

const TitleInput = styled(Input)(({ theme }) => ({
  '& .MuiInput-input': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: theme.typography.h4.fontSize,
  },
}));

const TitleFlagIcon = styled(SvgPath)(({ theme }) => ({
  width: theme.spacing(6),
  height: theme.spacing(6),
  margin: theme.spacing(1),
}));

const divOverlayY = styled('div')`
  overflow: hidden;
  overflow-y: overlay;
`;

const EntryItems = styled(divOverlayY)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(10),
  left: 0,
  right: 0,
  bottom: theme.spacing(8),
  padding: theme.spacing(2),
  paddingRight: theme.spacing(1),
}));

const FieldInput = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
}));

const FieldMix = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'row',
  minWidth: '0',
  width: '100%',
}));

export const DetailItemPanel: FC = () => {
  // Global state
  //
  const entrySid = useRecoilValue(selectItemSelector) || allItemsGroupSid;
  const [entry, setEntryState] = useRecoilState(yakpKdbxItemAtom(entrySid));
  // const customIcon = useRecoilValue(yakpCustomIconSelector(entry.customIconSid || ''));
  const customIcon = useRecoilCallback(({ snapshot }) => (iconSid: string) => {
    return snapshot.getLoadable(yakpCustomIconSelector(iconSid)).valueMaybe();
  });
  const historyState = useRecoilValue(historyAtom(entrySid));
  const setCustomPropPanel = useSetRecoilState(customPropertyPanelAtom);
  const setIconPanel = useSetRecoilState(iconChoisePanelAtom);
  const setColorPanel = useSetRecoilState(colorChoisePanelAtom);
  const allTags = useRecoilValue(allTagSelector);

  if (!entry || entry.isAllItemsGroup) {
    return <EmptyScreen variant="h2">Select Item to View</EmptyScreen>;
  }

  // handlers
  //
  const handleTitleChange = (inputValue: string) => {
    setEntryState(ItemHelper.apply(entry, (e) => (e.title = inputValue)));
  };

  const handleTagsChange = (values: (string[] | string)[]) => {
    setEntryState(ItemHelper.apply(entry, (e) => (e.tags = values as string[])));
  };

  const handleDateChange = (date: Date | null | undefined) => {
    setEntryState(
      ItemHelper.apply(entry, (e) => {
        e.isExpires = !!date;
        e.expiryTime = date || undefined;
      })
    );
  };

  // helpers
  //
  const fieldInfos = new Map<string, FieldInfo>([
    ['Title', { sortOrder: -5 } as FieldInfo],
    ['UserName', { sortOrder: -4 } as FieldInfo],
    ['Password', { sortOrder: -3, isProtected: true } as FieldInfo],
    ['URL', { sortOrder: -2 } as FieldInfo],
    ['Notes', { sortOrder: 100, isMultiline: true } as FieldInfo],
  ]);

  const entryView = historyState.isInHistory
    ? entry.history[historyState.historyIndex] // YakpKdbxItem.fromSerialized({ ...entry.history[historyState.historyIndex] })
    : entry;

  return (
    <form noValidate autoComplete="off">
      <ItemTitle>
        <TitleIconButton onClick={(e) => setIconPanel(openPanel(e.currentTarget))} disabled={historyState.isInHistory}>
          {entryView.customIconSid ? (
            <TitleImgIcon src={customIcon(entryView.customIconSid)?.b64image} />
          ) : (
            <TitleSvgIcon path={DefaultKeeIcon.get(entryView.defaultIconId)} />
          )}
        </TitleIconButton>
        <TitleInput
          id="Title"
          value={entryView.title}
          fullWidth
          placeholder="Title"
          disableUnderline={!!entryView.title}
          onChange={(e: any) => handleTitleChange(e.target.value)}
          disabled={historyState.isInHistory}
        />
        {!entry.isGroup && (
          <TitleIconButton
            onClick={(e) => setColorPanel(openPanel(e.currentTarget))}
            disabled={historyState.isInHistory}
          >
            {!entryView.bgColor ? (
              <TitleFlagIcon path={SystemIcon.colorEmpty} />
            ) : (
              <TitleFlagIcon path={SystemIcon.colorFilled} style={{ color: entryView.bgColor }} />
            )}
          </TitleIconButton>
        )}
      </ItemTitle>

      <EntryItems>
        {Array.from(Object.keys(entryView.fields))
          .map((field) => {
            const info = fieldInfos.get(field) || ({ sortOrder: 0 } as FieldInfo);
            return { name: field, value: entryView.fields[field], ...info };
          })
          .sort((a, b) => (a.sortOrder as number) - (b.sortOrder as number))
          .map((field) => (
            <div key={field.name}>
              <PropertyInput
                entry={entryView}
                fieldId={field.name}
                inputValue={ItemHelper.stripProtection(entry.fields[field.name])}
                isProtected={(field.isProtected as boolean) || field.value instanceof ProtectedValue}
                isMultiline={field.isMultiline as boolean}
                isCustomProperty={field.sortOrder === 0}
                disabled={historyState.isInHistory}
              />
              {field.name === 'URL' && (
                <Tooltip title="Add Custom Property" key="plusButton">
                  <IconButton
                    onClick={(e) => setCustomPropPanel(openPanel(e.currentTarget))}
                    disabled={historyState.isInHistory}
                  >
                    <SvgPath path={SystemIcon.add} />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          ))}

        <FieldInput>
          <Autocomplete
            multiple
            freeSolo
            id="tags"
            options={allTags}
            value={entryView.tags ?? []}
            onChange={(_, value) => handleTagsChange(value)}
            size="small"
            disabled={historyState.isInHistory}
            fullWidth
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip variant="outlined" size="small" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" label="Tags" />}
          />
        </FieldInput>

        <FieldMix>
          <div>
            <LocalizationProvider dateAdapter={DateFnsUtils}>
              <DatePicker
                renderInput={(props) => <TextField {...props} style={{ width: 155 }} />}
                clearable
                mask="__-__-____"
                inputFormat="dd-MM-yyyy"
                label={entryView.isExpires ? 'Expire Date' : 'No Expiration'}
                value={entryView.isExpires ? entryView.expiryTime : null}
                InputAdornmentProps={{ position: 'end' }}
                onChange={(date) => handleDateChange(date)}
                disabled={historyState.isInHistory}
              />
            </LocalizationProvider>
          </div>
          {!entry.isGroup && <AttachInput entry={entryView} disabled={historyState.isInHistory} />}
        </FieldMix>
        <FieldInput>
          <ItemInfoCard entry={entryView} />
        </FieldInput>
      </EntryItems>

      {!entry.isGroup && <DetailToolbar entry={entry} />}

      <CustomPropertyMenu entry={entry} />
      <CustomPropertyPanel entry={entry} />
      <ColorSelectPanel entry={entry} />
      <IconSelectPanel entry={entry} />
      <PasswordGeneratorPanel entry={entry} />
    </form>
  );
};
