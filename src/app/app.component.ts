import {Component, OnInit} from '@angular/core';
import {ICoordinates, TRadiusUnits} from './components/types';

@Component({
  selector: 'app-coin-googlemap',
  template: `
      <div class="map-block container">
          <google-map class="google-map map-block-item"></google-map>
          <terminal-filter-form class="terminal-filter-form map-block-item"></terminal-filter-form>
      </div>
      <div class="legend block">
          <div class="block-content legend__content">
              <div class="legend__items">
                  <div class="legend__item -forBuying">
                      <span class="legend__text -desktop">Open stores for buying only</span>
                      <span class="legend__text -mobile">Buying only</span>
                  </div>
                  <div class="legend__item -forBuyingSelling">
                      <span class="legend__text -desktop">Open stores for buying and selling</span>
                      <span class="legend__text -mobile">Buying and selling</span>
                  </div>
                  <div class="legend__item -closed">
                      <span class="legend__text -desktop">Closed stores</span>
                      <span class="legend__text -mobile">Closed</span>
                  </div>
              </div>
          </div>
      </div>


  `,
})
export class AppComponent implements OnInit {
  title = 'app';

  ngOnInit() {
  }
}
