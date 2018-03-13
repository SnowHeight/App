export interface DataEntry {
  id: string;
  date: number;

  year: string;
  month: string;
  day: string;
}

export interface GeneralDataEntry extends DataEntry {
  temperature: number;
  pressure: number;
  floorDistance: number;
  humidity: number;
}

export interface LaserDataEntry extends DataEntry {
  measurementId: string;
  height: number;
}
