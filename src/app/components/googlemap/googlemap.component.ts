import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  NgModule,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AgmCoreModule, AgmInfoWindow, AgmMap, AgmMarker, LatLng, MapTypeStyle} from '@agm/core';
import {DATA_SERVICE, IDataService} from '../../services/data.service';
import {TERMINAL_FILTER_SERVICE} from '../../services/terminal-filter.service';
import {
  ICoordinates, IDistanceUnit,
  IFilters,
  IMessageItem,
  IMessageWindowState,
  ITerminalFilterService,
  ITerminalInfo,
  ITerminalPrice
} from '../types';
import {APP_CONFIG, IAppConfig} from '../../app.config';
import {Observable, Subject} from 'rxjs';

import {TerminalInfoModule} from '../terminal-info/terminal-info.component';
import {GoogleMap} from '@agm/core/services/google-maps-types';
import {AgmJsMarkerClustererModule} from '@agm/js-marker-clusterer';
import {delay, filter, withLatestFrom} from 'rxjs/operators';
import {MessageWindowModule} from '../message-window/message-window.component';
import {TerminalMessages} from '../message-window/messages.config';
import {IViewUpdateService, VIEW_UPDATE_SERVICE} from '../../services/view-update.service';
import {FIT_BOUNDS_SERVICE, IFitBoundsService} from '../../services/fitbounds.service';


/*
*/
@Component({
  selector: 'google-map',
  template: `
      <!--      {{debug(coordinates)}}-->
      <agm-map [latitude]="coordinates.latitude"
               [longitude]="coordinates.longitude"
               [zoom]="service.zoom | async "
               maxZoom="18"
               [scrollwheel]="null"
               [styles]="styles"
               gestureHandling="cooperative"
               streetViewControl="false"
               [fitBounds]="(fitBounds.value$ | async) "
               (mapReady)="onMapReady($event)"
      >
          <agm-marker-cluster
                  imagePath="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
                  imageExtension="png"
                  maxZoom="20"
          >
              <agm-marker *ngFor="let terminal of terminals$ | async"
                          [latitude]="terminal.latitude"
                          [longitude]="terminal.longitude"
                          [visible]="true"
                          [title]="terminal.name"
                          [iconUrl]="terminal.icon"
                          [agmFitBounds]="true"
                          (markerClick)="onMarkerClick(terminal)"
              >
                  <agm-info-window>
                      <terminal-info [terminal]="terminal"></terminal-info>
                  </agm-info-window>
              </agm-marker>
          </agm-marker-cluster>
          <agm-circle

                  [longitude]="(service.coordinates | async).longitude"
                  [latitude]="(service.coordinates | async).latitude"
                  [radius]="(service.radius | async).value *1000"
                  fillOpacity=".1"
                  [fillColor]="circleColor"
                  [strokeColor]="circleColor"
                  strokeOpacity="0.3"
                  strokeWeight="2"
                  [clickable]="false"

          >

          </agm-circle>
      </agm-map>
      <message-window [message]="message$" (state)="onMessageWindowClose($event)"></message-window>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GoogleMapComponent implements OnInit, OnDestroy {
  circleVisible = true;
  circleColor = '#090';

  styles: MapTypeStyle[];
  message$: Subject<IMessageItem> = new Subject<IMessageItem>();
  coordinates: ICoordinates = {source: 'init', latitude: 40, longitude: -76};

  public terminals$: Observable<ITerminalInfo[]>;

  @ViewChildren(AgmInfoWindow)
  private infoWindows: QueryList<AgmInfoWindow>;
  @ViewChildren(AgmMarker)
  private _markers: QueryList<AgmMarker>;
  @ViewChild(AgmMap, {static: true}) private mapComponent: AgmMap;
  private _map: GoogleMap;

  constructor(
    @Inject(FIT_BOUNDS_SERVICE) public fitBounds: IFitBoundsService,
    @Inject(VIEW_UPDATE_SERVICE) private view: IViewUpdateService,
    @Inject(APP_CONFIG) private config: IAppConfig,
    @Inject(DATA_SERVICE) private data: IDataService,
    @Inject(TERMINAL_FILTER_SERVICE) public service: ITerminalFilterService,
    private cdr: ChangeDetectorRef) {
  }

  onMessageWindowClose(state: IMessageWindowState) {
    if (!state.submitted) {
      return;
    }
    switch (state.action) {
      case 'back':
        this.service.backCoordinates();
        break;

    }
  }

  onMarkerClick(terminal: ITerminalInfo) {
    this.closeAllInfoWindows();
    this.data.loadTerminalPrices('terminal_prices', terminal._id)
      .subscribe((prices: ITerminalPrice[]) => {
        terminal.showPrice(prices);
      });
  }

  onMapReady(map) {

    this._map = map;

    this._map.addListener('dragend', () => {
      const coordinates: LatLng = this._map.getCenter();

      this.service.changeCoordinates({source: 'mouse', latitude: coordinates.lat(), longitude: coordinates.lng()});
      // this.service.coordinates.pipe(take<ICoordinates>(1))
      //   .subscribe((_: ICoordinates) => this.service.fitBounds.next(false));

    });
  }

  ngOnInit() {
    this.view.onUpdate().subscribe(() => this.cdr.detectChanges());
    this.service.init();
    this.styles = this.config.stylesConfig;

    this.service.coordinates
      .subscribe((coordinates: ICoordinates) => {
        this.coordinates = coordinates;
      });

    this.terminals$ = this.service.terminals$.pipe(
      filter((terminals: ITerminalInfo[]) => {
        return terminals.length > 0;
      })
    );

    this.service.terminals$
      .pipe(
        delay(1),
        withLatestFrom(this.fitBounds.value$)
      )
      .subscribe((terminals: ITerminalInfo[]) => {

        this.fitBounds.set(terminals.length > 0);

      });

    this.service.terminals$.pipe(
      filter((terminals: ITerminalInfo[]) => !terminals || terminals.length === 0),
      withLatestFrom(this.service.filters$, (_, filters: IFilters) => filters),
      filter((filters: IFilters) => filters.coordinates.source !== 'init')
    ).subscribe((filters: IFilters) => {
      const config: IDistanceUnit = this.config.distanceUnits[filters.radius.unit];
      let message: IMessageItem;

      switch (filters.coordinates.source) {
        case 'address':
          message = TerminalMessages.terminalsByAddressNotFound(
            filters.coordinates.address,
            Math.round(filters.radius.value / config.dim),
            filters.radius.label
          );
          break;
        default:
          message = TerminalMessages.terminalsNotFound(
            Math.round(filters.radius.value / config.dim),
            filters.radius.label
          );
      }
      this.message$.next(message);
    });


    this.terminals$
      .pipe(filter((_: ITerminalInfo[]) => !!this._markers))
      .subscribe((terminals: ITerminalInfo[]) => {

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
