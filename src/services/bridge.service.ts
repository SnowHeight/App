import {Injectable} from "@angular/core";
import * as _ from "lodash";

@Injectable()
export class BridgeService {
  parseConfig(s) {
    let regex = /(\w+)=(\w+)/gm;
    let obj = {};
    let match;
    while (match = regex.exec(s)) {
      obj[match[1]] = match[2];
    }
    return obj;
  }

  configObjectToString(obj) {
    let data = null;
    _.each(obj, (value, key) => {
      if(data === null) {
        data = `${key}=${value}`;
      } else {

        data = `${data};${key}=${value}`;
      }
    });
    return `[savesettings]${data}[/savesettings]`;
  }

  textToUint8Array(text) {
    let arr = new Uint8Array(text.length);
    for(let i = 0; i < text.length; i++) {
      arr[i] = text.charCodeAt(i);
    }
    return arr;
  }
}
