import { Component, ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { ConnectPage } from '../pages/connect/connect';
import { TranslateService } from '@ngx-translate/core';
import { File } from '@ionic-native/file';
import { Nav, Platform } from 'ionic-angular';
import {BluetoothSerial} from "@ionic-native/bluetooth-serial";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = ConnectPage;

  pages: Array<{ title: string; component: any }>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public translate: TranslateService,
    public file: File,
    public bluetooth: BluetoothSerial
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(translate.getBrowserLang() || 'en');

    this.initializeApp();

    if(this.platform.is('cordova')) {
      this.bluetooth.subscribeRawData().subscribe(data => {
        let arr = new Uint8Array(data);
        let s = '';
        for (let i = 0; i < arr.length; i++) {
          s += String.fromCharCode(arr[i]);
        }
        console.log('raw', s);
        document.getElementById('log').innerText += s;
      });
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
