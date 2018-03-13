import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BridgeService } from '../../services/bridge.service';
import * as _ from 'lodash';
import { GeneralDataEntry } from '../../services/model';
import { DataListPage } from './data-list/data-list';

@Component({
  selector: 'page-report',
  templateUrl: 'report.html'
})
export class ReportPage {
  transmissionChart = {
    scheme: {
      domain: ['#2ecc71', '#e74c3c']
    },
    data: null
  };

  context: any = null;
  duration: string;
  data: GeneralDataEntry[];
  oldestEntry: GeneralDataEntry;
  newestEntry: GeneralDataEntry;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public bridge: BridgeService
  ) {
    this.context = this.navParams.data;
    this.duration = Math.floor(this.context.duration / 1000).toString();
    this.data = _(this.context.rows)
      .map(this.bridge.parseGeneralDataEntry)
      .sort((o1, o2) => o1.date - o2.date)
      .value();
    this.oldestEntry = this.data[0];
    this.newestEntry = this.data[this.data.length - 1];
    this.transmissionChart.data = [
      {
        name: 'Success',
        value: this.context.totalRequests - this.context.failedRequests
      },
      {
        name: 'Error',
        value: this.context.failedRequests
      }
    ];
  }

  showDataList(key) {
    this.navCtrl.push(DataListPage, {
      data: this.data,
      key: key
    });
  }
}
