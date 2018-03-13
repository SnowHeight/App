import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial';
import {GeneralDataEntry} from './model';
import moment from 'moment';
import Chance from 'chance';

export enum Commands {
  SAVE_SETTINGS = 'savesettings',
  GDATA_NEXT = 'gdata:next',
  GDATA = 'gdata'
}

const chance = new Chance();

@Injectable()
export class BridgeService {
  constructor(private bluetooth: BluetoothSerial) {
  }

  parseConfig(s) {
    let regex = /([^\[\];]+)=([^\[\];]+)/gm;
    let obj = {};
    let match;
    while ((match = regex.exec(s))) {
      obj[match[1]] = match[2];
    }
    return obj;
  }

  configObjectToString(obj) {
    let data = null;
    _.each(obj, (value, key) => {
      if (data === null) {
        data = `${key}=${value}`;
      } else {
        data = `${data};${key}=${value}`;
      }
    });
    return data;
  }

  textToUint8Array(text) {
    let arr = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      arr[i] = text.charCodeAt(i);
    }
    return arr;
  }

  calculateChecksum(string) {
    let sum = 0;
    for (let i = 0; i < string.length; i++) {
      sum += string.charCodeAt(i);
    }
    return sum % 100;
  }

  rowsValid(rows) {
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let checksumDelimiterIndex = row.lastIndexOf('@');
      if (checksumDelimiterIndex > -1) {
        //split string at the last @ into string and checksum
        let string = row.substring(0, checksumDelimiterIndex);
        let checksum = row.substring(checksumDelimiterIndex + 1);
        if (!isNaN(checksum)) {
          checksum = parseInt(checksum);
          let calculatedChecksum = this.calculateChecksum(string);
          if (checksum !== calculatedChecksum) {
            console.log(
              'row not valid. checksum does not match',
              `${calculatedChecksum} !== ${checksum}`
            );
            return false;
          }
        } else {
          console.log('row not valid. checksum not a number');
          return false;
        }
      } else {
        console.log('row not valid. checksum separator missing');
        return false;
      }
    }
    return true;
  }

  executeCommand(_command: string, data?: string) {
    let timeout;
    return new Promise(async (resolve, reject) => {
      let finished = false;
      let command;
      if (data) {
        command = `[${_command}]${data}[/${_command}]`;
      } else {
        command = `[${_command}]`;
      }
      console.log('executing', command);

      let subscriber = this.bluetooth
        .subscribe(`[${_command}]`)
        .subscribe(async rawData => {
          clearTimeout(timeout);
          finished = true;
          subscriber.unsubscribe();
          resolve();
        });

      await this.bluetooth.write(this.textToUint8Array(command));
      timeout = setTimeout(() => {
        if (!finished) {
          console.log('timeout exceeded');
          subscriber.unsubscribe();
          reject(new Error('timeout exceeded'));
        } else {
          console.log(
            'timeout finished but command also did. everything is ok'
          );
        }
      }, 15000);
    });
  }

  executeCommandWithReturnValue(_command: string, data?: string) {
    let timeout;
    return new Promise<string>(async (resolve, reject) => {
      let finished = false;
      let command: string;
      if (data) {
        command = `[${_command}]${data}[/${_command}]`;
      } else {
        command = `[${_command}]`;
      }
      console.log('executing', command);

      let subscriber = this.bluetooth
        .subscribe(`[/${_command}]`)
        .subscribe(async rawData => {
          clearTimeout(timeout);
          finished = true;
          rawData = rawData
            .substring(rawData.lastIndexOf(`[${_command}]`))
            .replace(`[${_command}]`, '')
            .replace(`[/${_command}]`, '');
          subscriber.unsubscribe();
          resolve(rawData);
        });

      await this.bluetooth.write(this.textToUint8Array(command));
      timeout = setTimeout(() => {
        if (!finished) {
          console.log('timeout exceeded');
          subscriber.unsubscribe();
          reject(new Error('timeout exceeded'));
        } else {
          console.log(
            'timeout finished but command also did. everything is ok'
          );
        }
      }, 15000);
    });
  }

  parseGeneralDataEntry(s: string): GeneralDataEntry {
    let parts = _.map(s.split(';'), s => s.trim());
    let date = moment(parts[1], 'YYYYMMDDHHmm');
    return {
      id: parts[0],
      date: date.unix() * 1000,
      temperature: +parts[2],
      pressure: +parts[3],
      floorDistance: +parts[4],
      humidity: +parts[5],
      year: date.year().toString(),
      month: date.format('YYYY-MM'),
      day: date.format('YYYY-MM-DD')
    };
  }

  async generateGeneralData(amount: number) {
    let items = [];
    let date = moment();
    for (let i = 0; i < amount; i++) {
      date.subtract(10, 'minutes');
      let string = `${amount - i - 1};${date.format(
        'YYYYMMDDHHmm'
      )};${chance.integer({max: 35, min: -20})};${chance.integer({
        min: 990,
        max: 1020
      })};${chance.integer({min: 115, max: 130})};${chance.integer({
        min: 10,
        max: 50
      })}`;
      items.push(`${string}@${this.calculateChecksum(string)}`);
    }
    items.reverse();
    return items;
  }
}
