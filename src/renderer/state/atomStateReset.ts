import { selector } from 'recoil';
import {
  atomColorFilter,
  atomDeletedBinaries,
  atomDeletedEntries,
  atomDbChange,
  atomSearchFilter,
  atomSelectedEntry,
  atomSelectedGroup,
  atomSortEntries,
  atomTagFilter,
  atomCustomIcons,
  atomMetadata,
} from '.';

export const atomStateReset = selector({
  key: 'stateResetAom',
  get: () => undefined,
  set: ({ reset }) => {
    reset(atomSelectedEntry);
    reset(atomSelectedGroup);
    reset(atomDeletedEntries);
    reset(atomCustomIcons);
    reset(atomDeletedBinaries);
    reset(atomDbChange);
    reset(atomMetadata);
    reset(atomTagFilter);
    reset(atomColorFilter);
    reset(atomSearchFilter);
    reset(atomSortEntries);
  },
});
