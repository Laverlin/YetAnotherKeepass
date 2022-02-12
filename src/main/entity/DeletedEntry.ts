export class DeletedEntry {
  entrySid: string;

  deletedIndex: number;

  constructor(entrySid: string, deletedIndex: number) {
    this.entrySid = entrySid;
    this.deletedIndex = deletedIndex;
  }
}
