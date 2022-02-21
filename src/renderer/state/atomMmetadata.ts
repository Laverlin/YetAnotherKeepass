import { BinariesChange } from 'main/entity/BinariesChange';
import { DeletedEntry } from 'main/entity/DeletedEntry';
import { atom } from 'recoil';
import { YakpMetadata } from '../../main/entity/YakpMetadata';

export const atomMetadata = atom<YakpMetadata | undefined>({
  key: 'yakpMetadataAtom',
  default: undefined,
});

export const atomDeletedEntries = atom<DeletedEntry[]>({
  key: 'deletedEntriesAtom',
  default: [],
});

export const atomDeletedBinaries = atom<BinariesChange[]>({
  key: 'deletedBinaryAtom',
  default: [],
});
