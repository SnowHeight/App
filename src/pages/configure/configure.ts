import {Component} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController, NavParams, Platform} from 'ionic-angular';
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";
import {ConnectPage} from "../connect/connect";
import {BridgeService} from "../../services/bridge.service";
import * as _ from "lodash";

@Component({
  selector: 'page-configure',
  templateUrl: 'configure.html',
})
export class ConfigurePage {

  constructor(public navCtrl: NavController
    , private navParams: NavParams
    , private modalCtrl: ModalController
    , private bluetooth: BluetoothSerial
    , private platform: Platform
    , private bridge: BridgeService
    , private loadingCtrl: LoadingController
    , private alertCtrl: AlertController) {

  }

  _: any = _;
  name: string = null;
  interval: number = null;
  config: any = null;

  async readConfig() {
    try {
      let loading = this.loadingCtrl.create({
        content: 'Reading config from device'
      });
      await loading.present();
      await this.bluetooth.write(this.bridge.textToUint8Array('[settings]'));
      let subscriber = this.bluetooth.subscribe('[/settings]').subscribe(async configRaw => {
        if (configRaw.indexOf('[settings]') > -1 && configRaw.indexOf('[/settings]') > -1) {
          subscriber.unsubscribe();
          configRaw = configRaw
            .substring(configRaw.lastIndexOf('[settings]'))
            .replace('[settings]', '')
            .replace('[/settings]', '');
          this.config = this.bridge.parseConfig(configRaw);
          await loading.dismiss();
        } else {
          await this.alertCtrl.create({
            title: 'Failed to read the settings from the device',
            buttons: ['Oh no']
          }).present();
          this.navCtrl.setRoot(ConnectPage);
        }
      });
    } catch (e) {

    }
  }

  async saveConfig() {
    try {
      let configString = this.bridge.configObjectToString(this.config);
      console.log(configString);
      await this.bluetooth.write(this.bridge.textToUint8Array(configString));
      await this.alertCtrl.create({
        title: 'Saved config',
        buttons: ['Ok']
      }).present();
    } catch(e) {
      await this.alertCtrl.create({
        title: 'Failed to save config'
      }).present();
    }
  }

  async ionViewDidLoad() {
    this.name = this.navParams.data.name;
    await this.readConfig();
    this.interval = setInterval(async () => {
      if (this.platform.is('cordova')) {
        try {
          if (!await this.bluetooth.isConnected()) {
            console.log('no longer connected');
            this.loadingCtrl.create().dismissAll();
            await this.alertCtrl.create({
              title: 'Lost connection',
              buttons: ['Oh no']
            }).present();
            this.navCtrl.setRoot(ConnectPage);
          } else {
            console.log('still connected');
          }
        } catch (e) {
          console.error('failed to check if we are still connected', e);
          this.loadingCtrl.create().dismissAll();
          await this.alertCtrl.create({
            title: 'Lost connection',
            buttons: ['Oh no']
          }).present();
          this.navCtrl.setRoot(ConnectPage);
        }
      }
    }, 2000);
  }

  ionViewWillLeave() {
    console.log('clearing interval');
    if (this.interval) {
      clearInterval(this.interval);
    }
    try {
      if (this.platform.is('cordova')) {
        this.bluetooth.disconnect();
      }
    } catch (e) {
      console.log('failed to disconnect on leave');
    }
  }

  async disconnect() {
    clearInterval(this.interval);
    if (this.platform.is('cordova')) {
      try {
        await this.bluetooth.disconnect();
        this.navCtrl.setRoot(ConnectPage);
      } catch (e) {
        await this.alertCtrl.create({
          title: 'Failed to disconnect',
          buttons: ['Oh no']
        }).present();
        this.navCtrl.setRoot(ConnectPage);
      }
    }
  }
}
