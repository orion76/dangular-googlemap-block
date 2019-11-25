import {ChangeDetectorRef, Component, Inject, Input, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TERMINAL_FILTER_SERVICE} from '../../services/terminal-filter.service';
import {ICoin, ITerminalFilterService, ITerminalInfo, ITerminalPrice, ITerminalPriceItem} from '../types';
import {APP_CONFIG, IAppConfig} from '../../app.config';
import {TerminalCoinPricesModule} from '../terminal-coin-prices/terminal-coin-prices.component';
import {TerminalLimitModule} from '../terminal-limits/terminal-limits.component';
import {AccordionModule} from 'primeng/accordion';
import {GOOGLE_API_SERVICE, IGoogleApiService, IPlaceResult} from '../../services/google.service';
import {Observable, Subject} from 'rxjs';
import {filter, map, switchMap, tap} from 'rxjs/operators';
import {IStateMapService, STATE_MAP_SERVICE} from '../../services/state-map.service';
import {DATA_SERVICE, IDataService} from '../../services/data.service';

export interface ITerminalCoinPrice {
  coin: ICoin;
  sell: ITerminalPriceItem[];
  buy: ITerminalPriceItem[];
}

@Component({
  selector: 'terminal-info',
  template: `

      <div class="place-photo" *ngIf="panorama$|async as panoramaUrl">
          <img [src]="panoramaUrl" [alt]="terminal.address" class="place-photo__image"/>
      </div>
      <h3 class="terminal-name">BTM Kiosk Location</h3>
      <a class="terminal-direction-link ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"
         [href]="createMarkerUrl(terminal.latitude,terminal.longitude)"
         target="_blank">
          <span class="terminal-direction-link__text ui-button-text ui-clickable">Direction</span>
      </a>
      <div class="info-row address">
          <div class="info-row__label">{{rowAddress.label}}</div>
          <div class="info-row__value">{{terminal.address}}</div>
      </div>
      <div class="info-row operations">
          <div class="info-row__label">{{rowOperations.label}}</div>
          <div class="info-row__value">{{createOperationsOutput(terminal)}}</div>
      </div>
      <p-accordion class="terminal-limits">
          <p-accordionTab header="Purchase Requirements">
              <terminal-limits *ngFor="let limit of terminal.limits" [limit]="limit"
                               [fiat]="terminal.currency.symbol"></terminal-limits>
          </p-accordionTab>
      </p-accordion>
      <p-accordion class="coin-prices">
          <p-accordionTab *ngFor="let price of prices$|async" [disabled]="!terminal.show_price">
              <p-header>
                  <img class="coin-icon" [alt]="price.coin.name" [src]="price.coin.icon"/>
                  <h4 class="coin-name">{{price.coin.name}}</h4>
              </p-header>
              <div *ngIf="terminal.show_price && price.buy" class="terminal-price-type terminal-price-type--buy">
                  <div class="terminal-price-type__label">Buy</div>
                  <terminal-coin-prices [coin]="price.coin.code" [fiat]="terminal.currency.symbol"
                                        [prices]="price.buy"></terminal-coin-prices>
              </div>
              <div *ngIf="terminal.show_price && price.sell" class="terminal-price-type terminal-price-type--sell">
                  <div class="terminal-price-type__label">Sell</div>
                  <terminal-coin-prices [coin]="price.coin.code" [fiat]="terminal.currency.symbol"
                                        [prices]="price.sell"></terminal-coin-prices>
              </div>
          </p-accordionTab>
      </p-accordion>

  `,
})

export class TerminalInfoComponent implements OnInit {

  @Input() terminal: ITerminalInfo;
  terminal$: Observable<ITerminalInfo>;
  rowAddress = {label: '', value: ''};
  rowOperations = {label: '', value: ''};
  prices$: Observable<ITerminalCoinPrice[]>;
  panoramaSubject: Subject<string>;
  panorama$: Observable<string>;

