/* eslint-disable func-names */
import { ProtectedValue } from 'kdbxweb';
import { YakpKdbxItem } from './YakpKdbxItem';

export { YakpKdbxItem } from './YakpKdbxItem';

declare module './YakpKdbxItem' {
  export interface YakpKdbxItem {
    isExpired(): boolean;

    getIcon(): string;

    getFieldUnprotected(fieldName: string): string;

    removeHistoryEntry(index: number): void;
  }
}

/** Check if the item is expired now
 */
YakpKdbxItem.prototype.isExpired = function (this: YakpKdbxItem): boolean {
  return this.isExpires && (this.expiryTime?.valueOf() || 0) < Date.now();
};

YakpKdbxItem.prototype.getFieldUnprotected = function (this: YakpKdbxItem, fieldName: string): string {
  const field = this.fields[fieldName];
  return field instanceof ProtectedValue ? field.getText() : field.toString();
};

YakpKdbxItem.prototype.removeHistoryEntry = function (this: YakpKdbxItem, index: number): void {
  this.history.slice(index, 1);
};

type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

export class ItemHelper {
  static isExpired(item: YakpKdbxItem) {
    return item.isExpires && (item.expiryTime?.valueOf() || 0) < Date.now();
  }

  static stripProtected(fieldValue: ProtectedValue | string) {
    return fieldValue instanceof ProtectedValue ? fieldValue.getText() : fieldValue.toString();
  }

  static setField(item: YakpKdbxItem, field: string, value: string | ProtectedValue) {
    const cloned = this.clone(item);
    cloned.fields[field] = value;
    return cloned;
  }

  static clone(item: YakpKdbxItem): YakpKdbxItem {
    return { ...item, isChanged: true, fields: { ...item.fields } };
  }
  /*
  static removeHistoryEntry = function (item: YakpKdbxItem, index: number): void {

    this.history.slice(index, 1);
  };
  */
}
