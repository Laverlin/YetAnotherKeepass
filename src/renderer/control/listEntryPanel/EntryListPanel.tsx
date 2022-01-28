import { styled, Typography } from '@mui/material';
import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { filteredIdsSelector } from 'renderer/state/FilterAtom';
import { EntryContextMenu } from './EntryContextMenu';
import { EntryItem } from './EntryItem';

const divOverlayY = styled('div')`
  overflow: hidden;
  overflow-y: overlay;
`;

const EntryList = styled(divOverlayY)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  paddingTop: theme.spacing(2),
}));

const EmptyScreen = styled(Typography)(({ theme }) => ({
  width: '100%',
  textAlign: 'center',
  marginTop: theme.spacing(7),
  color: theme.palette.action.disabled,
}));

export const EntryListPanel: FC = () => {
  const filteredEntriesIds = useRecoilValue(filteredIdsSelector);

  if (filteredEntriesIds.length === 0) {
    return (
      <EmptyScreen variant="h2">
        No Items <br />
        Select another group or change filter criteria
      </EmptyScreen>
    );
  }

  return (
    <>
      <EntryList>
        {filteredEntriesIds.map((entrySid) => (
          <EntryItem key={entrySid} entrySid={entrySid} />
        ))}
      </EntryList>
      <EntryContextMenu />
    </>
  );
};
