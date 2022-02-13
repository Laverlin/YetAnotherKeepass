import { KdbxBinary } from 'kdbxweb';

export class BinariesChange {
  entrySid: string;

  name: string;

  data: KdbxBinary | undefined;

  constructor(entrySid: string, name: string, data?: KdbxBinary) {
    this.entrySid = entrySid;
    this.name = name;
    this.data = data;
  }
}
