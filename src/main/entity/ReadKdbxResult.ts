import { CustomIcon } from './CustomIcon';
import { YakpError } from './YakpError';
import { YakpHistoryItem } from './YakpHistoryItem';
import { YakpKdbxItem } from './YakpKdbxItem';
import { YakpMetadata } from './YakpMetadata';

export class ReadKdbxResult {
  yakpKdbxItems: YakpKdbxItem[] = [];

  yakpHistoryItems: YakpHistoryItem[] = [];

  yakpMetadata: YakpMetadata = new YakpMetadata('', '', undefined, false);

  yakpError: YakpError | undefined;

  customIcons: CustomIcon[] = [];

  static fromError(error: YakpError) {
    const result = new ReadKdbxResult();
    result.yakpError = error;
    return result;
  }

  static fromResult(
    yakpKdbxItems: YakpKdbxItem[],
    yakpHistoryItems: YakpHistoryItem[],
    metadata: YakpMetadata,
    customIcons: CustomIcon[]
  ) {
    const result = new ReadKdbxResult();
    result.yakpKdbxItems = yakpKdbxItems;
    result.yakpHistoryItems = yakpHistoryItems;
    result.yakpMetadata = metadata;
    result.customIcons = customIcons;
    return result;
  }
}
