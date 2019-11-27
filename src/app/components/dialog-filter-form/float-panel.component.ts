import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {DomHandler} from 'primeng/components/dom/domhandler';
import {GooglePlaceModule} from '../../libraries/ngx-google-places-autocomplete/src/ngx-google-places-autocomplete.module';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {FieldsetModule} from 'primeng/fieldset';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {CommonModule} from '@angular/common';

let idx = 0;

interface IEvent {
  target: any;
  listener: any;
}

interface IEvents {
  drag?: IEvent;
  dragend?: IEvent;
  mousemove?: IEvent;
  mouseup?: IEvent;
  mouseout?: IEvent;
  resize?: IEvent;
}

@Component({
  selector: 'float-panel',
  template: `
      <div [ngClass]="ngClass" (dragstart)="stopDrag($event)">
          <div #titlebar
               class="float-panel__titlebar float-panel-titlebar ui-widget-header ui-helper-clearfix ui-corner-top"
               (mousedown)="initDrag($event)">
              <span [attr.id]="id + '-label'" class="ui-dialog-title">{{header}}</span>
              <span [attr.id]="id + '-label'" class="ui-dialog-title">
                    <ng-content select="p-header"></ng-content>
                </span>
              <a [ngClass]="{'float-panel__titlebar-icon ui-corner-all':true}"
                 tabindex="0" role="button" (click)="toggle($event)" (keydown.enter)="toggle($event)">

                  <span [class]="collapseIcon"></span>
              </a>
          </div>
          <div class="float-panel__content ui-widget-content"
               [@tabContent]="getTabContent()"
               (@tabContent.done)="onToggleDone($event)"
               [ngClass]="{'ui-state-active': expanded}"
          >
              <div #content class="" [ngStyle]="contentStyle">
                  <ng-content></ng-content>
              </div>
          </div>

      </div>
  `,
  animations: [
    trigger('tabContent', [
      state('collapsed', style({
        height: '0'
      })),
      state('void', style({
        height: '{{height}}'
      }), {params: {height: '0'}}),
      state('expanded', style({
        height: '*'
      })),
      transition('expanded <=> collapsed', animate('{{transitionParams}}')),
      transition('void => collapsed', animate('{{transitionParams}}')),
      transition('void => expanded', animate('{{transitionParams}}'))
    ])
  ]
})

export class FloatPanelComponent implements OnDestroy, OnInit, AfterViewInit {
  @Input() expanded = true;
  @Output() displayChange = new EventEmitter<boolean>();
  @Input() header: string;
  @Input() contentStyle: any;
  @Input() draggable = true;

  @Input() responsive = true;

  @Input() autoZIndex = true;
  @Input() transitionOptions = '400ms cubic-bezier(0.86, 0, 0.07, 1)';
  id = `ui-dialog-${idx++}`;


  @ViewChild('titlebar', {static: false}) titlebarViewChild: ElementRef;

  @ViewChild('content', {static: false}) contentViewChild: ElementRef;

  @Output() onShow: EventEmitter<any> = new EventEmitter();

  @Output() onHide: EventEmitter<any> = new EventEmitter();

  @Output() expandedChange: EventEmitter<any> = new EventEmitter();

  @Input() positionLeft: number;

  @Input() positionTop: number;
  titlebar: HTMLDivElement;
  container: HTMLDivElement;
  lastMouseLeft: number;

  lastMouseTop: number;
  lastScrollX: number;
  lastScrollY: number;
  // documentScrollListener: any;
  documentMousemoveListener: any;
  documentResponsiveListener: any;
  containerStyle = {};
  public ngClass = {};
  collapseIcons = {
    down: 'pi pi-arrow-circle-down',
    up: 'pi pi-arrow-circle-up'
  };
  collapseIcon: string;
  animating = false;
  _style: any;
  documentKeydownListener: any;
  @Input() breakpoint = 640;
  preWidth: string;
  @Input() baseZIndex = 0;
  @Input() focusOnShow = true;
  documentDragListener: any;
  documentDragEndListener: any;
  dragging: boolean;
  @Input() minX = 0;
  @Input() minY = 0;
  _events: IEvents = {};
  lastContainerLeft: number;
  lastContainerTop: number;

  constructor(public el: ElementRef, public renderer: Renderer2, public zone: NgZone, private cdr: ChangeDetectorRef) {

  }

  ngOnDestroy() {
    this.unbindEvents();
    this.dragging = false;
  }

  ngOnInit(): void {
    this.expanded = true;
    this.setCollapseIcon(this.expanded);
    this.collapseIcon = this.collapseIcons.down;
    this.containerStyle = {top: this.positionTop, right: 0};
    this._style = {left: 0, top: 0, height: 0, width: 0};

    this.ngClass = {
      'float-panel ui-widget ui-widget-content ui-corner-all ui-shadow': true,
      'float-panel-draggable': this.draggable,
      'float-panel-collapsed': !this.expanded
    };
  }

