import { Component } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ConnectPage } from '../connect/connect';
import { BridgeService } from '../../services/bridge.service';
import * as _ from 'lodash';
import { File } from '@ionic-native/file';
import { SettingsPage } from '../settings/settingsf';

@Component({
  selector: 'page-configure',
  templateUrl: 'configure.html'
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
    private file: File
  ) {}

  _: any = _;
  name: string = null;
  interval: number = null;
  config: any = null;

  async ionViewDidLoad() {
    this.name = this.navParams.data.name;

    this.interval = setInterval(async () => {
      if (this.platform.is('cordova')) {
        try {
          if (!await this.bluetooth.isConnected()) {
            console.log('no longer connected');
            this.loadingCtrl.create().dismissAll();
            await this.alertCtrl
              .create({
                title: 'Lost connection',
                buttons: ['Oh no']
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
              buttons: ['Oh no']
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

  openSettings() {
    this.navCtrl.push(SettingsPage, {
      name: this.name
    });
  }

  async saveRows(filename, rows) {
    try {
      await this.file.createFile(
        this.file.externalDataDirectory,
        filename,
        false
      );
    } catch (e) {}
    console.log(
      _.map(rows, row => row.substring(0, row.lastIndexOf('@'))).join('\n') +
        '\n'
    );
    await this.file.writeFile(
      this.file.externalDataDirectory,
      filename,
      _.map(rows, row => row.substring(0, row.lastIndexOf('@'))).join('\n') +
        '\n',
      {
        append: true,
        replace: false
      }
    );
    console.log('wrote file');
  }

  async loadGeneralData() {
    let loading = this.loadingCtrl.create({
      content: 'Loading general data...'
    });
    await loading.present();
    try {
      let total = await this.bridge.executeCommandWithReturnValue(
        'gdata:length'
      );
      let loaded = 0;
      while (true) {
        loading.setContent(`Loading general data... (${loaded}/${total})`);
        let data = await this.bridge.executeCommandWithReturnValue('gdata');
        if (data) {
          let rows = data.trim().split('\n');
          if (rows.length) {
            if (this.bridge.rowsValid(rows)) {
              await this.saveRows('gdata.csv', rows);
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
    } catch (e) {
      console.error('something went wrong', e);
    }
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
            buttons: ['Oh no']
          })
          .present();
      }
    }
    this.navCtrl.setRoot(ConnectPage);
  }
}
