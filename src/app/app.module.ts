import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {DATA_SERVICE, DataService} from './services/data.service';

import {AgmCoreModule, GoogleMapsAPIWrapper, InfoWindowManager} from '@agm/core';
import {HttpClientModule} from '@angular/common/http';
import {GoogleMapModule} from './components/googlemap/googlemap.component';
import {TerminalFilterFormModule} from './components/terminal-filter-form/terminal-filter-form.component';
import {TERMINAL_FILTER_SERVICE, TerminalFilterService} from './services/terminal-filter.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {APP_CONFIG, appConfig} from './app.config';
import {VIEW_UPDATE_SERVICE, ViewUpdateService} from './services/view-update.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    GoogleMapModule,
    AgmCoreModule.forRoot({apiKey: 'AIzaSyAeK50XUYcxCwBDAEK0MAbTKi5zFpRhXqY', libraries: ['places']}),
    TerminalFilterFormModule
  ],
  providers: [
    {provide: VIEW_UPDATE_SERVICE, useClass: ViewUpdateService},
    {provide: APP_CONFIG, useValue: appConfig},
    {provide: DATA_SERVICE, useClass: DataService},
    {provide: TERMINAL_FILTER_SERVICE, useClass: TerminalFilterService},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
