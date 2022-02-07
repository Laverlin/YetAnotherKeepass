import { KdbxUuid, ProtectedValue } from 'kdbxweb';

export class YakpKdbxItem {
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
  groupSortOrder: number = -100;

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
