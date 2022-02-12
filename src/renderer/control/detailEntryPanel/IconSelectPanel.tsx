/* eslint-disable no-return-assign */
import { Checkbox, Grid, IconButton, Popover, styled, Tooltip, Typography } from '@mui/material';
import { ItemHelper } from 'main/entity/ItemHelper';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { IpcMainLoadIcon } from 'main/IpcCommunication/IpcExtention';
import { FC, useState } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { DefaultKeeIcon } from 'renderer/entity/DefaultKeeIcon';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { allItemSelector, isDbChangedAtom, yakpCustomIconsAtom, yakpKdbxItemAtom } from 'renderer/state/atom';
import { closePanel, iconChoisePanelAtom } from 'renderer/state/panelStateAtom';
import { SvgPath } from '../common/SvgPath';

const Panel = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
}));

const GridList = styled(Grid)(() => ({
  width: 520,
  height: 450,
}));

const CustomIcon = styled('img')(() => ({
  width: 24,
  height: 24,
}));

const SubHeader = styled(Typography)(() => ({
  display: 'flex',
  alignItems: 'center',
  alignContent: 'center',
  padding: 4,
  height: 46,
}));

const IconCheckbox = styled(Checkbox)(() => ({
  // position: 'absolute',
  right: 0,
  top: 0,
  color: 'lightgray',
  padding: 3,
}));

const Cell = styled(Grid)(() => ({
  position: 'relative',
  display: 'flex',
  width: '46px',
  height: '46px',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
  '&:hover span': {
    visibility: 'visible',
  },
  '> span': {
    position: 'absolute',
    right: 0,
    top: 0,
    color: 'lightgray',
    padding: 3,
  },
}));

const Icon = styled('span')(({ theme }) => ({
  borderRadius: 3,
  width: 10,
  height: 10,
  boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
  backgroundColor: theme.palette.background.default,
  visibility: 'hidden',
}));

const CheckedIcon = styled(Icon)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  visibility: 'visible',
  '&:before': {
    display: 'block',
    width: 10,
    height: 10,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
}));

interface IProps {
  entry: YakpKdbxItem;
}

const checkIfIconUsed = (chEntry: YakpKdbxItem, iconSid: string): boolean => {
  if (chEntry.customIconSid === iconSid) return true;
  return !!chEntry.history.find((e) => checkIfIconUsed(e, iconSid));
};