  constructor(@Inject(GOOGLE_API_SERVICE) public api: IGoogleApiService,
              @Inject(STATE_MAP_SERVICE) public state: IStateMapService,
              @Inject(TERMINAL_FILTER_SERVICE) public service: ITerminalFilterService,
              @Inject(APP_CONFIG) private config: IAppConfig,
              @Inject(DATA_SERVICE) private data: IDataService,
              private cdr: ChangeDetectorRef
  ) {
  }

  private _coins: Map<string, ICoin> = new Map();

  get coins() {
    return Object.values(this._coins);
  }

  debug(...vars: any[]) {
    // console.log('[GoogleMapComponent]', ...vars);
  }

  ngOnInit() {

    this.panoramaSubject = new Subject<string>();
    this.panorama$ = this.panoramaSubject.asObservable();
    this.terminal$ = this.state.onMarkerClick()
      .pipe(
        filter((terminal: ITerminalInfo) => {
          return terminal._id === this.terminal._id;
        }),
      );
    this.prices$ = this.terminal$
      .pipe(
        tap((terminal: ITerminalInfo) => {
          this.panoramaSubject.next(this.createPanoramaUrl(terminal.latitude, terminal.longitude));
        }),
        switchMap((terminal: ITerminalInfo) => this.data.loadTerminalPrices('terminal_prices', terminal._id)),
        map((prices: ITerminalPrice[]) => {
          const _prices: Map<string, ITerminalCoinPrice> = new Map();
          prices.forEach((price: ITerminalPrice) => {
            const coin = price.coin;
            if (!_prices.has(coin._id)) {
              _prices.set(coin._id, {coin, buy: [], sell: []});
            }
            const item = _prices.get(coin._id);
            price.prices.forEach((p: ITerminalPriceItem) => {
              item[price.action].push(p);
            });

          });
          return Array.from(_prices.values());
        })
      );

    this.rowAddress.label = 'Address';
    this.rowOperations.label = 'Supported operations';


  }

  createMarkerUrl(lat: number, lng: number) {
    const url = 'https://www.google.com/maps/search';
    const request = {
      api: '1',
      query: [lat, lng],
    };
    return `${url}/?${this.createUrlParams(request)}`;
  }

  createPanoramaUrl(lat: number, lng: number) {
    const url = 'https://maps.googleapis.com/maps/api/streetview';
    const request = {
      location: [lat, lng],
      size: '400x300',
      key: this.config.apiKeys.google
    };
    return `${url}?${this.createUrlParams(request)}`;
  }

  createUrlParams(params: any) {
    const paramsArr: string[] = [];
    Object.keys(params).forEach((key: string) => {
      let value;
      if (Array.isArray(params[key])) {
        value = params[key].join(',');
      } else {
        value = params[key];
      }
      paramsArr.push(`${key}=${value}`);
    });

    return paramsArr.join('&');
  }

  createOperationsOutput(terminal: ITerminalInfo) {
    const operations = [];
    if (terminal.action_buy) {
      operations.push('Buy');
    }
    if (terminal.action_sell) {
      operations.push('Sell');
    }
    return operations.join(', ');
  }

  isHasAction(coin: string, action: string) {
    return this.prices$[coin] && this.prices$[coin][action];
  }

  getPrices(coin: string, action: string) {
    return this.prices$[coin][action];
  }

  showPrice(data: ITerminalPrice[]) {


    data.forEach((item: ITerminalPrice) => {
      const coinId = item.coin._id;
      if (!this._coins[coinId]) {
        this._coins[coinId] = item.coin;
      }
      const action = item.action;
      if (!this.prices$[coinId]) {
        this.prices$[coinId] = {};
      }

      if (!this.prices$[coinId][action]) {
        this.prices$[coinId][action] = [];
      }

      this.prices$[coinId][action] = this.prices$[coinId][action].concat(item.prices);
    });
    this.cdr.detectChanges();
  }
}


@NgModule({
  imports: [
    CommonModule,
    TerminalCoinPricesModule,
    TerminalLimitModule,
    AccordionModule
  ],
  exports: [TerminalInfoComponent],
  declarations: [TerminalInfoComponent],
  providers: [],
})
export class TerminalInfoModule {
}
