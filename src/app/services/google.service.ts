import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter, switchMap} from 'rxjs/operators';
import {InjectionToken} from '@angular/core';
import {GoogleMap} from '@agm/core/services/google-maps-types';

declare let google: any;
export const GOOGLE_API_SERVICE = new InjectionToken('GOOGLE_API_SERVICE');

export interface IGoogleApiService {
  onMapReady(): Observable<GoogleMap>;

  mapReady(map: GoogleMap);

  getPlace(query: string, lat: number, lon: number): Observable<IPlaceResult[]>;
}

export interface IPlaceResult {
  photos: string[];
}

export class GoogleApiService implements IGoogleApiService {
  private _mapSubject: BehaviorSubject<GoogleMap> = new BehaviorSubject<GoogleMap>(null);
  private _map$: Observable<GoogleMap> = this._mapSubject.asObservable();

  constructor() {


  }

  getPlace(query: string, lat: number, lon: number): Observable<IPlaceResult[]> {
    return this.onMapReady().pipe(
      switchMap((map: GoogleMap) => this._getPlace(query, lat, lon, map))
    );
  }

  _getPlace(query: string, lat: number, lng: number, map: GoogleMap) {

    const service = new google.maps.places.PlacesService(map);
    const subject = new Subject<IPlaceResult[]>();


    const request = {
      query,
      locationBias: {center: {lat, lng}, radius: 500},
      fields: ['name', 'photos']
    };

    service.findPlaceFromQuery(request, (results: any[], status: string) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const request = {
          placeId: results[0]['place_id'],
          fields: ['photo']
        };
        debugger;
        service.getDetails(request, (result: any[], status: string) => {

          debugger;
          subject.next(result);
        });

      }
    });

    return subject.asObservable();
  }

  onMapReady(): Observable<GoogleMap> {
    return this._map$.pipe(filter(Boolean));
  }

  mapReady(map: GoogleMap) {
    this._mapSubject.next(map);
  }

  public initialize(): void {
    if (!this.isGoogleLibExists()) {
      throw new Error('Google maps library can not be found');
    }


  }

  private isGoogleLibExists(): boolean {
    return !(!google || !google.maps || !google.maps.places);
  }

}
