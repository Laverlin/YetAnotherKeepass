import { YakpError } from './YakpError';
import { YakpKdbxItem } from './YakpKdbxItem';
import { YakpMetadata } from './YakpMetadata';

export class ReadKdbxResult {
  yakpKdbxItems: YakpKdbxItem[] = [];

  yakpMetadata: YakpMetadata = new YakpMetadata('', '', undefined);

  yakpError: YakpError | undefined;

  customIcons: [string, string][] = [];

  static fromError(error: YakpError) {
    const result = new ReadKdbxResult();
    result.yakpError = error;
    return result;
  }

  static fromResult(yakpKdbxItems: YakpKdbxItem[], metadata: YakpMetadata, customIcons: [string, string][]) {
    const result = new ReadKdbxResult();
    result.yakpKdbxItems = yakpKdbxItems;
    result.yakpMetadata = metadata;
    result.customIcons = customIcons;
    return result;
  }
}
