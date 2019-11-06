import {ChangeDetectionStrategy, Component, Inject, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TERMINAL_FILTER_SERVICE} from '../../services/terminal-filter.service';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GooglePlaceModule} from '../../libraries/ngx-google-places-autocomplete/src/ngx-google-places-autocomplete.module';
import {Options} from '../../libraries/ngx-google-places-autocomplete/src/objects/options/options';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';

import {
  ICoordinates,
  IDistanceUnit,
  IFilters,
  IRadiusValue,
  ISelectOption,
  ITerminalFilters,
  ITerminalFilterService,
  TRadiusUnits
} from '../types';
import {APP_CONFIG, IAppConfig} from '../../app.config';
import {FieldsetModule} from 'primeng/fieldset';
import {IMessageService, MESSAGE_SERVICE} from '../../services/message.service';
import {STATE_FILTERS_SERVICE} from '../../services/state-filters.service';
import {ITerminalsService, TERMINALS_SERVICE} from '../../services/terminals.service';
import {createFiltersConfig} from '../../services/utils';
import {IStateFiltersService} from '../../services/types';
import {SliderModule} from 'primeng/slider';
import {BehaviorSubject, Observable} from 'rxjs';


@Component({
  selector: 'terminal-filter-form',
  template: `
      <form [formGroup]="form">
          <div class="mapFilter__group" formGroupName="terminalFilters">
              <div class="slideCheckbox">
                  <div class="mapFilter__row">
                      <input id="enabled" type="checkbox" formControlName="open" name="enabled"
                             class="slideCheckbox__checkbox">
                      <label for="enabled" class="slideCheckbox__label ">Open now</label>
                  </div>
              </div>

              <div class="slideCheckbox">
                  <div class="mapFilter__row">
                      <input id="buy" type="checkbox" formControlName="buy" name="buy" class="slideCheckbox__checkbox">
                      <label for="buy" class="slideCheckbox__label ">Buy bitcoins</label>
                  </div>
              </div>

              <div class="slideCheckbox">
                  <div class="mapFilter__row">
                      <input id="sell" type="checkbox" formControlName="sell" name="sell"
                             class="slideCheckbox__checkbox">
                      <label for="sell" class="slideCheckbox__label ">Sell bitcoins</label>
                  </div>
              </div>
          </div>


          <div class="mapFilter__group">
              <h3>Search by location</h3>

              <div class="slideCheckbox">
                  <div class="mapFilter__row">
                      <p-button (onClick)="onNearMeChanged()" label="Near me" type="button"></p-button>
                  </div>
              </div>

              <!--          <div class="rangeSlider" *ngIf="radius.value > 0">-->
              <div class="rangeSlider" formGroupName="radius">
                  <div class="mapFilter__row" *ngIf="radius$|async as radius">
                      <div class="label-group">
                          <label for="sliderRadius"
                                 class="label">Radius:{{radius}}</label>
                          <p-dropdown class="unit" formControlName="unit" [options]="radiusUnitOptions"></p-dropdown>
                      </div>
                      <p-slider formControlName="value" [min]="1" [max]="100"
                                (onSlideEnd)="onRadiusChange()"
                                (onChange)="updateLabel()"
                      ></p-slider>
                  </div>
              </div>

              <div class="inputInline">

                  <div class="mapFilter__row">
                      <input
                              formControlName="address"
                              id="postcode" type="text" name="postcode"
                              placeholder="Enter zipcode or address"
                              class="inputInline__input"
                              ngx-google-places-autocomplete [options]="placesOptions" #placesRef="ngx-places"
                              (changeAddress)="onAddressChanged($event)"
                      >
                      <button id="search-crear" (click)="searchClear()" class="inputInline__button">Clear
                      </button>
                  </div>
              </div>


              <div class="searchResult">

                  <div class="mapFilter__row">
                      Found:{{terminalsService.found | async}}
                  </div>
              </div>

          </div>
      </form>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TerminalFilterFormComponent implements OnInit {
  // placesOptions = new Options({types: ['(cities)']});
  placesOptions = new Options({componentRestrictions: {country: 'us'}, types: ['(regions)']});

  form: FormGroup;

  radiusUnitOptions: ISelectOption[] = [];

  radiusSubject: BehaviorSubject<number>;
  radius$: Observable<number>;

  constructor(@Inject(TERMINAL_FILTER_SERVICE) public service: ITerminalFilterService,
              @Inject(APP_CONFIG) private config: IAppConfig,
              @Inject(STATE_FILTERS_SERVICE) public state: IStateFiltersService,
              @Inject(TERMINALS_SERVICE) public terminalsService: ITerminalsService,
              @Inject(MESSAGE_SERVICE) private message: IMessageService,
              private _fb: FormBuilder) {
  }

  onRadiusChange() {
    this.service.searchRadius(this.form.get('radius').value);
  }

  updateLabel() {
    this.radiusSubject.next(this.form.get(['radius', 'value']).value);
  }

  // ngAfterViewInit(): void {
  //   setTimeout(() => {
  //     this.form.get('radius').patchValue(createFiltersConfig('radius', this.config), {emitEvent: true});
  //     this.form.get('terminalFilters').patchValue(createFiltersConfig('terminalFilters', this.config));
  //   }, 1);
  // }

  searchClear() {
    if (this.form.get('address').value.length > 0) {

      this.form.get('address').setValue('');
    }
    this.service.start();
  }

  createRadiusOptions(): ISelectOption[] {
    return Object.keys(this.config.distanceUnits)
      .map((key: string) => ({label: this.config.distanceUnits[key].name, value: key}));
  }

  onNearMeChanged() {
    let enabled = false;
    navigator.geolocation.getCurrentPosition((position: Position) => {
      enabled = true;
      const source = 'near-me';
      const {longitude, latitude} = position.coords;
      this.form.get('coordinates').patchValue({source, longitude, latitude});
    });

    if (!enabled) {
      this.message.showLocationDisabled();
    }
  }


  onAddressChanged(event) {
    this.form.get('coordinates').patchValue({
      latitude: event.geometry.location.lat(),
      longitude: event.geometry.location.lng(),
      address: event.formatted_address
    });
  }

  createRadius(value: number, type: TRadiusUnits): IRadiusValue {
    const config: IDistanceUnit = this.config.distanceUnits[type];
    return {
      label: config.name,
      unit: type,
      value: Math.round(value * config.dim),
    };
  }

  ngOnInit() {

    this.radiusSubject = new BehaviorSubject<number>(0);
    this.radius$ = this.radiusSubject.asObservable();

    this.form = this.createForm();
    this.initFormEvents();


    this.radiusUnitOptions = this.createRadiusOptions();

    const filters: IFilters = {
      radius: createFiltersConfig('radius', this.config),
      coordinates: createFiltersConfig('coordinates', this.config),
      terminalFilters: createFiltersConfig('terminalFilters', this.config)
    };

    this.form.get('radius').patchValue(filters.radius, {emitEvent: false});
    this.form.get('terminalFilters').patchValue(filters.terminalFilters, {emitEvent: false});
    this.service.init();
    this.service.search(filters);


  }

  initFormEvents() {

    this.form.get('terminalFilters').valueChanges.subscribe((terminalFilters: ITerminalFilters) => {
      this.service.searchTerminalFilters(terminalFilters);
    });
    this.form.get('coordinates').valueChanges.subscribe((coordinates: ICoordinates) => {
      this.service.searchAddress(coordinates);
    });
    this.form.get(['radius', 'unit']).valueChanges.subscribe((unit: TRadiusUnits) => {

      this.service.searchRadiusUnit(unit);
    });


    this.state.onChangeRadius
      .subscribe((radius: IRadiusValue) => {
        this.radiusSubject.next(radius.value);
        this.form.get('radius').patchValue(radius, {emitEvent: false});
      });

    this.state.onChangeTerminalFilters
      .subscribe((terminalFilters: ITerminalFilters) => {
        this.form.get('terminalFilters').patchValue(terminalFilters, {emitEvent: false});
      });
  }

  createForm(): FormGroup {
    return this._fb.group({
      terminalFilters: this._fb.group({
        open: null,
        buy: null,
        sell: null
      }),
      radius: this._fb.group({
        value: null,
        unit: null
      }),
      coordinates: this._fb.group({
        latitude: null,
        longitude: null,
        source: null,
        address: null
      }),
      address: ''
    });

  }

}


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    GooglePlaceModule,
    DropdownModule,
    ButtonModule,
    FieldsetModule,
    ReactiveFormsModule,
    SliderModule,
  ],
  exports: [TerminalFilterFormComponent],
  declarations: [TerminalFilterFormComponent],
  providers: [],
})
export class TerminalFilterFormModule {
}
