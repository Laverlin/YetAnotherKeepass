import { Kdbx, KdbxEntry, KdbxEntryField, KdbxGroup, KdbxUuid, ProtectedValue } from 'kdbxweb';
import { YakpHistoryItem } from './YakpHistoryItem';
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

  static CreateItem(parentSid: string, isGroup: boolean, title = '') {
    const newItem = new YakpKdbxItem();
    newItem.sid = KdbxUuid.random().id;
    newItem.parentSid = parentSid;
    newItem.isGroup = isGroup;
    newItem.title = title;
    newItem.isChanged = true;
    return newItem;
  }

  static fromSerialized(serializedItem: YakpKdbxItem) {
    let item = new YakpKdbxItem();
    item = Object.assign(item, serializedItem);
    Object.keys(serializedItem.fields).forEach((f) => {
      const field = item.fields[f] as ProtectedValue;
      item.fields[f] =
        !!field.salt && !!field.value ? new ProtectedValue(field.value, field.salt) : serializedItem.fields[f];
    });
    item.binaries = [...serializedItem.binaries];
    return item;
  }

  static fromSerializedHistory(serializedItem: YakpHistoryItem) {
    return this.fromSerialized(serializedItem) as YakpHistoryItem;
  }

  static fromKdbx(kdbxItem: KdbxEntry | KdbxGroup, database?: Kdbx) {
    const item = new YakpKdbxItem();
    item.sid = kdbxItem.uuid.id;
    item.parentSid = kdbxItem.parentGroup?.uuid.id;
    item.isGroup = kdbxItem instanceof KdbxGroup;
    item.isDefaultGroup = database?.getDefaultGroup().uuid.equals(kdbxItem.uuid) || false;
    item.isRecycleBin = kdbxItem.uuid.equals(database?.meta.recycleBinUuid);
    item.title = (kdbxItem instanceof KdbxGroup ? kdbxItem.name : kdbxItem.fields.get('Title'))?.toString() || '';
    item.defaultIconId = kdbxItem.icon || 0;
    item.isExpires = kdbxItem.times.expires || false;
    item.expiryTime = kdbxItem.times.expiryTime;
    item.bgColor = (kdbxItem instanceof KdbxEntry && kdbxItem.bgColor) || '';
    item.customIconSid = kdbxItem.customIcon?.id;
    item.tags = kdbxItem.tags;
    item.binaries = (kdbxItem instanceof KdbxEntry && Array.from(kdbxItem.binaries.keys())) || [];
    item.lastModifiedTime = kdbxItem.times.lastModTime || new Date();
    item.lastAccessTime = kdbxItem.times.lastAccessTime || item.lastModifiedTime;
    item.creationTime = kdbxItem.times.creationTime || item.lastModifiedTime;
    item.usageCount = kdbxItem.times.usageCount || 0;
    item.hasPassword = kdbxItem instanceof KdbxEntry && !!kdbxItem.fields.get('Password');
    if (!item.isGroup) {
      (kdbxItem as KdbxEntry).fields.forEach((value, key) => {
        if (key !== 'Title') item.fields[key] = value;
      });
    } else {
      item.fields.Notes = (kdbxItem as KdbxGroup).notes || '';
    }

    item.isRecycled = !!database && this.checkIfRecycled(kdbxItem, database.meta.recycleBinUuid);
    if (item.isGroup)
      item.groupSortOrder = kdbxItem.parentGroup?.groups.findIndex((i) => i.uuid.equals(kdbxItem.uuid)) || 0;

    return item;
  }

  static fromKdbxHistory(kdbxEntry: KdbxEntry, index: number) {
    const item = this.fromKdbx(kdbxEntry) as YakpHistoryItem;
    item.historyIndex = index;
    return item;
  }

  static toKdbx(yakpItem: YakpKdbxItem, database: Kdbx, items: YakpKdbxItem[]) {
    const allKdbxItems = Array.from(database.getDefaultGroup().allGroupsAndEntries());

    let kdbxItem = allKdbxItems.find((i) => i.uuid.id === yakpItem.sid);
    if (!kdbxItem) {
      kdbxItem = yakpItem.isGroup
        ? database.createGroup(this.getParent(yakpItem, allKdbxItems, items, database), yakpItem.title)
        : database.createEntry(this.getParent(yakpItem, allKdbxItems, items, database));
      kdbxItem.uuid = new KdbxUuid(yakpItem.sid);
    } else {
      kdbxItem.times.update();
      if (kdbxItem instanceof KdbxEntry) kdbxItem.pushHistory();
    }

    if (kdbxItem instanceof KdbxEntry) {
      kdbxItem.bgColor = yakpItem.bgColor;
      const fieldMap = new Map<string, KdbxEntryField>();
      Object.keys(yakpItem.fields).forEach((key) => fieldMap.set(key, yakpItem.fields[key]));
      kdbxItem.fields = fieldMap;
      kdbxItem.fields.set('Title', yakpItem.title);
    } else {
      kdbxItem.name = yakpItem.title;
      kdbxItem.notes = yakpItem.fields.Notes?.toString();
    }
    kdbxItem.customIcon = yakpItem.customIconSid ? new KdbxUuid(yakpItem.customIconSid) : undefined;
    kdbxItem.icon = yakpItem.defaultIconId;
    kdbxItem.tags = yakpItem.tags;
    kdbxItem.times.expires = yakpItem.isExpires;
    kdbxItem.times.expiryTime = yakpItem.expiryTime;
    if (!yakpItem.isDefaultGroup) database.move(kdbxItem, this.getParent(yakpItem, allKdbxItems, items, database));
    return kdbxItem;
  }

  static reorderSiblings(parentSid: string, items: YakpKdbxItem[], database: Kdbx) {
    const allGroups = Array.from(database.getDefaultGroup().allGroups());
    const parentGroup = allGroups.find((g) => g.uuid.id === parentSid);
    if (!parentGroup) return;
    const siblings = items
      .filter((i) => i.parentSid === parentSid && i.isGroup)
      .sort((a, b) => a.groupSortOrder - b.groupSortOrder);
    siblings.forEach((item, index) => {
      const kdbxItem = allGroups.find((i) => i.uuid.id === item.sid);
      if (!kdbxItem) return;
      database.move(kdbxItem, parentGroup, index);
    });
  }

  private static getParent = (
    item: YakpKdbxItem,
    allKdbxItems: (KdbxEntry | KdbxGroup)[],
    items: YakpKdbxItem[],
    database: Kdbx
  ) => {
    if (!item.parentSid) throw Error('Parent is empty');
    let parent = allKdbxItems.find((g) => g.uuid.id === item.parentSid) as KdbxGroup;
    if (parent) return parent;
    const itemParent = items.find((i) => i.sid === item.parentSid);
    if (!itemParent) throw Error('Cant find parent');
    parent = database.createGroup(this.getParent(itemParent, allKdbxItems, items, database), itemParent.title);
    parent.uuid = new KdbxUuid(itemParent.sid);
    return parent;
  };

  private static checkIfRecycled = (kdbxItem: KdbxEntry | KdbxGroup, recycleBinUuid: KdbxUuid | undefined) => {
    if (!recycleBinUuid) return false;
    let parent = kdbxItem.parentGroup;
    while (parent) {
      if (parent.uuid.equals(recycleBinUuid)) return true;
      parent = parent.parentGroup;
    }
    return false;
  };
}
