import { YakpKdbxItem } from './YakpKdbxItem';

export class YakpHistoryItem extends YakpKdbxItem {
  historyIndex: number;

  constructor(index: number) {
    super();
    this.historyIndex = index;
  }
}
