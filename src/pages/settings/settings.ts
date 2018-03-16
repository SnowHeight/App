import { Component } from '@angular/core';
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';
import { BridgeService } from '../../services/bridge.service';
import { ConnectPage } from '../connect/connect';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

enum SettingType {
  STRING, NUMBER, BOOLEAN
}

interface Setting {
  name: string;
  type: SettingType;
  defaultValue?: any;
}

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  name: string = null;
  _: any = _;
  config: any = null;
  settings: Setting[];
  SettingType = SettingType;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public bridge: BridgeService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public translate: TranslateService
  ) {
    this.settings = [
      {
        name: "ModuleName",
        type: SettingType.STRING,
        defaultValue: 'SnowHeight - ChangeMe'
      },
      {
        name: "BluetoothPin",
        type: SettingType.NUMBER,
        defaultValue: 1234
      },
      {
        name: "Version",
        type: SettingType.STRING,
        defaultValue: '1.0'
      },
      {
        name: "SerialNr",
        type: SettingType.STRING,
        defaultValue: '123456'
      },
      {
        name: "Height",
        type: SettingType.NUMBER,
        defaultValue: 150
      },
      {
        name: "UltraSonicDelay",
        type: SettingType.NUMBER,
        defaultValue: 10
      },
      {
        name: "LaserDelay",
        type: SettingType.NUMBER,
        defaultValue: 60
      },
      {
        name: "ServoDrivingTime",
        type: SettingType.NUMBER,
        defaultValue: 200
      },
      {
        name: "Watchdog",
        type: SettingType.BOOLEAN,
        defaultValue: "true"
      },
      {
        name: "PowerSaveVoltage",
        type: SettingType.NUMBER,
        defaultValue: 6
      },
      {
        name: "CountLasermeasurements",
        type: SettingType.NUMBER,
        defaultValue: 10
      }
    ]
  }

  async ionViewDidLoad() {
    this.name = this.navParams.get('name');

    if (this.platform.is('cordova')) {
      await this.loadConfig();
    } else {
      this.loadFakeConfig();
    }
  }

  async loadConfig() {
    let loading = this.loadingCtrl.create({
      content: await this.translate.get('settings.loading').toPromise()
    });
    await loading.present();

    try {
      let settings = await this.bridge.executeCommandWithReturnValue(
        'settings',
        null
      );
      this.config = this.bridge.parseConfig(settings);
      await loading.dismiss();
    } catch (e) {
      await loading.dismiss();
      await this.alertCtrl
        .create({
          title: await this.translate.get('settings.loadError').toPromise(),
          buttons: [await this.translate.get('generic.confirm').toPromise()]
        })
        .present();
      this.navCtrl.setRoot(ConnectPage);
    }
  }

  async loadFakeConfig() {
    let settings = `[settings]ModuleName=${this.name};` +
      'BluetoothPin=1234;' +
      'Version=1;' +
      'SerialNr=10;' +
      'Height=150;' +
      'UltraSonicDelay=100;' +
      'LaserDelay=12;' +
      'ServoDrivingTime=12;' +
      'Watchdog=true;' +
      'PowerSaveVoltage=12;' +
      'CountLasermeasurements=50' +
      '[/settings]';
    this.config = this.bridge.parseConfig(settings);
  }

  async saveConfig() {
    try {
      let configString = this.bridge.configObjectToString(this.config);
      console.log(configString);
      await this.bridge.executeCommand('savesettings', configString);
      await this.alertCtrl
        .create({
          title: await this.translate.get('settings.saveSuccess').toPromise(),
          buttons: [await this.translate.get('generic.confirm').toPromise()]
        })
        .present();
    } catch (e) {
      await this.alertCtrl
        .create({
          title: await this.translate.get('settings.saveError').toPromise(),
          buttons: [await this.translate.get('generic.confirm').toPromise()]
        })
        .present();
    }
  }
}
