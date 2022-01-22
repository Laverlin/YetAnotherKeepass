export class YakpMetadata {
  constructor(kdbxFile: string, defaultGroupSid: string, recycleBin: string | undefined) {
    this.kdbxFile = kdbxFile;
    this.defaultGroupSid = defaultGroupSid;
    this.recycleBinSid = recycleBin;
  }

  kdbxFile: string = '';

  defaultGroupSid: string = '';

  recycleBinSid: string | undefined;
}
