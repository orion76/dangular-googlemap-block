import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, NgZone, Output} from '@angular/core';
import {Address} from './objects/address';
import {Options} from './objects/options/options';
import {MapsAPILoader} from '@agm/core';

declare let google: any;

@Directive({
  selector: '[ngx-google-places-autocomplete]',
  exportAs: 'ngx-places'
})

export class GooglePlaceDirective implements AfterViewInit {
  @Input() options: Options;
  @Output() changeAddress: EventEmitter<Address> = new EventEmitter();
  public place: Address;
  private autocomplete: any;
  private eventListener: any;

  constructor(private _loader: MapsAPILoader, private el: ElementRef, private ngZone: NgZone) {
  }

  ngAfterViewInit(): void {
    if (!this.options) {
      this.options = new Options();
    }
    this._loader.load().then(() => this.initialize());
  }

  public reset(): void {
    this.autocomplete.setComponentRestrictions(this.options.componentRestrictions);
    this.autocomplete.setTypes(this.options.types);
  }

  private isGoogleLibExists(): boolean {
    return !(!google || !google.maps || !google.maps.places);
  }

  private initialize(): void {
    if (!this.isGoogleLibExists()) {
      throw new Error('Google maps library can not be found');
    }

    this.autocomplete = new google.maps.places.Autocomplete(this.el.nativeElement, this.options);

    if (!this.autocomplete) {
      throw new Error('Autocomplete is not initialized');
    }

    if (!this.autocomplete.addListener != null) { // Check to bypass https://github.com/angular-ui/angular-google-maps/issues/270
      this.eventListener = this.autocomplete.addListener('place_changed', () => {
        this.handleChangeEvent();
      });
    }

    this.el.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!event.key) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'enter' && event.target === this.el.nativeElement) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    // according to https://gist.github.com/schoenobates/ef578a02ac8ab6726487
    if (window && window.navigator && window.navigator.userAgent && navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
      setTimeout(() => {
        const containers = document.getElementsByClassName('pac-container');

        if (containers) {
          const arr = Array.from(containers);

          if (arr) {
            for (const container of arr) {
              if (!container) {
                continue;
              }

              container.addEventListener('touchend', (e) => {
                e.stopImmediatePropagation();
              });
            }

          }
        }
      }, 500);
    }
  }

  private handleChangeEvent(): void {
    this.ngZone.run(() => {
      this.place = this.autocomplete.getPlace();

      if (this.place && this.place.place_id) {
        this.changeAddress.emit(this.place);
      }
    });
  }
}