  stopDrag(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  bindGlobalListeners() {

    if (this.draggable) {
      this.bindEvent('mousemove', this.onDrag, this.titlebar);
      this.bindEvent('mouseup', this.endDrag, this.titlebar);
      this.bindEvent('mouseout', this.onMouseOut, this.container);
    }

    if (this.responsive) {
      this.bindEvent('resize', this.onWindowResize, window);
    }
  }

  onMouseOut(event: MouseEvent) {
    this.dragging = false;
  }

  onWindowResize() {


    const viewport = DomHandler.getViewport();
    if (viewport.width <= this.breakpoint) {
      if (!this.preWidth) {
        this.preWidth = this._style.width;
      }

      this._style.left = '0px';
      this._style.width = '100%';

      // outside zone
      this.container.style.left = this._style.left;
      this.container.style.width = this._style.width;
    } else {
      if (this.preWidth) {
        this._style.width = this.preWidth;
      }

      // outside zone
      this.container.style.left = this._style.left;
      this.container.style.top = this._style.top;
      this.container.style.width = this._style.width;

      this.positionOverlay();
    }
  }

  ngAfterViewInit() {


    this.container = this.el.nativeElement;
    this.titlebar = this.titlebarViewChild.nativeElement;

    this.moveOnTop();
    this.positionOverlay();

    this.bindGlobalListeners();

    if (this.focusOnShow) {
      this.focus();
    }


  }

  focus() {
    const focusable = DomHandler.findSingle(this.titlebar, 'button');
    if (focusable) {
      this.zone.runOutsideAngular(() => {
        setTimeout(() => focusable.focus(), 5);
      });
    }
  }

  moveOnTop() {
    if (this.autoZIndex) {
      this.container.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
    }
  }

  positionOverlay() {

    const viewport = DomHandler.getViewport();

    const containerHeight = DomHandler.getOuterHeight(this.container);

    const content = this.contentViewChild.nativeElement;

    if (containerHeight + content.scrollHeight - content.clientHeight > viewport.height) {
      content.style.height = (viewport.height * .75) + 'px';
    } else {
      content.style.height = null;
    }

    // if (this.positionLeft >= 0 && this.positionTop >= 0) {
    this.container.style.left = this.positionLeft + 'px';
    this.container.style.top = this.positionTop + 'px';


    this.lastContainerLeft = this.container.offsetLeft;
    this.lastContainerTop = this.container.offsetTop;

    // } else if (this.positionTop >= 0) {
    //   this.center();
    //   this._style.top = this.positionTop + 'px';
    // } else {
    //   this.center();
    // }
  }

  endDrag(event: MouseEvent) {

    this.dragging = false;
    DomHandler.removeClass(document.body, 'ui-unselectable-text');

  }

  unbindEvents() {
    Object.keys(this._events).forEach((event_name: string) => {
      const event: IEvent = this._events[event_name];
      event.target.removeEventListener(event_name, event.listener);
    });
  }

  bindEvent(name: keyof IEvents, callback: any, target: any) {
    this.zone.runOutsideAngular(() => {
      const listener = callback.bind(this);
      this._events[name] = {listener, target};
      target.addEventListener(name, listener);
    });
  }

  initDrag(event: MouseEvent) {


    this.dragging = true;
    this.lastMouseLeft = event.pageX;
    this.lastMouseTop = event.pageY;
    DomHandler.addClass(document.body, 'ui-unselectable-text');

  }

  onDrag(event: MouseEvent) {
    if (this.dragging) {

      const offsetLeft = event.pageX - this.lastMouseLeft;
      const offsetTop = event.pageY - this.lastMouseTop;

      if (Math.abs(offsetLeft + offsetTop) < 2) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }

      const posLeft = this.lastContainerLeft + offsetLeft;
      const posTop = this.lastContainerTop + offsetTop;

      this.container.style.left = posLeft + 'px';

      this.container.style.top = posTop + 'px';

      this.lastMouseLeft = event.pageX;
      this.lastMouseTop = event.pageY;

      this.lastContainerLeft = posLeft;
      this.lastContainerTop = posTop;
      event.stopPropagation();
      event.preventDefault();


    } else {
      // console.log('Dragging false');
    }
  }

  setCollapseIcon(collapsed: boolean) {
    if (collapsed) {
      this.collapseIcon = this.collapseIcons.up;
    } else {
      this.collapseIcon = this.collapseIcons.down;
    }
  }

  getTabContent() {
    if (this.expanded) {
      return {
        value: 'expanded',
        params: {transitionParams: this.animating ? this.transitionOptions : '0ms', height: '*'}
      };
    } else {
      return {value: 'collapsed', params: {transitionParams: this.transitionOptions, height: '0'}};
    }
  }

  toggle(event) {
    if (this.animating) {
      return false;
    }
    this.animating = true;
    this.expanded = !this.expanded;
    this.setCollapseIcon(this.expanded);
    event.preventDefault();
    this.cdr.detectChanges();
  }

  onToggleDone(event: Event) {
    this.animating = false;
  }
}

@NgModule({
  imports: [
    CommonModule,
    GooglePlaceModule,
    DropdownModule,
    ButtonModule,
    FieldsetModule,
  ],
  exports: [FloatPanelComponent],
  declarations: [FloatPanelComponent],
  providers: [],
})
export class FloatPanelModule {
}
