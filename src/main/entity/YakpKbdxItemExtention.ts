import { ProtectedValue } from 'kdbxweb';
import { YakpKdbxItem } from './YakpKdbxItem';

export class ItemHelper {
  static isExpired(item: YakpKdbxItem) {
    return item.isExpires && (item.expiryTime?.valueOf() || 0) < Date.now();
  }

  static stripProtection(fieldValue: ProtectedValue | string) {
    return fieldValue instanceof ProtectedValue ? fieldValue.getText() : fieldValue;
  }

  static setField(item: YakpKdbxItem, field: string, value: string | ProtectedValue) {
    // eslint-disable-next-line no-return-assign
    return this.apply(item, (i) => (i.fields[field] = value));
  }

  static clone(item: YakpKdbxItem): YakpKdbxItem {
    return { ...item, fields: { ...item.fields }, history: [...item.history], binaries: [...item.binaries] };
  }

  static apply(item: YakpKdbxItem, func: (item: YakpKdbxItem) => void) {
    const cloned = this.clone(item);
    cloned.isChanged = true;
    func(cloned);
    return cloned;
  }
}
