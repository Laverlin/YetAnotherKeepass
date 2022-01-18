import { KdbxGroup } from 'kdbxweb';
import { YakpError } from './YakpError';

export class ReadKdbxResult {
  kdbxGroup: KdbxGroup | undefined;

  kdbxFile: string = '';

  yakpError: YakpError | undefined;

  static fromError(error: YakpError) {
    const result = new ReadKdbxResult();
    result.yakpError = error;
    return result;
  }

  static fromResult(group: KdbxGroup, kdbxFile: string) {
    const result = new ReadKdbxResult();
    result.kdbxGroup = group;
    result.kdbxFile = kdbxFile;
    return result;
  }
}
