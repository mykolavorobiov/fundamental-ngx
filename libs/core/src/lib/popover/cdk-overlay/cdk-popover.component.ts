import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostBinding,
    Input,
    OnInit,
    Optional,
    Output,
    Renderer2, TemplateRef,
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
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';

let popoverUniqueId = 0;

const DefaultPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'center', originY: 'center', overlayX: 'start', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' }
]

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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CdkPopoverComponent extends BasePopoverClass implements AfterViewInit, OnInit {

    /** @hidden */
    @ViewChild(CdkConnectedOverlay)
    overlay: CdkConnectedOverlay;

    /** @hidden */
    @ViewChild('templateRef', { read: TemplateRef })
    templateRef: TemplateRef<any>;

    /** @hidden */
    @ViewChild('vc', { read: ViewContainerRef })
    vc: ViewContainerRef;

    /** @hidden */
    @ViewChild(CdkOverlayOrigin)
    triggerOrigin: CdkOverlayOrigin

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
    placement: string;

    @Input()
    cdkPositions: ConnectedPosition[];

    /** Whether the popover is open. Can be used through two-way binding. */
    @Input()
    isOpen = false;

    /** List of additional classes that will be added to popover container element */
    @Input()
    additionalClasses: string[] = [];

    /** Whether the popover should be focusTrapped. */
    @Input()
    focusTrapped = false;

    /** Whether the popover should close when a click is made outside its boundaries. */
    @Input()
    closeOnOutsideClick = true;

    /** Whether the popover should close when the escape key is pressed. */
    @Input()
    closeOnEscapeKey = true;

    /** Event emitted when the state of the isOpen property changes. */
    @Output()
    isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Id of the popover. If none is provided, one will be generated. */
    @Input()
    id: string = 'fd-popover-' + popoverUniqueId++;

    /** TODO: */
    positions: FlexibleConnectedPositionStrategy;

    private eventRef: Function[] = [];

    private _overlayRef: OverlayRef;


    constructor(
        private _renderer: Renderer2,
        private _changeDetectorReference: ChangeDetectorRef,
        private _overlay: Overlay,
        @Optional() private _rtlService: RtlService
    ) {super()}

    ngOnInit(): void {
        if (!this.scrollStrategy) {
            this.scrollStrategy = this._overlay.scrollStrategies.reposition();
        }
    }

    ngAfterViewInit(): void {
        this.addTriggerListeners();

        if (this.overlay) {
            this.overlay.attach
                .subscribe(() => {
                    console.log('attached');
                    console.log(this._getPositions());
                    console.log(this.triggerOrigin.elementRef);
                    }
                )
            ;
        }


        this._changeDetectorReference.detectChanges();
    }

    debug(a): void {
        console.log(a.scrollStrategy);
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
        if (this.isOpen) {
            this.isOpen = false;
            this._overlayRef.dispose()
            this._changeDetectorReference.detectChanges();
            this.isOpenChange.emit(this.isOpen);
        }
    }

    /**
     * Opens the popover.
     */
    public open(): void {
        console.log(this.positions);
        if (!this.isOpen) {
            this._overlayRef = this._overlay.create(this._getOverlayConfig());
            this._overlayRef.attach(new TemplatePortal(this.templateRef, this.vc))

            this.isOpen = true;
            this._changeDetectorReference.detectChanges();
            this.isOpenChange.emit(this.isOpen);
        }
    }

    /**
     * Forces an update of the popover's positioning calculation.
     */
    public updatePopover(): void {
        // this.directiveRef.updatePopper();
    }

    /**
     * Function is called every time popover changes open attribute
     */
    public openChanged(isOpen: boolean): void {
        this.isOpenChange.emit(isOpen);
    }

    /** Method that is called, when there is keydown event dispatched */
    public handleKeydown(event: KeyboardEvent): void {
        if (KeyUtil.isKey(event, 'ArrowDown') && event.altKey) {
            this.open();
        }

        if (KeyUtil.isKey(event, 'Escape') && this.closeOnEscapeKey) {
            console.log('escape');
            this.close();
        }
    }



    handleBackdropClick(event: MouseEvent): void {
        console.log(event);
        console.log('backdrop click');
        if (this.closeOnOutsideClick) {
            this.close();
        }
    }

    handleOverlayOutsideClick(event: MouseEvent): void {
        if (this._shouldClose(event)) {
            this.close();
        }
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
            return this.cdkPositions
        }

        if (!this.placement) {
            return DefaultPositions;
        }

        return [{ originX: this._interpretPositionX(), originY: this._interpretPositionY(), overlayX: 'start', overlayY: 'top' }];
    }

    private _interpretPositionY(): YPositions {
        const position: YPositions = yPositions.find(_position => this.placement.includes(_position));
        return position || 'top';
    }

    private _interpretPositionX(): XPositions {
        const position: XPositions = xPositions.find(_position => this.placement.includes(_position));
        return position || 'start';
    }

    private _getDirection(): 'rtl' | 'ltr' {
        if (!this._rtlService) {
            return 'ltr';
        }

        return this._rtlService.rtl.getValue() ? 'rtl' : 'ltr';
    }

    private _getOverlayConfig(): OverlayConfig {
        const direction = this._getDirection();
        const position = this._overlay
            .position()
            .flexibleConnectedTo(this.triggerOrigin.elementRef)
            .withPositions(this._getPositions())
            .withPush(false);
        return new OverlayConfig({
            direction: direction,
            positionStrategy: position,
            scrollStrategy: this.scrollStrategy
        })
    }
}
