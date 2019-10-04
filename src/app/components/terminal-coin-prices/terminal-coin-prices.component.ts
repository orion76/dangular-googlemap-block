import {Component, Input, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ICoinPrice} from '../types';


@Component({
  selector: 'terminal-coin-prices',
  template: `

      <div *ngFor="let price of prices" class="info-row">
          <div>from {{price.from | number:'1.2-2'}} {{fiat}}</div>
          <div class="value">1 {{coin}}={{price.rate | number:'1.2-2'}} {{fiat }}</div>
      </div>
  `,
})

export class TerminalCoinPricesComponent implements OnInit {

  @Input() prices: ICoinPrice[];
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
