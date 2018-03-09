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

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  name: string = null;
  _: any = _;
  config: any = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public bridge: BridgeService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public translate: TranslateService
  ) {}

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
    this.config = this.bridge.parseConfig(
      `[settings]BluetoothName=${
        this.name
      };BluetoothCode=1234;UltraSonicInterval=1;LaserInterval=10;Height=150;ServoDrivingTime=100;PowerSaveVoltage=12[/settings]`
    );
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