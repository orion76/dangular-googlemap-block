import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {DATA_SERVICE, DataService} from './services/data.service';

import {AgmCoreModule} from '@agm/core';
import {HttpClientModule} from '@angular/common/http';
import {GoogleMapModule} from './components/googlemap/googlemap.component';
import {TerminalFilterFormModule} from './components/terminal-filter-form/terminal-filter-form.component';
import {TERMINAL_FILTER_SERVICE, TerminalFilterService} from './services/terminal-filter.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {APP_CONFIG, appConfig} from './app.config';
import {VIEW_UPDATE_SERVICE, ViewUpdateService} from './services/view-update.service';
import {FIT_BOUNDS_SERVICE, FitBoundsService} from './services/fitbounds.service';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {MESSAGE_SERVICE, MessageService} from './services/message.service';
import {STATE_MAP_SERVICE, StateMapService} from './services/state-map.service';
import {STATE_FILTERS_SERVICE, StateFiltersService} from './services/state-filters.service';
import {SEARCH_HISTORY_SERVICE, SearchHistoryService} from './services/search-history.service';
import {TERMINALS_SERVICE, TerminalsService} from './services/terminals.service';
import {GOOGLE_API_SERVICE, GoogleApiService} from './services/google.service';
import {AccordionModule} from 'primeng/accordion';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    GoogleMapModule,
    AgmCoreModule.forRoot({apiKey: appConfig.apiKeys.google, libraries: ['places']}),
    TerminalFilterFormModule,
    DialogModule,
    ButtonModule,
    AccordionModule
  ],
  providers: [

    {provide: GOOGLE_API_SERVICE, useClass: GoogleApiService},
    {provide: VIEW_UPDATE_SERVICE, useClass: ViewUpdateService},
    {provide: FIT_BOUNDS_SERVICE, useClass: FitBoundsService},
    {provide: APP_CONFIG, useValue: appConfig},
    {provide: DATA_SERVICE, useClass: DataService},
    {provide: STATE_MAP_SERVICE, useClass: StateMapService},
    {provide: STATE_FILTERS_SERVICE, useClass: StateFiltersService},
    {provide: SEARCH_HISTORY_SERVICE, useClass: SearchHistoryService},
    {provide: MESSAGE_SERVICE, useClass: MessageService},
    {provide: TERMINAL_FILTER_SERVICE, useClass: TerminalFilterService},
    {provide: TERMINALS_SERVICE, useClass: TerminalsService},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
