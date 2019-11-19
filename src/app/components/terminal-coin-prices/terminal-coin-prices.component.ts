import {Component, Input, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ITerminalPriceItem} from '../types';


@Component({
  selector: 'terminal-coin-prices',
  template: `

      <div *ngFor="let price of prices" class="info-row terminal-price-type__item terminal-price-item">
          <div class="terminal-price-item__from">from  {{fiat}}{{price.from | number:'1.2-2'}}<span class="arrow">-></span></div>
          <div class="terminal-price-item__value">1 {{coin}}={{fiat }}{{price.rate | number:'1.2-2'}} </div>
      </div>
  `,
})

export class TerminalCoinPricesComponent implements OnInit {


  @Input() prices: ITerminalPriceItem[];
  @Input() fiat: string;
  @Input() coin: string;

  debug(...vars: any[]) {
    // console.log('[GoogleMapComponent]', ...vars);
  }

  ngOnInit() {

  }

}


@NgModule({
  imports: [CommonModule],
  exports: [TerminalCoinPricesComponent],
  declarations: [TerminalCoinPricesComponent],
  providers: [],
})
export class TerminalCoinPricesModule {
}
