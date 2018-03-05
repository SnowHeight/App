import { Component } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Platform,
} from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ConnectPage } from '../connect/connect';
import { BridgeService } from '../../services/bridge.service';
import * as _ from 'lodash';

@Component({
  selector: 'page-configure',
  templateUrl: 'configure.html',
})
export class ConfigurePage {
  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private bluetooth: BluetoothSerial,
    private platform: Platform,
    private bridge: BridgeService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) {}

  _: any = _;
  name: string = null;
  interval: number = null;
  config: any = null;

  async loadConfig() {
    let loading = this.loadingCtrl.create({
      content: 'Reading config from device',
    });
    await loading.present();

    try {
      let settings = await this.bridge.executeCommandWithReturnValue(
        'settings',
        null,
      );
      this.config = this.bridge.parseConfig(settings);
      await loading.dismiss();
    } catch (e) {
      await loading.dismiss();
      await this.alertCtrl
        .create({
          title: 'Failed to read the settings from the device',
          buttons: ['Oh no'],
        })
        .present();
      this.navCtrl.setRoot(ConnectPage);
    }
  }

  async loadFakeConfig() {
    this.config = this.bridge.parseConfig(
      `[settings]BluetoothName=${
        this.name
      };BluetoothCode=1234;UltraSonicInterval=1;LaserInterval=10;Height=150;ServoDrivingTime=100;PowerSaveVoltage=12[/settings]`,
    );
  }

  async saveConfig() {
    try {
      let configString = this.bridge.configObjectToString(this.config);
      console.log(configString);
      await this.bridge.executeCommand('savesettings', configString);
      await this.alertCtrl
        .create({
          title: 'Saved config',
          buttons: ['Ok'],
        })
        .present();
    } catch (e) {
      await this.alertCtrl
        .create({
          title: 'Failed to save config',
          buttons: ['Oh no'],
        })
        .present();
    }
  }

  async ionViewDidLoad() {
    this.name = this.navParams.data.name;

    if (this.platform.is('cordova')) {
      await this.loadConfig();
    } else {
      this.loadFakeConfig();
    }
    this.interval = setInterval(async () => {
      if (this.platform.is('cordova')) {
        try {
          if (!await this.bluetooth.isConnected()) {
            console.log('no longer connected');
            this.loadingCtrl.create().dismissAll();
            await this.alertCtrl
              .create({
                title: 'Lost connection',
                buttons: ['Oh no'],
              })
              .present();
            this.navCtrl.setRoot(ConnectPage);
          } else {
            console.log('still connected');
          }
        } catch (e) {
          console.error('failed to check if we are still connected', e);
          this.loadingCtrl.create().dismissAll();
          await this.alertCtrl
            .create({
              title: 'Lost connection',
              buttons: ['Oh no'],
            })
            .present();
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

  async loadGeneralData() {
    let loading = this.loadingCtrl.create({
      content: 'Loading general data...',
    });
    await loading.present();
    try {
      let total = await this.bridge.executeCommandWithReturnValue(
        'gdata:length',
      );
      let loaded = 0;
      while (true) {
        loading.setContent(`Loading general data... (${loaded}/${total})`);
        let data = await this.bridge.executeCommandWithReturnValue('gdata');
        if (data) {
          let rows = data.trim().split('\n');
          if (rows.length) {
            if (this.bridge.rowsValid(rows)) {
              //TODO save data
              loaded += rows.length;
              await this.bridge.executeCommand('gdata:next');
            } else {
              //data not valid, request gdata again
            }
          } else {
            break;
          }
        } else {
          break;
        }
      }
    } catch (e) {}
    await loading.dismiss();
  }

  async loadLaserData() {
    this.bluetooth.write(this.bridge.textToUint8Array('[ldata]'));
  }

  async loadErrorLogs() {
    this.bluetooth.write(this.bridge.textToUint8Array('[elogs]'));
  }

  async disconnect() {
    clearInterval(this.interval);
    if (this.platform.is('cordova')) {
      try {
        await this.bluetooth.disconnect();
      } catch (e) {
        await this.alertCtrl
          .create({
            title: 'Failed to disconnect',
            buttons: ['Oh no'],
          })
          .present();
      }
    }
    this.navCtrl.setRoot(ConnectPage);
  }
}
