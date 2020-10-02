import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    HostBinding,
    Renderer2,
    AfterViewInit,
    ChangeDetectorRef, Optional, OnInit
} from '@angular/core';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition, Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { RtlService } from '../../utils/services/rtl.service';
import { BasePopoverClass } from '../base/base-popover.class';
import { KeyUtil } from '@fundamental-ngx/core';

let popoverUniqueId = 0;

const DefaultPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'center', originY: 'center', overlayX: 'start', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' }
]

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
    placement;

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
    positions: ConnectedPosition[];

    private eventRef: Function[] = [];


    constructor(
        private _renderer: Renderer2,
        private _changeDetectorReference: ChangeDetectorRef,
        private _overlay: Overlay,
        @Optional() private _rtlService: RtlService
    ) {super()}

    ngOnInit(): void {
        this.positions = this._getPositions();
    }

    ngAfterViewInit(): void {
        this.addTriggerListeners();

        if (this.overlay) {
            this.overlay.attach
                .subscribe(() => this.overlay.overlayRef.setDirection(
                    this.getDirection()
                ))
            ;
        }
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
            console.log('close');
            this.isOpen = false;
            this._changeDetectorReference.detectChanges();
            this.isOpenChange.emit(this.isOpen);
        }
    }

    /**
     * Opens the popover.
     */
    public open(): void {
        if (!this.isOpen) {
            console.log('open');
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

        let positions: ConnectedPosition[] = [];


        return positions;
    }

    private getDirection(): 'rtl' | 'ltr' {
        if (!this._rtlService) {
            return 'ltr';
        }

        return this._rtlService.rtl.getValue() ? 'rtl' : 'ltr';
    }
}
