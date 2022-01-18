import fs from 'fs';
import path from 'path';
import electron from 'electron';

export interface ISetting {
  settingName: string;
}

/**
 * Base object to manipulate with application settings
 */
export class Setting {
  /** load setting data from file and return new entity of settings object
   * if file not found then defauld objec returns
   * @param settingType setting type object, must be derived from Setting
   */
  static load<T extends ISetting>(SettingType: new () => T): T {
    const setting = new SettingType();
    const filePath = this.createPath(`${setting.settingName}.json`);
    return fs.existsSync(filePath) ? Object.assign(setting, JSON.parse(fs.readFileSync(filePath, 'utf-8'))) : setting;
  }

  /** save setting data to file
   */
  static save<T extends ISetting>(setting: T) {
    const filePath = this.createPath(`${setting.settingName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(setting));
  }

  static createPath(fileName: string) {
    const userDataPath = electron.app.getPath('userData');
    return path.join(userDataPath, fileName);
  }
}
