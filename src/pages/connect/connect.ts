import {Component} from '@angular/core';
import {LoadingController, NavController, Platform, ViewController} from 'ionic-angular';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial';

@Component({
  selector: 'page-home',
  templateUrl: 'connect.html'
})
export class ConnectPage {

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, private bluetooth: BluetoothSerial, private platform: Platform, private loadingCtrl: LoadingController) {

  }

  devices: any[] = [];

  connect(device) {
    this.viewCtrl.dismiss({id: device.id})
  }

  ngOnInit() {
    if (this.platform.is('cordova')) {
      let loading = this.loadingCtrl.create({
        content: 'Discovering available devices...'
      });
      loading.present();
      this.bluetooth.list().then((data) => {
        this.devices = data;
        loading.dismiss();
      }).catch(e => {
        //TODO display error message
      });
    } else {
      //if we are debugging/testing the app in the browser we want at least one device for testing
      this.devices = [{
        name: 'test',
        id: '12:34:56:78:9A:BC'
      }];
    }
  }

}
