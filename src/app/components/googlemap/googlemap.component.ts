import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  NgModule,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AgmCoreModule, AgmInfoWindow, AgmMap, AgmMarker, MapTypeStyle} from '@agm/core';
import {DATA_SERVICE, IDataService} from '../../services/data.service';
import {TERMINAL_FILTER_SERVICE} from '../../services/terminal-filter.service';
import {ICoordinates, ITerminalFilterService, ITerminalInfo, ITerminalPrice} from '../types';
import {APP_CONFIG, IAppConfig} from '../../app.config';
import {Observable} from 'rxjs';

import {TerminalInfoModule} from '../terminal-info/terminal-info.component';
import {GoogleMap} from '@agm/core/services/google-maps-types';
import {AgmJsMarkerClustererModule} from '@agm/js-marker-clusterer';
import {filter} from 'rxjs/operators';
import {MessageWindowModule} from '../message-window/message-window.component';
import {IViewUpdateService, VIEW_UPDATE_SERVICE} from '../../services/view-update.service';
import {FIT_BOUNDS_SERVICE, IFitBoundsService} from '../../services/fitbounds.service';
import {ISearchResult, IStateMapService, STATE_MAP_SERVICE} from '../../services/state-map.service';
import {ITerminalsService, TERMINALS_SERVICE} from '../../services/terminals.service';
import {GOOGLE_API_SERVICE, IGoogleApiService} from '../../services/google.service';


/*
*/
@Component({
  selector: 'google-map',
  template: `
      <!--           "-->
      <agm-map [latitude]="(state.coordinates|async).latitude"
               [longitude]="(state.coordinates|async).longitude"
               [zoom]="(state.map | async).zoom"
               maxZoom="18"
               [scrollwheel]="null"
               [styles]="styles"
               gestureHandling="cooperative"
               streetViewControl="false"
               [fitBounds]="(fitBounds.value$ | async)"
               (mapReady)="onMapReady($event)"
      >
          <agm-marker-cluster
                  imagePath="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
                  imageExtension="png"
                  maxZoom="10"
          >
              <agm-marker *ngFor="let terminal of (searchResult$ | async).terminals"
                          [latitude]="terminal.latitude"
                          [longitude]="terminal.longitude"
                          [visible]="true"
                          [title]="terminal.name"
                          [iconUrl]="terminal.state.icon"
                          [agmFitBounds]="true"
                          (markerClick)="onMarkerClick(terminal)"
              >
                  <agm-info-window (infoWindowClose)="onInfoWindowClose()">
                      <terminal-info [terminal]="terminal"></terminal-info>
                  </agm-info-window>
              </agm-marker>
          </agm-marker-cluster>
          <agm-circle

                  [longitude]="(state.circle|async).longitude"
                  [latitude]="(state.circle|async).latitude"
                  [radius]="(state.radius | async)?.value *1000"
                  fillOpacity=".1"
                  [fillColor]="circleColor"
                  [strokeColor]="circleColor"
                  strokeOpacity="0.3"
                  strokeWeight="2"
                  [clickable]="false"

          >

          </agm-circle>

      </agm-map>
      <message-window></message-window>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GoogleMapComponent implements OnInit, OnDestroy {
  circleVisible = true;
  circleColor = '#090';

  styles: MapTypeStyle[];

  coordinates: ICoordinates;
  public searchResult$: Observable<ISearchResult>;

  @ViewChildren(AgmInfoWindow)
  private infoWindows: QueryList<AgmInfoWindow>;
  @ViewChildren(AgmMarker)
  private _markers: QueryList<AgmMarker>;
  @ViewChild(AgmMap, {static: true}) private mapComponent: AgmMap;
  private _map: GoogleMap;

  constructor(
    @Inject(GOOGLE_API_SERVICE) public api: IGoogleApiService,
    @Inject(FIT_BOUNDS_SERVICE) public fitBounds: IFitBoundsService,
    @Inject(VIEW_UPDATE_SERVICE) private view: IViewUpdateService,
    @Inject(APP_CONFIG) private config: IAppConfig,
    @Inject(DATA_SERVICE) private data: IDataService,
    @Inject(TERMINAL_FILTER_SERVICE) public service: ITerminalFilterService,
    @Inject(STATE_MAP_SERVICE) public state: IStateMapService,
    @Inject(TERMINALS_SERVICE) private terminalsService: ITerminalsService,
    private cdr: ChangeDetectorRef) {
  }


  onMarkerClick(terminal: ITerminalInfo) {
    this.closeAllInfoWindows();
    this.state.markerClick(terminal);

    // this.data.loadTerminalPrices('terminal_prices', terminal._id)
    //   .subscribe((prices: ITerminalPrice[]) => {
    //     this.state.setMap('displayTerminalInfo', true);
    //     terminal.showPrice(prices);
    //   });
  }

  onInfoWindowClose() {
    this.state.setMap('displayTerminalInfo', false);
  }

  onMapReady(map) {

    this._map = map;
    this.api.mapReady(map);
    this._map.addListener('dragend', () => {
      // const coordinates: LatLng = this._map.getCenter();
      // this.state.setCoordinates({
      //     source: 'mouse',
      //     latitude: coordinates.lat(),
      //     longitude: coordinates.lng()
      //   }
      // );
    });
  }

  ngOnInit() {

    this.view.onUpdate().subscribe(() => this.cdr.detectChanges());
    this.view.addObservable(this.terminalsService.terminals, 'terminals');
    this.view.addObservable(this.terminalsService.found, 'found');

    this.styles = this.config.stylesConfig;
    this.searchResult$ = this.state.terminals;

    this.searchResult$.pipe(
      filter((result: ISearchResult) => {
        if (!result.filters) {
          return false;
        }
        const {radius, coordinates} = result.filters;

        if (radius && radius.value > 0 && coordinates.source && coordinates.source !== 'mouse') {
          return true;
        }
        return false;
      })
    ).subscribe(() => {

      this.fitBounds.set(true);
    });


    this.searchResult$
      .pipe(filter((_: ISearchResult) => !!this._markers))
      .subscribe((result: ISearchResult) => {

        this._markers.forEach((marker: AgmMarker) => {
          marker.markerClick.subscribe(() => this.closeAllInfoWindows());
        });
      });
    this.mapComponent.mapClick.subscribe(() => this.closeAllInfoWindows());
  }

  ngOnDestroy(): void {

    this.view.destroy();
  }

  debug(...vars: any[]) {
    console.log('[GoogleMapComponent]', ...vars);
  }

  private closeAllInfoWindows() {
    this.infoWindows.forEach((info: AgmInfoWindow) => info.close());
    this.state.setMap('displayTerminalInfo', true);
  }


}


@NgModule({
  imports: [CommonModule, AgmCoreModule, TerminalInfoModule, AgmJsMarkerClustererModule, MessageWindowModule],
  exports: [GoogleMapComponent],
  declarations: [GoogleMapComponent],
  providers: [],
})
export class GoogleMapModule {
}
