import { Accordion, AccordionDetails, AccordionSummary, styled, Typography } from '@mui/material';
import { ByteUtils } from 'kdbxweb';
import { YakpKdbxItem } from 'main/entity/YakpKdbxItem';
import { FC } from 'react';
import { SystemIcon } from 'renderer/entity/SystemIcon';
import { SvgPath } from '../common/SvgPath';

const InfoRow = styled(Typography)(() => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const Content = styled('div')(() => ({
  width: '100%',
}));

interface IProps {
  entry: YakpKdbxItem;
}

export const ItemInfoCard: FC<IProps> = ({ entry }) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<SvgPath path={SystemIcon.cone_down} />}
        aria-controls="panel-content"
        id="panel-header"
      >
        <Typography variant="body1">Entry Info</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Content>
          <InfoRow variant="body1">
            Created&nbsp;:&nbsp;
            <Typography variant="caption">
              {entry.creationTime?.toDateString()}
              &nbsp;
              {entry.creationTime?.toTimeString()}
            </Typography>
          </InfoRow>

          <InfoRow variant="body1">
            Last Modified&nbsp;:&nbsp;
            <Typography variant="caption">
              {entry.lastModifiedTime.toDateString()}
              &nbsp;
              {entry.lastModifiedTime.toTimeString()}
            </Typography>
          </InfoRow>

          <InfoRow variant="body1">
            Last Access&nbsp;:&nbsp;
            <Typography variant="caption">
              {entry.lastAccessTime.toDateString()}
              &nbsp;
              {entry.lastAccessTime.toTimeString()}
            </Typography>
          </InfoRow>

          <InfoRow variant="body1">
            Used&nbsp;:&nbsp;<Typography variant="caption">{entry.usageCount}</Typography>
            &nbsp;&nbsp; History&nbsp;:&nbsp;<Typography variant="caption">{entry.history.length}</Typography>
          </InfoRow>
          <InfoRow variant="body1">
            UUID&nbsp;:&nbsp;
            <Typography variant="caption">
              {ByteUtils.bytesToHex(ByteUtils.base64ToBytes(entry.sid)).toUpperCase()}
            </Typography>
          </InfoRow>
        </Content>
      </AccordionDetails>
    </Accordion>
  );
};
