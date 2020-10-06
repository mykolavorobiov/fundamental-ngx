import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostBinding,
    Input, OnChanges, OnDestroy,
    OnInit,
    Optional,
    Output,
    Renderer2, SimpleChanges, TemplateRef,
    ViewChild, ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    ConnectedPosition,
    FlexibleConnectedPositionStrategy,
    Overlay, OverlayConfig, OverlayRef,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { RtlService } from '../../utils/services/rtl.service';
import { BasePopoverClass } from '../base/base-popover.class';
import { KeyUtil } from '@fundamental-ngx/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { merge, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { OverlayPositionBuilder } from '@angular/cdk/overlay/position/overlay-position-builder';

let popoverUniqueId = 0;

const DefaultPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'center', originY: 'center', overlayX: 'start', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
];

export type XPositions = 'start' | 'center' | 'end';
export type YPositions = 'top' | 'center' | 'bottom';

const yPositions: YPositions[] = ['bottom', 'center', 'top'];
const xPositions: XPositions[] = ['start', 'center', 'end'];

/**
 * The popover is a wrapping component that accepts a *control* as well as a *body*.
 * The control is what will trigger the opening of the actual popover, which is called the body.
 * By default, popovers are triggered by click. This can be customized through the *triggers* input.
 * PopoverComponent is an abstraction of PopoverDirective.
 */
