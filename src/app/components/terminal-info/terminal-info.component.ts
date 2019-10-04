import {ChangeDetectorRef, Component, Inject, Input, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TERMINAL_FILTER_SERVICE} from '../../services/terminal-filter.service';
import {IEntity, ITerminalFilterService, ITerminalInfo, ITerminalPrice} from '../types';
import {APP_CONFIG, IAppConfig} from '../../app.config';
import {TerminalCoinPricesModule} from '../terminal-coin-prices/terminal-coin-prices.component';
import {TerminalLimitModule} from '../terminal-limits/terminal-limits.component';
import {AccordionModule} from 'primeng/accordion';


@Component({
  selector: 'terminal-info',
  template: `
      <div class="info-row">
          <div class="label">{{rowAddress.label}}</div>
          <div class="value">{{rowAddress.value}}</div>
      </div>
      <div class="info-row">
          <div class="label">{{rowOperations.label}}</div>
          <div class="value">{{rowOperations.value}}</div>
      </div>
      <div class="'terminal-limits">
          <h4>Limits</h4>
          <terminal-limits *ngFor="let limit of terminal.limits" [limit]="limit"></terminal-limits>
      </div>
      <p-accordion  class="coin-prices">
          <p-accordionTab *ngFor="let coin of coins" [header]="coin.name" [selected]="coin.name==='Bitcoin'">
              <div *ngIf="isHasAction(coin._id,'buy')">
                  <div class="label">Buy</div>
                  <terminal-coin-prices coin="BTC" fiat="USD"
                                        [prices]="getPrices(coin._id,'buy')"></terminal-coin-prices>
              </div>
              <div *ngIf="isHasAction(coin._id,'sell')">
                  <div class="label">Sell</div>
                  <terminal-coin-prices coin="BTC" fiat="USD"
                                        [prices]="getPrices(coin._id,'sell')"></terminal-coin-prices>
              </div>
          </p-accordionTab>
      </p-accordion>
  `,
})

export class TerminalInfoComponent implements OnInit {

  @Input() terminal: ITerminalInfo;
  rowAddress = {label: '', value: ''};
  rowOperations = {label: '', value: ''};
  _prices: any = {};

  constructor(@Inject(TERMINAL_FILTER_SERVICE) public service: ITerminalFilterService,
              @Inject(APP_CONFIG) private config: IAppConfig,
              private cdr: ChangeDetectorRef
  ) {
  }

  private _coins: Record<string, IEntity> = {};

  get coins() {
    return Object.values(this._coins);
  }

  debug(...vars: any[]) {
    // console.log('[GoogleMapComponent]', ...vars);
  }

  ngOnInit() {
    this.terminal.showPrice = (price: ITerminalPrice[]) => this.showPrice(price);
    this.rowAddress.label = 'Address';
    this.rowAddress.value = this.terminal.address;

    this.rowOperations.label = 'Supported operations';
    const operations = [];
    if (this.terminal.action_buy) {
      operations.push('Buy');
    }
    if (this.terminal.action_sell) {
      operations.push('Sell');
    }
    this.rowOperations.value = operations.join(', ');
  }

  isHasAction(coin: string, action: string) {
    return this._prices[coin] && this._prices[coin][action];
  }

  getPrices(coin: string, action: string) {
    return this._prices[coin][action];
  }

  showPrice(data: ITerminalPrice[]) {


    data.forEach((item: ITerminalPrice) => {
      const coinId = item.coin._id;
      if (!this._coins[coinId]) {
        this._coins[coinId] = item.coin;
      }
      const action = item.action;
      if (!this._prices[coinId]) {
        this._prices[coinId] = {};
      }

      if (!this._prices[coinId][action]) {
        this._prices[coinId][action] = [];
      }

      this._prices[coinId][action] = this._prices[coinId][action].concat(item.prices);
    });
    this.cdr.detectChanges();
    // const coins: Record<string, ICoinPrice[]> = {};
    // coins_data.forEach((coin_data: ITerminalPrice) => {
    //   const coinId = coin_data.coin._id;
    //   coin_data.prices.forEach((price: ITerminalPriceItem) => {
    //     if (!coins[coinId]) {
    //       coins[coinId] = [];
    //     }
    //     coins[coinId].push({
    //       coinCode: 'BTC',
    //       fiatCode: '$',
    //       from: price.from,
    //       rate: price.rate
    //     });
    //   });
    //
    // });

  }

  addCoinPrice() {

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
