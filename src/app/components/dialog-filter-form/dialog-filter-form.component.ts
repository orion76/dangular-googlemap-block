import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  NgModule, NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList, Renderer2,
  ViewChild
} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {DomHandler} from 'primeng/components/dom/domhandler';
import {GooglePlaceModule} from '../../libraries/ngx-google-places-autocomplete/src/ngx-google-places-autocomplete.module';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {FieldsetModule} from 'primeng/fieldset';
import {animate, state, style, transition, trigger, AnimationEvent} from '@angular/animations';
import {Footer, Header} from 'primeng/shared';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'ext-p-dialog',
  template: `
      <div #container [ngClass]="ngClass" (dragstart)="stopDrag($event)">
          <div #titlebar class="ui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-corner-top"
               (mousedown)="initDrag($event)">
              <span [attr.id]="id + '-label'" class="ui-dialog-title">{{header}}</span>
              <span [attr.id]="id + '-label'" class="ui-dialog-title">
                    <ng-content select="p-header"></ng-content>
                </span>
              <a [ngClass]="{'ui-dialog-titlebar-icon ui-dialog-titlebar-collapse ui-corner-all':true}"
                 tabindex="0" role="button" (click)="toggle($event)" (keydown.enter)="toggle($event)"
                 (mousedown)="onCloseMouseDown($event)">
                  <span [class]="collapseIcon"></span>
              </a>
          </div>
          <div class="dialog__content ui-dialog-content ui-widget-content"
               [@tabContent]="getTabContent()"
               (@tabContent.done)="onToggleDone($event)"
               [ngClass]="{'ui-state-active': visible}"
          >
              <div #content class="" [ngStyle]="contentStyle">
                  <ng-content></ng-content>
              </div>
              <div #footer class="ui-dialog-footer ui-widget-content" *ngIf="footerFacet && footerFacet.first">
                  <ng-content select="p-footer"></ng-content>
              </div>
              <div *ngIf="resizable" class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se"
                   style="z-index: 90;" (mousedown)="initResize($event)"></div>
          </div>

      </div>
  `,
  animations: [
    trigger('tabContent', [
      state('hidden', style({
        height: '0'
      })),
      state('void', style({
        height: '{{height}}'
      }), {params: {height: '0'}}),
      state('visible', style({
        height: '*'
      })),
      transition('visible <=> hidden', animate('{{transitionParams}}')),
      transition('void => hidden', animate('{{transitionParams}}')),
      transition('void => visible', animate('{{transitionParams}}'))
    ])
  ]
})

export class DialogFilterFormComponent extends Dialog implements OnDestroy, OnInit, AfterViewInit {
  @Input() display = true;
  @Output() displayChange = new EventEmitter<boolean>();
  @Input() header: string;

  @Input() draggable = true;

  @Input() resizable = true;


  @Input() closable = false;

  @Input() responsive = true;

  @Input() appendTo: any;

  @Input() showHeader = true;

  @Input() autoZIndex = true;
  @Input() transitionOptions = '400ms cubic-bezier(0.86, 0, 0.07, 1)';


  @ContentChildren(Header, {descendants: false}) headerFacet: QueryList<Header>;

  @ContentChildren(Footer, {descendants: false}) footerFacet: QueryList<Header>;

  @ViewChild('titlebar', {static: false}) headerViewChild: ElementRef;

  @ViewChild('content', {static: false}) contentViewChild: ElementRef;
  @ViewChild('container', {static: false}) containerViewChild: ElementRef;

  @ViewChild('footer', {static: false}) footerViewChild: ElementRef;

  @Output() onShow: EventEmitter<any> = new EventEmitter();

  @Output() onHide: EventEmitter<any> = new EventEmitter();

  @Output() visibleChange: EventEmitter<any> = new EventEmitter();

  @Input() positionLeft: number;

  @Input() positionTop: number;

  containerStyle = {};
  public ngClass = {};
  collapseIcons = {
    down: 'pi pi-arrow-circle-down',
    up: 'pi pi-arrow-circle-up'
  };
  collapseIcon: string;
  animating = false;

