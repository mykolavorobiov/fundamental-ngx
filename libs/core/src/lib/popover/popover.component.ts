import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ViewEncapsulation,
    ContentChild,
    ChangeDetectionStrategy,
    HostBinding, Renderer2, ElementRef, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import { Placement, PopperOptions } from 'popper.js';
import { PopoverDirective, PopoverFillMode } from './popover-directive/popover.directive';
import { PopoverDropdownComponent } from './popover-dropdown/popover-dropdown.component';
import { ConnectedPosition, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay/position/flexible-connected-position-strategy';
import { CdkConnectedOverlay, CdkOverlayOrigin, Overlay, ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { KeyUtil } from '../utils/functions/key-util';
import { BasePopoverClass } from './base/base-popover.class';

let popoverUniqueId = 0;

/**
 * The popover is a wrapping component that accepts a *control* as well as a *body*.
 * The control is what will trigger the opening of the actual popover, which is called the body.
 * By default, popovers are triggered by click. This can be customized through the *triggers* input.
 * PopoverComponent is an abstraction of PopoverDirective.
 */
@Component({
    selector: 'fd-popover',
    templateUrl: './popover.component.html',
    styleUrls: ['./popover.component.scss'],
    host: {
        '[class.fd-popover-custom]': 'true',
        '[attr.id]': 'id'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverComponent extends BasePopoverClass implements AfterViewInit {
    /** @hidden */
    @ViewChild(PopoverDirective)
    directiveRef: PopoverDirective;

    /** @hidden */
    @ViewChild(CdkConnectedOverlay)
    overlay: CdkConnectedOverlay;

    /** @hidden */
    @ContentChild(PopoverDropdownComponent) dropdownComponent: PopoverDropdownComponent;

    @ViewChild(CdkOverlayOrigin)
    triggerOrigin: CdkOverlayOrigin

    /** Whether the popover is disabled. */
    @Input()
    @HostBinding('class.fd-popover-custom--disabled')
    disabled = false;

    /** The element to which the popover should be appended. */
    @Input()
    appendTo: HTMLElement | 'body';

    /** The placement of the popover. It can be one of: top, top-start, top-end, bottom,
     *  bottom-start, bottom-end, right, right-start, right-end, left, left-start, left-end. */
    @Input()
    placement: Placement = 'bottom-start';


    @Input()
    scrollStrategy: ScrollStrategy;

    @Input()
    position:

    @Input()
    positions: ConnectedPosition[] = [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'center', originY: 'center', overlayX: 'start', overlayY: 'top' },
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' }
    ]

    /** Whether the popover is open. Can be used through two-way binding. */
    @Input()
    isOpen = false;

    /** List of additional classes that will be added to popover container element */
    @Input()
    additionalClasses: string[] = [];

    /** The Popper.js options to attach to this popover.
     * See the [Popper.js Documentation](https://popper.js.org/popper-documentation.html) for details. */
    @Input()
    options: PopperOptions = {
        placement: 'bottom-start',
        modifiers: {
            preventOverflow: {
                enabled: true,
                escapeWithReference: true,
                boundariesElement: 'scrollParent'
            }
        }
    };

    /** Whether the popover should be focusTrapped. */
    @Input()
    focusTrapped = false;

    /**
     * Preset options for the popover body width.
     * * `at-least` will apply a minimum width to the body equivalent to the width of the control.
     * * `equal` will apply a width to the body equivalent to the width of the control.
     * * Leave blank for no effect.
     */
    @Input()
    fillControlMode: PopoverFillMode;

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

    private eventRef: Function[] = [];


    constructor(
        private _renderer: Renderer2,
        private _changeDetectorReference: ChangeDetectorRef,
        private _overlay: Overlay
    ) { super(); }

    ngAfterViewInit(): void {
        this.addTriggerListeners();

        if (this.overlay) {
            this.overlay.attach
                .subscribe(() => this.overlay.overlayRef.setDirection('ltr'));
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
        this.updateDropdownIsOpen(isOpen);
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

    /** @hidden
     *  Function that allows us to control aria-expanded on dropdown child
     * */
    private updateDropdownIsOpen(isOpen: boolean): void {
        if (this.dropdownComponent) {
            this.dropdownComponent.isOpen = isOpen;
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

    private _

    /** @hidden */
    private _getPositions(): ConnectedPosition[] {
        let positions: ConnectedPosition[] = [];
        const offsetYPosition = 0;
        const offsetXPosition = 0;
        if (this._isMenuItem()) {
            if (this._menu.cascadesLeft()) {
                positions = [
                    {
                        originX: 'start',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'top',
                        offsetX: offsetXPosition
                    },
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'bottom',
                        offsetX: offsetXPosition
                    }
                ];
            } else {
                positions = [
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'start',
                        overlayY: 'top',
                        offsetX: -offsetXPosition
                    },
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'bottom',
                        offsetX: -offsetXPosition
                    }
                ];
            }
        } else {
            if (this._menu.cascadesLeft()) {
                positions = [
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top',
                        offsetY: offsetYPosition,
                        offsetX: offsetXPosition
                    },
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'bottom',
                        offsetY: -offsetYPosition,
                        offsetX: offsetXPosition
                    }
                ];
            } else {
                positions = [
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                        offsetY: offsetYPosition,
                        offsetX: -offsetXPosition
                    },
                    {
                        originX: 'start',
                        originY: 'top',
                        overlayX: 'start',
                        overlayY: 'bottom',
                        offsetY: -offsetYPosition,
                        offsetX: -offsetXPosition
                    }
                ];
            }
        }

        return positions;
    }
}
