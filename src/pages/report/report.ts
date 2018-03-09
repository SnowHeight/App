import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.context = this.navParams.data;
    this.duration = Math.floor(this.context.duration / 1000).toString();
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
}
