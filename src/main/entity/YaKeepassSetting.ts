import { Rectangle } from 'electron';
import { RenderSetting } from './RenderSetting';
import { ISetting } from './Setting';

export class YaKeepassSetting implements ISetting {
  // eslint-disable-next-line class-methods-use-this
  get settingName(): string {
    return 'YaKeepassSetting';
  }

  windowSize: Rectangle = {
    width: 1450,
    height: 800,
    x: 100,
    y: 100,
  };

  renderSetting: RenderSetting = new RenderSetting();
}
