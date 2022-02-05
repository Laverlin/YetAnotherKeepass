import path from 'path';

export class YakpMetadata {
  constructor(kdbxFile: string, defaultGroupSid: string, recycleBin: string | undefined) {
    this.kdbxFile = kdbxFile;
    this.defaultGroupSid = defaultGroupSid;
    this.recycleBinSid = recycleBin;
    this.kdbxFileShort = path.basename(kdbxFile);
  }

  kdbxFile: string = '';

  kdbxFileShort: string = '';

  defaultGroupSid: string = '';

  recycleBinSid: string | undefined;
}
