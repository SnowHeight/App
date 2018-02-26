import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial';

import {MyApp} from './app.component';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {ConnectPage} from "../pages/connect/connect";
import {ConfigurePage} from "../pages/configure/configure";
import {BridgeService} from "../services/bridge.service";

@NgModule({
  declarations: [
    MyApp,
    ConnectPage,
    ConfigurePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ConnectPage,
    ConfigurePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothSerial,
    BridgeService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
