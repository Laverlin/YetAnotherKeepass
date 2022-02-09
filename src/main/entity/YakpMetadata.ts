import { KdbxUuid } from 'kdbxweb';
import path from 'path';

export class YakpMetadata {
  constructor(kdbxFile: string, defaultGroupId: string, recycleId: string | undefined, recycleBinEnabled: boolean) {
    this.kdbxFile = kdbxFile;
    this.defaultGroupSid = defaultGroupId;
    this.recycleBinSid = recycleId;
    this.kdbxFileShort = path.basename(kdbxFile);
    this.isRecycleBinAvailable = !!this.recycleBinSid && this.recycleBinSid !== new KdbxUuid().id && recycleBinEnabled;
  }

  kdbxFile: string = '';

  kdbxFileShort: string = '';

  defaultGroupSid: string = '';

  recycleBinSid: string | undefined;

  isRecycleBinAvailable: boolean = false;
}
