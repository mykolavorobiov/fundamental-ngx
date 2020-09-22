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
import { CdkConnectedOverlay, Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { KeyUtil } from '../utils/functions/key-util';

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
export class PopoverComponent implements AfterViewInit {
    /** @hidden */
    @ViewChild(PopoverDirective)
    directiveRef: PopoverDirective;

    /** @hidden */
    @ViewChild(CdkConnectedOverlay)
    overlay: CdkConnectedOverlay;

    /** @hidden */
    @ContentChild(PopoverDropdownComponent) dropdownComponent: PopoverDropdownComponent;

    @ViewChild('triggerElement', { read: ElementRef })
    triggerRef: ElementRef

    /** Whether the popover should have an arrow. */
    @Input()
    noArrow = true;

    /** Whether the popover should have an arrow. */
    @Input()
    hasBackdrop = false;

    /** Whether the popover container needs an extra class for styling. */
    @Input()
    addContainerClass: string;

    /** Whether the popover is disabled. */
    @Input()
    @HostBinding('class.fd-popover-custom--disabled')
    disabled = false;

    /** @deprecated
     * Left for backward compatibility. It's going to be removed on 0.20.0
     */
    @Input()
    isDropdown = false;

    /** The element to which the popover should be appended. */
    @Input()
    appendTo: HTMLElement | 'body';

    /** The trigger events that will open/close the popover.
     *  Accepts any [HTML DOM Events](https://www.w3schools.com/jsref/dom_obj_event.asp). */
    @Input()
    triggers: string[] = ['click'];

    /** The placement of the popover. It can be one of: top, top-start, top-end, bottom,
     *  bottom-start, bottom-end, right, right-start, right-end, left, left-start, left-end. */
    @Input()
    placement: Placement = 'bottom-start';

    scrollStrategy: ScrollStrategy;

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

    positionStrategy: FlexibleConnectedPositionStrategy;

    private eventRef: Function[] = [];


    constructor(
        private _renderer: Renderer2,
        private _changeDetectorReference: ChangeDetectorRef,
        private _overlay: Overlay
    ) {
    }

    ngAfterViewInit(): void {
        this.addTriggerListeners();
        this.scrollStrategy = this._overlay.scrollStrategies.reposition({scrollThrottle: 10, autoClose: true});


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
                this.eventRef.push(this._renderer.listen(this.triggerRef.nativeElement, trigger, () => {
                    this.toggle();
                }));
            });
        }
    }

    /** @hidden */
    private _triggerContainsTarget(event: Event): boolean {
        const triggerElement = this.triggerRef.nativeElement;
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
}
