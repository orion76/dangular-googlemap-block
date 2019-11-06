import {IDistanceUnits, IFilters} from './components/types';
import {InjectionToken} from '@angular/core';
import {MapTypeStyle} from '@agm/core';
import {IStateMap} from './services/state-map.service';

export const APP_CONFIG = new InjectionToken<IAppConfig>('APP_CONFIG');

export interface IAppConfig {
  map: IStateMap;
  filtersDefault: IFilters;
  filtersInit: Partial<IFilters>;
  distanceUnits: IDistanceUnits;
  stylesConfig: MapTypeStyle[];
}


export const appConfig: IAppConfig = {
  map: {zoom: 8, displayTerminalInfo: false},
  filtersDefault: {
    radius: {unit: 'mile', value: 10, min: 0, max: 100},
    coordinates: {latitude: 40.666738, longitude: -74.214917},
    terminalFilters: {buy: false, sell: false, open: false}
  },
  filtersInit: {
    radius: {unit: 'mile', value: 0},
  },
  distanceUnits: {
    km: {type: 'km', name: 'Kilometer', dim: 1},
    mile: {type: 'mile', name: 'Mile', dim: 1.609344}
  },
  stylesConfig: [
    {elementType: 'geometry', stylers: [{color: '#f5f5f5'}]},
    {elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#616161'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#f5f5f5'}]},
    {featureType: 'administrative.land_parcel', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{color: '#bdbdbd'}]},
    {featureType: 'poi', elementType: 'geometry', stylers: [{color: '#eeeeee'}]},
    {featureType: 'poi', elementType: 'labels.text', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'labels.text.fill', stylers: [{color: '#757575'}]},
    {featureType: 'poi.business', stylers: [{visibility: 'off'}]},
    {featureType: 'poi.park', elementType: 'geometry', stylers: [{color: '#e5e5e5'}]},
    {featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{color: '#9e9e9e'}]},
    {featureType: 'road', elementType: 'geometry', stylers: [{color: '#ffffff'}]},
    {featureType: 'road', elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
    {featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{color: '#757575'}]},
    {featureType: 'road.highway', elementType: 'geometry', stylers: [{color: '#dadada'}]},
    {featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{color: '#616161'}]},
    {featureType: 'road.local', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{color: '#9e9e9e'}]},
    {featureType: 'transit', stylers: [{visibility: 'off'}]},
    {featureType: 'transit.line', elementType: 'geometry', stylers: [{color: '#e5e5e5'}]},
    {featureType: 'transit.station', elementType: 'geometry', stylers: [{color: '#eeeeee'}]},
    {featureType: 'water', elementType: 'geometry', stylers: [{color: '#45B9E8'}]},
    {featureType: 'water', elementType: 'labels.text.fill', stylers: [{color: '#9e9e9e'}]}
  ]

};

