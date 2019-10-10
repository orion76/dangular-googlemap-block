import {Component, Inject, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TERMINAL_FILTER_SERVICE} from '../../services/terminal-filter.service';
import {FormsModule} from '@angular/forms';
import {GooglePlaceModule} from '../../libraries/ngx-google-places-autocomplete/src/ngx-google-places-autocomplete.module';
import {Options} from '../../libraries/ngx-google-places-autocomplete/src/objects/options/options';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';

import {
  IDistanceUnit,
  IRadiusValue,
  ISelectOption,
  ITerminalFilters,
  ITerminalFilterService,
  TRadiusUnits
} from '../types';
import {APP_CONFIG, IAppConfig} from '../../app.config';
import {Observable} from 'rxjs';


@Component({
  selector: 'terminal-filter-form',
  template: `
      <div id="filter" class="mapFilter">
          <div class="mapFilter__mobileButton" [ngClass]="mobileButtonClass">×</div>
          <div class="mapFilter__content mapFilter__group" [ngClass]="mobileButtonClass">

              <div class="mapFilter__title ">Search terminals</div>
              <div class="mapFilter__spoiler-button -nodrag active" title="Click here to open filter">Open</div>

              <div class="slideCheckbox">
                  <div class="mapFilter__row">
                      <input id="enabled" type="checkbox" [(ngModel)]="filterTerminal.open"
                             (change)="onTerminalFiltersChanged()"
                             name="enabled"
                             class="slideCheckbox__checkbox">
                      <label for="enabled" class="slideCheckbox__label -nodrag">Open now</label>
                  </div>
              </div>

              <div class="slideCheckbox">
                  <div class="mapFilter__row">
                      <input id="buy" type="checkbox" [(ngModel)]="filterTerminal.buy"
                             (change)="onTerminalFiltersChanged()" name="buy"
                             class="slideCheckbox__checkbox">
                      <label for="buy" class="slideCheckbox__label -nodrag">Buy bitcoins</label>
                  </div>
              </div>

              <div class="slideCheckbox">
                  <div class="mapFilter__row">
                      <input id="sell" type="checkbox" [(ngModel)]="filterTerminal.sell"
                             (change)="onTerminalFiltersChanged()"
                             name="sell"
                             class="slideCheckbox__checkbox">
                      <label for="sell" class="slideCheckbox__label -nodrag">Sell bitcoins</label>
                  </div>
              </div>


              <div class="mapFilter__group">
                  <div class="mapFilter__title">Search by location</div>

                  <div class="slideCheckbox">
                      <div class="mapFilter__row">
                          <p-button (onClick)="onNearMeChanged()" label="Near me" type="button"></p-button>
                          <!--                          <input id="nears"(change)="onNearMeChanged()" type="checkbox" name="nears"-->
                          <!--                                 [(ngModel)]="nearMe"-->
                          <!--                                 class="slideCheckbox__checkbox">-->
                          <!--                          <label for="nears" class="slideCheckbox__label -nodrag">Near me</label>-->
                      </div>
                  </div>


                  <div class="rangeSlider">
                      <div class="mapFilter__row">
                          <div class="label-group">
                              <label for="sliderRadius" class="label">Radius:{{radius.value}}</label>
                              <p-dropdown class="unit" [(ngModel)]="radius.unit"
                                          [options]="radiusUnitOptions"></p-dropdown>
                          </div>

                          <input class="slider" id="sliderRadius"
                                 [(ngModel)]="radius.value" (change)="onRadiusChanged()"
                                 type="range" min="1" max="100" value="50"
                          >

                      </div>
                  </div>

                  <div class="inputInline">

                      <div class="mapFilter__row">
                          <input
                                  [(ngModel)]="searchField"
                                  id="postcode" type="text" name="postcode"
                                  placeholder="Enter zipcode or address"
                                  class="inputInline__input -nodrag"
                                  ngx-google-places-autocomplete [options]="placesOptions" #placesRef="ngx-places"
                                  (changeAddress)="onAddressChanged($event)"
                          >
                          <button id="search-crear" (click)="searchClear()" class="inputInline__button -nodrag">Clear
                          </button>
                      </div>
                  </div>

                  <div class="searchResult">

                      <div class="mapFilter__row">
                          Found:{{service.found | async}}
                      </div>
                  </div>

              </div>
          </div>
      </div>
  `,
})

export class TerminalFilterFormComponent implements OnInit {


  mobileButtonClass = '';
  // placesOptions = new Options({types: ['(cities)']});
  placesOptions = new Options({componentRestrictions: {country: 'us'}, types: ['(regions)']});
  radius: IRadiusValue;

  filterTerminal: ITerminalFilters;
  searchField = '';
  radiusUnitOptions: ISelectOption[] = [];

  constructor(@Inject(TERMINAL_FILTER_SERVICE) public service: ITerminalFilterService,
              @Inject(APP_CONFIG) private config: IAppConfig) {
  }

  onTerminalFiltersChanged() {
    this.service.filterTerminal.next(this.filterTerminal);
  }

  searchClear() {
    if (this.searchField.length > 0) {
      this.service.backCoordinates();
      this.searchField = '';
    }
  }

  createRadiusOptions(): ISelectOption[] {
    return Object.keys(this.config.distanceUnits)
      .map((key: string) => ({label: this.config.distanceUnits[key].name, value: key}));
  }

  onNearMeChanged() {
    navigator.geolocation.getCurrentPosition((position: Position) => {
      const source = 'near-me';
      const {longitude, latitude} = position.coords;
      this.service.changeCoordinates({source, latitude, longitude});
    });
  }

  onAddressChanged(event) {
    // this.service.fitBounds.next(true);
    this.service.changeCoordinates({
      latitude: event.geometry.location.lat(),
      longitude: event.geometry.location.lng(),
      source: 'address',
      address: event['formatted_address']
    });
  }

  onRadiusChanged() {
    // this.service.fitBounds.next(true);
    this.service.radius.next(this.createRadius(this.radius.value, this.radius.unit));
  }

  createRadius(len: number, type: TRadiusUnits): IRadiusValue {
    const config: IDistanceUnit = this.config.distanceUnits[type];
    return {
      label: config.name,
      unit: type,
      value: Math.round(len * config.dim)
    };
  }

  ngOnInit() {

    this.radius = this.config.filters.radius;
    this.onRadiusChanged();
    this.radiusUnitOptions = this.createRadiusOptions();
    this.filterTerminal = this.config.filters.terminalFilters;

  }
}


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    GooglePlaceModule,
    DropdownModule,
    ButtonModule,
  ],
  exports: [TerminalFilterFormComponent],
  declarations: [TerminalFilterFormComponent],
  providers: [],
})
export class TerminalFilterFormModule {
}
