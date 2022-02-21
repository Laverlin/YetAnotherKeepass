/* eslint-disable react-hooks/exhaustive-deps */
import { IconButton, styled, Tooltip, Typography } from '@mui/material';
import { DeletedEntry } from 'main/entity/DeletedEntry';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { FC, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { atomHistory, atomDeletedEntries, atomDbChange, atomHistoryItems } from '../../state';
import { SvgPath } from '../common/SvgPath';

const BottomBar = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'row',
  height: theme.spacing(8),
  padding: theme.spacing(1),
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)',
}));

const BottomIcon = styled(SvgPath)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
  margin: theme.spacing(1 / 2),
}));

const VersionContent = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  userSelect: 'none',
}));

const DeleteButton = styled('span')(() => ({
  marginLeft: 'auto',
}));

const VersionText = styled(Typography)(() => ({
  width: '100%',
  textAlign: 'center',
}));

interface IProps {
  entry: YakpKdbxItem;
}

export const DetailToolbar: FC<IProps> = ({ entry }) => {
  const [historyState, setHistoryState] = useRecoilState(atomHistory(entry.sid));
  const [historyEntries, setHistoryEntries] = useRecoilState(atomHistoryItems(entry.sid));
  const setDeletedEntries = useSetRecoilState(atomDeletedEntries);
  const setDbChanged = useSetRecoilState(atomDbChange);

  const totalVersions = historyEntries.length;
  const isLast = totalVersions === historyState.historyIndex;
  const isFirst = historyState.historyIndex === 0;

  useEffect(() => {
    setHistoryState({ historyIndex: totalVersions, isInHistory: false });
  }, [entry.sid]);

  useEffect(() => {
    if (!historyState.isInHistory) setHistoryState({ historyIndex: totalVersions, isInHistory: false });
  }, [totalVersions]);

  const handleIndexChanged = (newIndex: number) => {
    if (newIndex < 0 || newIndex > totalVersions) return;
    setHistoryState({ isInHistory: newIndex !== totalVersions, historyIndex: newIndex });
  };

  const handleDeleteVersion = (index: number) => {
    if (index === totalVersions - 1) setHistoryState({ isInHistory: false, historyIndex: index });
    setDeletedEntries((cur) => cur.concat([new DeletedEntry(entry.sid, historyEntries[index].historyIndex)]));
    setHistoryEntries((cur) => [...cur.slice(0, index), ...cur.slice(index + 1)]);
    setDbChanged(true);
  };

  const modifiedTime = new Date(
    !isLast ? historyEntries[historyState.historyIndex].lastModifiedTime : entry.lastModifiedTime
  ).toDateString();

  return (
    <BottomBar>
      <IconButton
        aria-label="History back"
        disabled={isFirst}
        onClick={() => handleIndexChanged(historyState.historyIndex - 1)}
      >
        <BottomIcon path={SystemIcon.cone_left} />
      </IconButton>

      <VersionContent>
        <div>
          <VersionText variant="body1">version: {historyState.historyIndex}</VersionText>
        </div>
        <div>
          <Typography variant="caption">{modifiedTime}</Typography>
        </div>
      </VersionContent>

      <IconButton
        aria-label="History forward"
        disabled={isLast}
        onClick={() => handleIndexChanged(historyState.historyIndex + 1)}
      >
        <BottomIcon path={SystemIcon.cone_right} />
      </IconButton>

      <Tooltip title="Remove this version from history">
        <DeleteButton>
          <IconButton
            aria-label="Remove Version"
            disabled={isLast}
            onClick={() => handleDeleteVersion(historyState.historyIndex)}
          >
            <BottomIcon path={SystemIcon.delete} />
          </IconButton>
        </DeleteButton>
      </Tooltip>
    </BottomBar>
  );
};