  constructor(public el: ElementRef, public renderer: Renderer2, public zone: NgZone, private cdr: ChangeDetectorRef) {
    super(el, renderer, zone);
  }

  ngOnInit(): void {
    this.display = true;
    this.setCollapseIcon(this.display);
    this.collapseIcon = this.collapseIcons.down;
    this.containerStyle = {top: this.positionTop, right: 0};

    this.ngClass = {
      'ui-dialog ui-widget ui-widget-content ui-corner-all ui-shadow': true,
      'ui-dialog-rtl': 'rtl',
      'ui-dialog-draggable': this.draggable,
      'ui-dialog-resizable': this.resizable,
      'fieldset-collapsed': !this.display
    };
  }

  stopDrag(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  ngAfterViewInit() {

    this.container = this.containerViewChild.nativeElement;

    this.container.style.top = this.positionTop + 'px';
    this.container.style.left = this.positionLeft + 'px';

    this.appendContainer();
    this.moveOnTop();
    this.positionOverlay();
    this.bindGlobalListeners();

    if (this.maximized) {
      DomHandler.addClass(document.body, 'ui-overflow-hidden');
    }

    if (this.modal) {
      this.enableModality();
    }

    if (this.focusOnShow) {
      this.focus();
    }

    if (this.responsive) {
      this.onWindowResize();
    }


  }

  bindDocumentDragListener() {
    this.zone.runOutsideAngular(() => {
      this.documentDragListener = this.onDrag.bind(this);
      this.container.addEventListener('mousemove', this.documentDragListener);
    });
  }

  unbindDocumentDragListener() {
    if (this.documentDragListener) {
      this.container.removeEventListener('mousemove', this.documentDragListener);
      this.documentDragListener = null;
    }
  }

  bindDocumentDragEndListener() {
    this.zone.runOutsideAngular(() => {
      this.documentDragEndListener = this.endDrag.bind(this);
      this.container.addEventListener('mouseup', this.documentDragEndListener);
    });
  }

  unbindDocumentDragEndListener() {
    if (this.documentDragEndListener) {
      this.container.removeEventListener('mouseup', this.documentDragEndListener);
      this.documentDragEndListener = null;
    }
  }

  initDrag(event: MouseEvent) {
    if (this.closeIconMouseDown) {
      this.closeIconMouseDown = false;
      return;
    }

    if (this.draggable) {
      this.dragging = true;
      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
      DomHandler.addClass(document.body, 'ui-unselectable-text');
    }
  }

  onDrag(event: MouseEvent) {
    if (this.dragging) {
      const containerWidth = DomHandler.getOuterWidth(this.container);
      const containerHeight = DomHandler.getOuterHeight(this.container);
      const deltaX = event.pageX - this.lastPageX;
      const deltaY = event.pageY - this.lastPageY;
      const offset = DomHandler.getOffset(this.container);
      const leftPos = offset.left + deltaX;
      const topPos = offset.top + deltaY;
      const viewport = DomHandler.getViewport();

      if (leftPos >= this.minX) {
        this.container.style.left = leftPos + 'px';
      }

      if (topPos >= this.minY) {
        this.container.style.top = topPos + 'px';
      }

      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
      event.stopPropagation();
      event.preventDefault();
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
    if (this.display) {
      return {
        value: 'visible',
        params: {transitionParams: this.animating ? this.transitionOptions : '0ms', height: '*'}
      };
    } else {
      return {value: 'hidden', params: {transitionParams: this.transitionOptions, height: '0'}};
    }
  }

  toggle(event) {
    if (this.animating) {
      return false;
    }
    this.animating = true;
    this.display = !this.display;
    this.setCollapseIcon(this.display);
    event.preventDefault();
    this.cdr.detectChanges();
  }

  onToggleDone(event: Event) {
    this.animating = false;
  }

  onCloseMouseDown(event: Event) {
    this.closeIconMouseDown = true;
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
  exports: [DialogFilterFormComponent],
  declarations: [DialogFilterFormComponent],
  providers: [],
})
export class DialogFilterFormModule {
}
