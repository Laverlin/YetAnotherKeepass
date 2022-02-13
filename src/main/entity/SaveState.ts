export class SaveState {
  isSuccess: boolean;

  errorMessage: string = '';

  itemsUpdated: number = 0;

  iconsAdded: number = 0;

  iconsDeleted: number = 0;

  binariesAdded: number = 0;

  binariesDeleted: number = 0;

  constructor(isSuccess: boolean) {
    this.isSuccess = isSuccess;
  }
}
