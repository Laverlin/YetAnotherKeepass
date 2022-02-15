export class BinariesChange {
  entrySid: string;

  name: string;

  data: Buffer | undefined; // KdbxBinary | undefined;

  constructor(entrySid: string, name: string, data?: Buffer) {
    this.entrySid = entrySid;
    this.name = name;
    this.data = data;
  }
}
