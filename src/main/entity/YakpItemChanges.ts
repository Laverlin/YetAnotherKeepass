import { BinariesChange } from './BinariesChange';
import { CustomIcon } from './CustomIcon';
import { DeletedEntry } from './DeletedEntry';
import { YakpKdbxItem } from './YakpKdbxItem';

export class YakpItemChanges {
  items: YakpKdbxItem[] = [];

  icons: CustomIcon[] = [];

  deletedEntries: DeletedEntry[] = [];

  deletedBinaries: BinariesChange[] = [];
}
