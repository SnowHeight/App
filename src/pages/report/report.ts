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

  tempChart = {
    scheme: {
      domain: ['#00a2ff']
    },
    data: null
  };

  humidityChart = {
    scheme: {
      domain: ['#1eff00']
    },
    data: null
  };

  pressureChart = {
    scheme: {
      domain: ['#fbff00']
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

    this.tempChart.data = [
      {
        name: '°C',
        "series": [
          {
            "name": '2022-5-25 11:48:30',
            "value": 5
          },
          {
            "name": '2022-5-25 11:49:30',
            "value": 4
          },
          {
            "name": '2022-5-25 11:50:30',
            "value": 7
          },
          {
            "name": '2022-5-25 11:51:30',
            "value": 8
          },
          {
            "name": '2022-5-25 11:52:30',
            "value": 5
          },
          {
            "name": '2022-5-25 11:53:30',
            "value": 5
          },
          {
            "name": '2022-5-25 11:54:30',
            "value": 6
          },
          {
            "name": '2022-5-25 11:55:30',
            "value": 1
          },
          {
            "name": '2022-5-25 11:56:30',
            "value": 0
          },
          {
            "name": '2022-5-25 11:57:30',
            "value": -3
          }
        ]
      }
    ];
    this.humidityChart.data = [
      {
        name: '%',
        "series": [
          {
            "name": '2022-5-25 11:48:30',
            "value": 51
          },
          {
            "name": '2022-5-25 11:49:30',
            "value": 50
          },
          {
            "name": '2022-5-25 11:50:30',
            "value": 51
          },
          {
            "name": '2022-5-25 11:51:30',
            "value": 53
          },
          {
            "name": '2022-5-25 11:52:30',
            "value": 55
          },
          {
            "name": '2022-5-25 11:53:30',
            "value": 54
          },
          {
            "name": '2022-5-25 11:54:30',
            "value": 53
          },
          {
            "name": '2022-5-25 11:55:30',
            "value": 52
          },
          {
            "name": '2022-5-25 11:56:30',
            "value": 51
          },
          {
            "name": '2022-5-25 11:57:30',
            "value": 60
          }
        ]
      }
    ];
    this.pressureChart.data = [
      {
        name: 'hPa',
        "series": [
          {
            "name": '2022-5-25 11:48:30',
            "value": 1001
          },
          {
            "name": '2022-5-25 11:49:30',
            "value": 1004
          },
          {
            "name": '2022-5-25 11:50:30',
            "value": 998
          },
          {
            "name": '2022-5-25 11:51:30',
            "value": 998
          },
          {
            "name": '2022-5-25 11:52:30',
            "value": 997
          },
          {
            "name": '2022-5-25 11:53:30',
            "value": 998
          },
          {
            "name": '2022-5-25 11:54:30',
            "value": 1000
          },
          {
            "name": '2022-5-25 11:55:30',
            "value": 1002
          },
          {
            "name": '2022-5-25 11:56:30',
            "value": 1003
          },
          {
            "name": '2022-5-25 11:57:30',
            "value": 999
          }
        ]
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
