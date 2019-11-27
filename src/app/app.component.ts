import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-coin-googlemap',
  template: `
<!--      <div style="height:300px"></div>-->
      <div class="map-block container-fluid">
          <google-map class="google-map map-block-item"></google-map>

          <float-panel class="float-panel-wrapper" header="Filters"
                       expanded="true"
                       draggable="true"
                       [autoZIndex]="autoZIndex"
          >
              <terminal-filter-form class="terminal-filter-form map-block-item"></terminal-filter-form>
          </float-panel>
          <!--          <p-accordion class="terminal-filter-form-wrapper" >-->
          <!--              <p-accordionTab header="Filters" [selected]="true">-->
          <!--                  <terminal-filter-form class="terminal-filter-form map-block-item"></terminal-filter-form>-->
          <!--              </p-accordionTab>-->
          <!--          </p-accordion>-->
      </div>
      <div class="legend block container">
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
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  autoZIndex = false;

  ngOnInit() {
  }

}
