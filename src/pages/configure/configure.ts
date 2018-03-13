import { Component } from '@angular/core';
import {
  AlertController,
  LoadingController,
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ConnectPage } from '../connect/connect';
import { BridgeService } from '../../services/bridge.service';
import * as _ from 'lodash';
import { File } from '@ionic-native/file';
import { SettingsPage } from '../settings/settings';
import { ReportPage } from '../report/report';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';

@Component({
  selector: 'page-configure',
  templateUrl: 'configure.html'
})
export class ConfigurePage {
  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    private bluetooth: BluetoothSerial,
    private platform: Platform,
    private bridge: BridgeService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private file: File
  ) {}

  _: any = _;
  name: string = null;
  interval: number = null;
  config: any = null;

  async ionViewDidLoad() {
    this.name = this.navParams.data.name;

    if (this.platform.is('cordova')) {
      let dateString = moment()
        .utc()
        .format('YYYY-MM-d-DD-HH-mm-ss'.replace(/-/g, ''));
      await this.bridge.executeCommand('setdate', dateString);
    }

    this.interval = setInterval(async () => {
      if (this.platform.is('cordova')) {
        try {
          if (!await this.bluetooth.isConnected()) {
            console.log('no longer connected');
            this.loadingCtrl.create().dismissAll();
            await this.alertCtrl
              .create({
                title: await this.translate
                  .get('configure.lostConnection')
                  .toPromise(),
                buttons: [
                  await this.translate.get('generic.confirm').toPromise()
                ]
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
              title: await this.translate
                .get('configure.lostConnection')
                .toPromise(),
              buttons: [await this.translate.get('generic.confirm').toPromise()]
            })
            .present();
          this.navCtrl.setRoot(ConnectPage);
        }
      }
    }, 2000);
  }

  openSettings() {
    this.navCtrl.push(SettingsPage, {
      name: this.name
    });
  }

  async saveRows(filename, rows) {
    try {
      await this.file.createDir(
        this.file.externalDataDirectory,
        this.name,
        false
      );
    } catch (e) {}

    try {
      await this.file.createFile(
        this.file.externalDataDirectory + '/' + this.name,
        filename,
        false
      );
    } catch (e) {}

    await this.file.writeFile(
      this.file.externalDataDirectory + '/' + this.name,
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
    if (!this.platform.is('cordova')) {
      let count = 25321;
      this.navCtrl.push(ReportPage, {
        aborted: false,
        loadedRows: count,
        availableRows: count,
        rows: await this.bridge.generateGeneralData(count),
        failedRequests: 2,
        totalRequests: 25,
        duration: 65321
      });
      return;
    }

    let loading = this.loadingCtrl.create({
      content: 'Loading general data...'
    });
    await loading.present();

    let start = Date.now();

    //amount of lines that were loaded
    let loadedRows = 0;
    let totalRequests = 0;
    let failedRequests = 0;

    //if we aborted the transmission in case of too many errors/inconsistencies
    let aborted = false;

    //all the rows we transmitted (after every transmission the transmitted rows are persisted and added to this array for later analysis)y
    let allRows = [];

    let availableRows = null;

    try {
      availableRows = await this.bridge.executeCommandWithReturnValue(
        'gdata:length'
      );
    } catch (e) {
      await this.alertCtrl
        .create({
          title: await this.translate
            .get('configure.availableRowsError')
            .toPromise(),
          buttons: [await this.translate.get('generic.confirm').toPromise()]
        })
        .present();
      return;
    }

    try {
      while (true) {
        loading.setContent(
          `Loading general data... (${loadedRows}/${availableRows})`
        );
        totalRequests++;
        let data = await this.bridge.executeCommandWithReturnValue('gdata');
        if (data) {
          let rows = data.trim().split('\n');
          allRows = allRows.concat(rows);
          if (rows.length) {
            if (this.bridge.rowsValid(rows)) {
              await this.saveRows('gdata.csv', rows);
              loadedRows += rows.length;
              await this.bridge.executeCommand('gdata:next');
            } else {
              failedRequests++;
              if (failedRequests > 10) {
                aborted = true;
                break;
              }
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
    this.navCtrl.push(ReportPage, {
      aborted: aborted,
      loadedRows: loadedRows,
      availableRows: availableRows,
      rows: allRows,
      failedRequests: failedRequests,
      totalRequests: totalRequests,
      duration: Date.now() - start
    });
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
      } catch (e) {}
    }
    this.navCtrl.setRoot(ConnectPage);
  }
}