@Component({
    selector: 'fd-cdk-popover',
    templateUrl: './cdk-popover.component.html',
    host: {
        '[class.fd-popover-custom]': 'true',
        '[attr.id]': 'id'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./cdk-popover.component.scss']
})
export class CdkPopoverComponent extends BasePopoverClass implements AfterViewInit, OnInit, OnDestroy, OnChanges, AfterContentInit {

    /** @hidden */
    @ViewChild(CdkConnectedOverlay)
    overlay: CdkConnectedOverlay;

    /** @hidden */
    @ViewChild('templateRef', { read: TemplateRef })
    templateRef: TemplateRef<any>;

    /** @hidden */
    @ViewChild('container', { read: ViewContainerRef })
    container: ViewContainerRef;

    /** @hidden */
    @ViewChild(CdkOverlayOrigin)
    triggerOrigin: CdkOverlayOrigin;

    /** Whether the popover is disabled. */
    @Input()
    @HostBinding('class.fd-popover-custom--disabled')
    disabled = false;

    /** The element to which the popover should be appended. */
    @Input()
    appendTo: HTMLElement | 'body';

    @Input()
    scrollStrategy: ScrollStrategy;

    @Input()
    cdkPositions: ConnectedPosition[];

    @Input()
    placement: string;

    /** Whether the popover should be focusTrapped. */
    @Input()
    focusTrapped = false;

    /** Id of the popover. If none is provided, one will be generated. */
    @Input()
    id: string = 'fd-popover-' + popoverUniqueId++;

    arrowPosition = '';

    /** TODO: */
    positions: FlexibleConnectedPositionStrategy;

    private _initialised = false;

    private eventRef: Function[] = [];

    private _overlayRef: OverlayRef;

    /** An RxJS Subject that will kill the data stream upon component’s destruction (for unsubscribing)  */
    private readonly _onDestroy$: Subject<void> = new Subject<void>();


    constructor(
        private _renderer: Renderer2,
        private _changeDetectorReference: ChangeDetectorRef,
        private _overlay: Overlay,
        @Optional() private _rtlService: RtlService
    ) {
        super();
    }

    ngOnInit(): void {
        if (!this.scrollStrategy) {
            this.scrollStrategy = this._overlay.scrollStrategies.reposition();
        }
    }

    ngAfterViewInit(): void {
        this._initialised = true;
        this.addTriggerListeners();
        if (this.isOpen) {
            this.open();
        }
    }

    ngAfterContentInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this._initialised) {
            if (changes['isOpen'].currentValue) {
                this.open();
            } else {
                this.close();
            }
        }
    }

    ngOnDestroy(): void {
        this._onDestroy$.next();
        this._onDestroy$.complete();
        if (this._overlayRef) {
            this._overlayRef.detach();
        }
    }

    /**
     * Toggles the popover open state.
     */
    public toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Closes the popover.
     */
    public close(): void {
        if (this._overlayRef && this._overlayRef.hasAttached()) {
            console.log('close');
            this.isOpen = false;
            this._overlayRef.dispose();
            this._changeDetectorReference.detectChanges();
            this.isOpenChange.emit(this.isOpen);
        }
    }

    /**
     * Opens the popover.
     */
    public open(): void {
        if (!this._overlayRef || !this._overlayRef.hasAttached()) {
            console.log('open');
            this._overlayRef = this._overlay.create(this._getOverlayConfig());
            this._overlayRef.attach(new TemplatePortal(this.templateRef, this.container));

            this.isOpen = true;
            this._changeDetectorReference.detectChanges();

            this.isOpenChange.emit(this.isOpen);
            this._listenOnOutClicks();
        }
    }

    /**
     * Function is called every time popover changes open attribute
     */
    public openChanged(isOpen: boolean): void {
        this.isOpenChange.emit(isOpen);
    }

    public refreshPosition(positions?: ConnectedPosition[]): void {
        const refPosition = this._getPositionStrategy(positions);
        refPosition.positionChanges.subscribe(event => console.log(event.connectionPair.panelClass));
        this._overlayRef.updatePositionStrategy(refPosition);
    }

    /** Method that is called, when there is keydown event dispatched */
    public handleKeydown(event: KeyboardEvent): void {
        if (KeyUtil.isKey(event, 'ArrowDown') && event.altKey && !this.isOpen) {
            this.open();
        }

        if (KeyUtil.isKey(event, 'Escape') && this.closeOnEscapeKey && this.isOpen) {
            this.close();
        }
    }

    private _listenOnOutClicks(): void {
        /** Merge observables */
        const refreshObs = merge(this.isOpenChange, this._onDestroy$);

        this._overlayRef.backdropClick().pipe(
            filter(event => this._shouldClose(event)),
            takeUntil(refreshObs)
        ).subscribe(() => this.close());

        this._overlayRef._outsidePointerEvents.pipe(
            filter(() => this.closeOnOutsideClick),
            takeUntil(refreshObs)
        ).subscribe(() => this.close());
    }

    private addTriggerListeners(): void {
        if (this.triggers && this.triggers.length > 0) {
            this.triggers.forEach(trigger => {
                this.eventRef.push(this._renderer.listen(this.triggerOrigin.elementRef.nativeElement, trigger, () => {
                    this.toggle();
                }));
            });
        }
    }

    /** @hidden */
    private _triggerContainsTarget(event: Event): boolean {
        const triggerElement = this.triggerOrigin.elementRef.nativeElement;
        return triggerElement.contains(event.composedPath()[0]);
    }

    /** @hidden */
    private _shouldClose(event: MouseEvent): boolean {
        return (
            this.isOpen &&
            this.closeOnOutsideClick &&
            !this._triggerContainsTarget(event)
        );
    }

    /** @hidden */
    private _getPositions(): ConnectedPosition[] {
        if (this.cdkPositions) {
            return this.cdkPositions;
        }

        if (!this.placement) {
            return DefaultPositions;
        }

        const xPosition = this._interpretPositionX();
        const yPosition = this._interpretPositionY();
        const overlayYPosition = this._getOppositePositionY(yPosition);
        const overlayXPosition = this._getOppositePositionX(xPosition);

        return [{
            originX: xPosition,
            originY: yPosition,
            overlayX: xPosition,
            overlayY: yPosition
        }];
    }

    private _getOppositePositionX(position: XPositions): XPositions {
        if (position === 'start') {
            return 'end';
        }
        if (position === 'end') {
            return 'start';
        }
        return position;
    }

    private _getOppositePositionY(position: YPositions): YPositions {
        if (position === 'top') {
            return 'bottom';
        }
        if (position === 'bottom') {
            return 'top';
        }
        return position;
    }

    private _interpretPositionY(): YPositions {
        const position: YPositions = yPositions.find(_position => this.placement.includes(_position));
        return position || 'center';
    }

    private _interpretPositionX(): XPositions {
        const position: XPositions = xPositions.find(_position => this.placement.includes(_position));
        return position || 'center';
    }

    private _getDirection(): 'rtl' | 'ltr' {
        if (!this._rtlService) {
            return 'ltr';
        }

        return this._rtlService.rtl.getValue() ? 'rtl' : 'ltr';
    }

    private _getOverlayConfig(): OverlayConfig {
        const direction = this._getDirection();
        const position = this._getPositionStrategy();

        return new OverlayConfig({
            direction: direction,
            positionStrategy: position,
            scrollStrategy: this.scrollStrategy
        });
    }

    private _getPositionStrategy(positions?: ConnectedPosition[]): FlexibleConnectedPositionStrategy {

        const _resPosition = positions ? positions : this._getPositions();

        return this._overlay
            .position()
            .flexibleConnectedTo(this.triggerOrigin.elementRef)
            .withPositions(_resPosition.concat(DefaultPositions))
            .withPush(false);
    }

    private _listenForPositionChange(): void {
        this.overlay.positionStrategy.positionChanges.subscribe()
    }
}
