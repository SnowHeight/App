import { Component } from '@angular/core';
import {
  AlertController,
  LoadingController,
  NavController,
  Platform
} from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ConfigurePage } from '../configure/configure';
import { File } from '@ionic-native/file';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-home',
  templateUrl: 'connect.html'
})
export class ConnectPage {
  constructor(
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    private bluetooth: BluetoothSerial,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private file: File,
    private translate: TranslateService
  ) {}

  devices: any[] = [];

  async connect(device) {
    let loading = this.loadingCtrl.create({
      content: await this.translate.get('connect.connecting').toPromise()
    });
    await loading.present();
    if (this.platform.is('cordova')) {
      this.bluetooth.connect(device.id).subscribe(
        async status => {
          await loading.dismiss();
          this.navCtrl.setRoot(ConfigurePage, {
            name: device.name
          });
        },
        async error => {
          console.error('failed to connect', error);
          await loading.dismiss();
          await this.alertCtrl
            .create({
              title: await this.translate
                .get('connect.connectingError')
                .toPromise(),
              buttons: ['Ok']
            })
            .present();
        }
      );
    } else {
      setTimeout(async () => {
        await loading.dismiss();
        this.navCtrl.setRoot(ConfigurePage, {
          name: device.name
        });
      }, 1500);
    }
  }

  async loadDevices() {
    let loading = this.loadingCtrl.create({
      content: await this.translate.get('connect.loading').toPromise()
    });
    await loading.present();
    this.bluetooth
      .list()
      .then(device => {
        this.devices = device;
        loading.dismiss();
      })
      .catch(e => {
        //TODO display error message
      });
  }

  async openSettings() {
    await this.bluetooth.showBluetoothSettings();
  }

  ngOnInit() {
    if (this.platform.is('cordova')) {
      this.loadDevices();
    } else {
      //if we are debugging/testing the app in the browser we want at least one device for testing
      this.devices = [
        {
          name: 'Snow Height - Pitztal 2',
          id: '34:56:78:9A:BC:DE'
        },
        {
          name: 'Snow Height - Pitztal 5',
          id: '12:34:56:78:9A:BC'
        },
        {
          name: 'Snow Height - Stubai 3',
          id: '56:78:9A:BC:12:34'
        },
        {
          name: 'Snow Height - Hintertux 1',
          id: 'BC:56:78:9A:12:34'
        },
        {
          name: 'Snow Height - Sölden 2',
          id: '12:34:56:78:9A:BC'
        }
      ];
    }
  }
}
