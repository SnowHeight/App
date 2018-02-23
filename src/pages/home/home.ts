import { Component } from '@angular/core';
import { ModalController, NavController, Platform } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ConnectPage } from "../connect/connect";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, private modalCtrl: ModalController, private bluetooth: BluetoothSerial, private platform: Platform) {

  }

  text: string = '';

  ngOnInit() {

  }

  send() {
    this.bluetooth.write(this.text).then(data => {
      console.log('sent', data);
    }).catch(e => {
      console.log('send error', e);
    });
  }

  async showConnect() {
    if (this.platform.is('cordova') && !await this.bluetooth.isEnabled()) {
      console.log('bluetooth is not enabled');
      await this.bluetooth.enable();
    }
    let modal = this.modalCtrl.create(ConnectPage);
    modal.present();
    modal.onDidDismiss(data => {
      if (data && data.id) {
        console.log('connecting to ' + data.id);
        this.bluetooth.connect(data.id).toPromise().then(data => {
          console.log('connected', data);
        }).catch(e => {
          console.log('connect error', e);
        });
      }
    });
  }
}