export const IconSelectPanel: FC<IProps> = ({ entry }) => {
  // global state
  //
  const setEntryState = useSetRecoilState(yakpKdbxItemAtom(entry.sid));
  const [panelState, setPanelState] = useRecoilState(iconChoisePanelAtom);
  const SetDbChanged = useSetRecoilState(isDbChangedAtom);
  const dropIcon = useRecoilCallback(({ set, snapshot }) => (iconSid: string) => {
    snapshot
      .getLoadable(allItemSelector)
      .valueMaybe()
      ?.filter((i) => checkIfIconUsed(i, iconSid))
      .forEach((i) => {
        if (i.customIconSid === iconSid)
          set(
            yakpKdbxItemAtom(i.sid),
            ItemHelper.apply(i, (e) => (e.customIconSid = undefined))
          );
        i.history.forEach((ih) => {
          if (ih.customIconSid === iconSid) {
            const cloned = { ...ih };
            cloned.customIconSid = undefined;
            const hc = [...i.history];
            const index = hc.findIndex((hci) => hci.customIconSid === iconSid);
            hc.splice(index, 1, cloned);
            set(
              yakpKdbxItemAtom(i.sid),
              ItemHelper.apply(i, (e) => (e.history = hc))
            );
          }
        });
      });
  });
  const getUnused = useRecoilCallback(({ snapshot }) => () => {
    const unusedIcons: string[] = [];
    snapshot
      .getLoadable(yakpCustomIconsAtom)
      .valueMaybe()
      ?.forEach((i) => {
        if (
          !snapshot
            .getLoadable(allItemSelector)
            .valueMaybe()
            ?.find((e) => checkIfIconUsed(e, i.key))
        )
          unusedIcons.push(i.key);
      });
    return unusedIcons;
  });

  const [selectedIcons, setSelectedIcons] = useState([] as string[]);
  const [icons, setIcons] = useRecoilState(yakpCustomIconsAtom);

  if (!panelState.isShowPanel) return null;

  // handlers
  //
  const handleIconChange = (isPredefinedIcon: boolean, iconId: string) => {
    if (isPredefinedIcon) {
      const defaultIconId = Object.keys(DefaultKeeIcon).findIndex((key) => key === iconId);
      if (defaultIconId > -1) {
        setEntryState(
          ItemHelper.apply(entry, (e) => {
            e.defaultIconId = defaultIconId;
            e.customIconSid = undefined;
          })
        );
      }
    } else {
      setEntryState(
        ItemHelper.apply(entry, (e) => {
          e.customIconSid = iconId;
        })
      );
    }
    setPanelState(closePanel);
  };

  const handleAddCustomIcon = async () => {
    const icon = await IpcMainLoadIcon();
    if (icon) {
      setIcons(icons.concat(icon));
      SetDbChanged(true);
    }
  };

  const handleSelectIcon = (iconId: string) => {
    setSelectedIcons(
      selectedIcons.includes(iconId) ? selectedIcons.filter((i) => i !== iconId) : selectedIcons.concat(iconId)
    );
  };

  const handleSelectUnused = () => {
    setSelectedIcons(getUnused());
  };

  const handleCompressSelected = async () => {
    /*
  const itemIds = await currentContext().compressIcons(selectedIcons);
  setItemChanged(itemIds);
  setSelectedIcons([]);
  forceUpdate();
  */
  };

  const handleRemoveSelected = () => {
    selectedIcons.forEach(dropIcon);
    setIcons(icons.filter((icon) => !selectedIcons.includes(icon.key)));
    setSelectedIcons([]);
    SetDbChanged(true);
  };

  return (
    <Popover
      open={panelState.isShowPanel}
      anchorEl={panelState.panelAnchor}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={() => setPanelState(closePanel)}
    >
      <Panel>
        <GridList container>
          <Grid container>
            <SubHeader variant="h5" color="primary">
              Default Icons
            </SubHeader>
          </Grid>
          {Object.keys(DefaultKeeIcon)
            .filter((i) => i !== 'get')
            .map((i) => (
              <Grid item key={i}>
                <IconButton size="medium" onClick={() => handleIconChange(true, i)}>
                  <SvgPath path={Reflect.get(DefaultKeeIcon, i)} />
                </IconButton>
              </Grid>
            ))}
          <Grid container key="customSubheader">
            <SubHeader variant="h5" color="primary">
              Custom Icons
              <Tooltip title="Add Icon" sx={{ marginLeft: 'auto' }}>
                <IconButton onClick={() => handleAddCustomIcon()} color="primary">
                  <SvgPath path={SystemIcon.add} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Select Unused Icons">
                <IconButton onClick={() => handleSelectUnused()} color="primary">
                  <SvgPath path={SystemIcon.clean} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Compress Selected Icons">
                <span>
                  <IconButton onClick={() => handleCompressSelected()} color="primary" disabled={!selectedIcons.length}>
                    <SvgPath path={SystemIcon.zip} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Remove SelectedIcons">
                <span>
                  <IconButton onClick={() => handleRemoveSelected()} color="primary" disabled={!selectedIcons.length}>
                    <SvgPath path={SystemIcon.delete} />
                  </IconButton>
                </span>
              </Tooltip>
            </SubHeader>
          </Grid>
          {icons.map((icon) => (
            <Cell item key={icon.key}>
              <Tooltip title={<>{icon.key}</>}>
                <IconButton size="medium" onClick={() => handleIconChange(false, icon.key)}>
                  <CustomIcon src={icon.b64image} />
                </IconButton>
              </Tooltip>
              <IconCheckbox
                id="checkedIcon"
                checkedIcon={<CheckedIcon />}
                icon={<Icon />}
                checked={selectedIcons.includes(icon.key)}
                onChange={() => handleSelectIcon(icon.key)}
              />
            </Cell>
          ))}
        </GridList>
      </Panel>
    </Popover>
  );
};
