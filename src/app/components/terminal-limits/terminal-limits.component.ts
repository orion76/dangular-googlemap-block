import {Component, Input, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ICoinPrice, ITerminalLimit} from '../types';


@Component({
  selector: 'terminal-limits',
  template: `
      <div class="info-row">
          <div class="label">{{limit.summ}}</div>
          <div class="value">
              <div class="types" *ngFor="let type of limit.types">{{type.name}}</div>
          </div>
      </div>
  `,
})

export class TerminalLimitsComponent implements OnInit {

  @Input() limit: ITerminalLimit;

  debug(...vars: any[]) {
    // console.log('[GoogleMapComponent]', ...vars);
  }

  ngOnInit() {
  }

}


@NgModule({
  imports: [CommonModule],
  exports: [TerminalLimitsComponent],
  declarations: [TerminalLimitsComponent],
  providers: [],
})
export class TerminalLimitModule {
}
