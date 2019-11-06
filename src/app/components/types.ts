export type TRadiusUnits = 'km' | 'mile';

export interface ITerminalFilters {
  buy: boolean;
  sell: boolean;
  open: boolean;
}


export interface IDistanceUnit {
  type: TRadiusUnits;
  name: string;
  dim: number;
}

export type IDistanceUnits = {
  [key in TRadiusUnits]: IDistanceUnit;
};


export interface ITerminalFilterService {
  search(filtersNew: Partial<IFilters>);

  searchAddress(coordinates: ICoordinates);

  searchCoordinates(coordinates: ICoordinates);

  searchRadius(radius: IRadiusValue);

  searchRadiusUnit(unit: TRadiusUnits);

  searchTerminalFilters(terminalFilters: ITerminalFilters);

  back();

  start();

  init();
}

export type TCoordinatesSource = 'init' | 'back' | 'address' | 'mouse' | 'radius' | 'near-me';


export interface ICoordinates {
  latitude: number;
  longitude: number;
  source?: TCoordinatesSource;
  address?: string;
}

export interface ISelectOption {
  label: string;
  value: string | number;
}


export interface IRadiusValue {
  label?: string;
  min?: number;
  max?: number;
  unit?: TRadiusUnits;
  value: number;
}


export interface IFilters {
  coordinates?: ICoordinates;
  radius?: IRadiusValue;
  terminalFilters?: ITerminalFilters;
}

export interface IUserInput {
  radiusUnit?: TRadiusUnits;
}


export interface IEntity {
  id: string;
  _id: string;
  name: string;
}

export interface ITerminalState extends IEntity {
  icon: string;
}

export interface ITerminalInfo extends IEntity {
  address: string;
  latitude: number;
  longitude: number;
  icon: any;
  action_buy: boolean;
  action_sell: boolean;
  limits: ITerminalLimit[];
  currency: IEntity;
  state: ITerminalState;
  show_price: boolean;

  showPrice(prices: ITerminalPrice[]);
}

export interface ITerminalLimit extends IEntity {
  summ: number;
  types: IEntity[];
}

export interface ITerminalPriceItem extends IEntity {
  from: number;
  percent: number;
  rate: number;
}

export interface ICoin extends IEntity {
  code: string;
  icon: string;
}

export interface ITerminalPrice extends IEntity {
  action: 'buy' | 'sell';
  coin: ICoin;
  prices: ITerminalPriceItem[];
}

export interface ICoinPrice {
  fiatCode: string;
  coinCode: string;
  from: number;
  rate: number;
}

export type TMessageType = 'info' | 'warning';


export type TButtonAction = 'close' | 'submit' | 'back';

export interface IButton {
  action: TButtonAction;
  icon: string;
  label: string;
  klass: string;
}

export interface IMessageItem {
  type: TMessageType;
  title: string;
  message: string;
  buttons: IButton[];
}

export interface IMessageWindowState {
  submitted: boolean;
  action: TButtonAction;
}
