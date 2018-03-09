import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { File } from '@ionic-native/file';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ConnectPage } from '../pages/connect/connect';
import { ConfigurePage } from '../pages/configure/configure';
import { BridgeService } from '../services/bridge.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SettingsPage } from '../pages/settings/settings';
import { ReportPage } from '../pages/report/report';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '/translations.json');
}

@NgModule({
  declarations: [MyApp, ConnectPage, ConfigurePage, SettingsPage, ReportPage],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp),
    NgxChartsModule,
    BrowserAnimationsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ConnectPage,
    ConfigurePage,
    SettingsPage,
    ReportPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothSerial,
    BridgeService,
    File,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
