import { Kdbx, KdbxEntry, KdbxGroup, KdbxUuid, ProtectedValue } from 'kdbxweb';

const checkIfRecycled = (kdbxItem: KdbxEntry | KdbxGroup, recycleBinUuid: KdbxUuid | undefined) => {
  if (!recycleBinUuid) return false;
  let parent = kdbxItem.parentGroup;
  while (parent) {
    if (parent.uuid.equals(recycleBinUuid)) return true;
    parent = parent.parentGroup;
  }
  return false;
};

export class YakpKdbxItem {
  static fromKdbx(kdbxItem: KdbxEntry | KdbxGroup, database: Kdbx) {
    const item = new YakpKdbxItem();
    item.sid = kdbxItem.uuid.id;
    item.parentSid = kdbxItem.parentGroup?.uuid.id;
    item.isGroup = kdbxItem instanceof KdbxGroup;
    item.isDefaultGroup = database.getDefaultGroup().uuid.equals(kdbxItem.uuid);
    item.isRecycleBin = kdbxItem.uuid.equals(database.meta.recycleBinUuid);
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
        item.fields[key] = value;
      });
    } else {
      item.fields.Notes = (kdbxItem as KdbxGroup).notes || '';
    }

    item.isRecycled = checkIfRecycled(kdbxItem, database.meta.recycleBinUuid);
    item.groupSortOrder = kdbxItem.parentGroup?.groups.findIndex((i) => i.uuid.equals(kdbxItem.uuid)) || 0;

    if (kdbxItem instanceof KdbxEntry) {
      kdbxItem.history.forEach((i) => item.history.push(YakpKdbxItem.fromKdbx(i, database)));
    }

    return item;
  }

  /**
   * is there any changes since last save
   */
  isChanged: boolean = false;

  /**
   * is this item selected
   */
  isSelected: boolean = false;

  /** Readonly unique identifier of entity
   */
  sid: string = KdbxUuid.random().toString();

  /** Readonly unique identifier of parent entity
   */
  parentSid: string | undefined;

  /** Sorting index for groups
   */
  groupSortOrder: number = 0;

  /** Is this entity Group of entities
   */
  isGroup: boolean = false;

  /** Is this entry a default group
   */
  isDefaultGroup: boolean = false;

  /** Is this entry a recycle bin
   */
  isRecycleBin: boolean = false;

  /** is this item an artifitial AllItemsGroup
   */
  isAllItemsGroup: boolean = false;

  /** if this item is in Recycled
   */
  isRecycled: boolean = false;

  /** return Title/name of entitiy
   */
  title: string = '';

  /** defalult Icon
   */
  defaultIconId: number = 0;

  /** returns true if this instance has setted expiration time
   */
  isExpires: boolean = false;

  /** Get or Set the expiration time
   */
  expiryTime: Date | undefined;

  bgColor: string = '';

  customIconSid: string | undefined;

  tags: string[] = [];

  binaries: string[] = [];

  lastModifiedTime: Date = new Date();

  creationTime: Date = this.lastModifiedTime;

  lastAccessTime: Date = this.lastModifiedTime;

  usageCount: number = 0;

  history: YakpKdbxItem[] = [];

  fields: Record<string, string | ProtectedValue> = {};

  hasPassword: boolean = false;
}

export const allItemsGroupSid = 'all-items-group-id';
export const allItemsGroup = new YakpKdbxItem();
allItemsGroup.isAllItemsGroup = true;
allItemsGroup.isGroup = true;
allItemsGroup.sid = allItemsGroupSid;
allItemsGroup.title = 'All Items';
