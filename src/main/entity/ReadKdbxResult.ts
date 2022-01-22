import { YakpError } from './YakpError';
import { YakpKdbxItem } from './YakpKdbxItem';
import { YakpMetadata } from './YakpMetadata';

export class ReadKdbxResult {
  yakpKdbxItems: YakpKdbxItem[] = [];

  yakpMetadata: YakpMetadata = new YakpMetadata('', '', undefined);

  yakpError: YakpError | undefined;

  static fromError(error: YakpError) {
    const result = new ReadKdbxResult();
    result.yakpError = error;
    return result;
  }

  static fromResult(yakpKdbxItems: YakpKdbxItem[], metadata: YakpMetadata) {
    const result = new ReadKdbxResult();
    result.yakpKdbxItems = yakpKdbxItems;
    result.yakpMetadata = metadata;
    return result;
  }
}
