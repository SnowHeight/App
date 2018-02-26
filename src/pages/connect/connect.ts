import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController, Platform} from 'ionic-angular';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial';
import {ConfigurePage} from "../configure/configure";

@Component({
  selector: 'page-home',
  templateUrl: 'connect.html'
})
export class ConnectPage {

  constructor(private alertCtrl: AlertController
    , public navCtrl: NavController
    , private bluetooth: BluetoothSerial
    , private platform: Platform
    , private loadingCtrl: LoadingController) {

  }

  devices: any[] = [];

  async connect(device) {
    console.log('connecting to ' + device.id);
    let loading = this.loadingCtrl.create({
      content: 'Connecting'
    });
    await loading.present();
    this.bluetooth.connect(device.id).subscribe(async status => {
      console.log('connected', status);
      await loading.dismiss();
      this.navCtrl.setRoot(ConfigurePage, {
        name: device.name
      });
    }, async error => {
      console.error('failed to connect', error);
      await loading.dismiss();
      await this.alertCtrl.create({
        title: 'Failed to connect',
        buttons: ['Oh no']
      }).present();
    });
  }

  async loadDevices() {
    let loading = this.loadingCtrl.create({
      content: 'Discovering available devices...'
    });
    await loading.present();
    this.bluetooth.list().then((device) => {
      this.devices = device;
      loading.dismiss();
    }).catch(e => {
      //TODO display error message
    });
  }

  ngOnInit() {
    if (this.platform.is('cordova')) {
      this.loadDevices();
    } else {
      //if we are debugging/testing the app in the browser we want at least one device for testing
      this.devices = [{
        name: 'test',
        id: '12:34:56:78:9A:BC'
      }];
    }
  }

}
