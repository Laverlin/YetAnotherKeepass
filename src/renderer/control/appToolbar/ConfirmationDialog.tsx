import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { FC } from 'react';
import { useRecoilState } from 'recoil';
import { closePanel, ConfirmationChoice, confirmationDialogAtom } from '../../state/panelStateAtom';

interface IProp {
  resolver: React.MutableRefObject<{ resolve: (choice: ConfirmationChoice) => void } | undefined>;
}
export const ConfirmationDialog: FC<IProp> = ({ resolver }) => {
  const [confirmationState, setConfirmationState] = useRecoilState(confirmationDialogAtom);

  const handleClose = (choice: ConfirmationChoice) => {
    setConfirmationState({ ...closePanel });
    resolver.current?.resolve(choice);
  };

  return (
    <Dialog open={confirmationState.isShowPanel} onClose={() => handleClose('cancel')}>
      <DialogTitle>There are unsaved changes</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Would you like to &ldquo;Save&rdquo; them, &ldquo;Ignore&rdquo; and exit, or &ldquo;Cancel&rdquo; and continue
          to work with the app?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose('cancel')}>Cancel</Button>
        <Button onClick={() => handleClose('ignore')}>Ignore</Button>
        <Button variant="contained" onClick={() => handleClose('save')} autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
