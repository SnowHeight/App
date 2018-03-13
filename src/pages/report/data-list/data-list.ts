import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataEntry } from '../../../services/model';
import * as _ from 'lodash';

@Component({
  selector: 'page-data-list',
  templateUrl: 'data-list.html'
})
export class DataListPage {
  key: string;

  //['2018-02', '2018-03']
  itemsKeys: string[];
  items: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    let data: DataEntry[] = navParams.data.data;
    this.key = navParams.data.key;
    let groups = _.groupBy(data, o => o[this.key]);
    _.each(groups, (value, key) => {
      groups[key] = groups[key].length;
    });

    this.items = groups;
    this.itemsKeys = Object.keys(groups).reverse();
  }
}
