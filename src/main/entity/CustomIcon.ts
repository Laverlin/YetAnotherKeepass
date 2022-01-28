import { KdbxCustomIcon, KdbxUuid } from 'kdbxweb';

const image2Base64 = (image: Buffer | ArrayBuffer) => {
  const data = image instanceof Buffer ? image : Buffer.from(image);
  return `data:image;base64,${data.toString('base64')}`;
};

export class CustomIcon {
  static fromKdbxIcon(key: string, kdbxIcon: KdbxCustomIcon) {
    const customIcon = new CustomIcon();
    customIcon.b64image = image2Base64(kdbxIcon.data);
    customIcon.key = key; // kdbxIcon.name || '';
    customIcon.size = kdbxIcon.data.byteLength;
    return customIcon;
  }

  static fromFile(data: Buffer) {
    const customIcon = new CustomIcon();
    customIcon.b64image = image2Base64(data);
    customIcon.key = KdbxUuid.random().id;
    customIcon.size = data.byteLength;
    return customIcon;
  }

  key: string = '';

  b64image: string = '';

  size: number = 0;
}
