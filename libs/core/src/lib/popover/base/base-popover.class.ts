import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { ConnectedPosition, ScrollStrategy } from '@angular/cdk/overlay';
import { Placement, PopoverFillMode } from '../popover-position/popover-position';

@Directive()
export class BasePopoverClass {

    /** Whether the popover should have an arrow. */
    @Input()
    noArrow = true;

    /** Whether the popover container needs an extra class for styling. */
    @Input()
    additionalBodyClass: string;

    /** Whether the popover container needs an extra class for styling. */
    @Input()
    additionalTriggerClass: string;

    /** Whether the popover should close when the escape key is pressed. */
    @Input()
    closeOnEscapeKey = true;

    /**
     * The placement of the popover.
     * It can be one of:
     * top, top-start, top-end, bottom, bottom-start, bottom-end,
     * right, right-start, right-end, left, left-start, left-end.
     */
    @Input()
    placement: Placement;

    /** The trigger events that will open/close the popover.
     *  Accepts any [HTML DOM Events](https://www.w3schools.com/jsref/dom_obj_event.asp). */
    @Input()
    triggers: string[] = ['click'];

    /** Whether the popover is open. Can be used through two-way binding. */
    @Input()
    isOpen = false;

    /** Whether the popover should close when a click is made outside its boundaries. */
    @Input()
    closeOnOutsideClick = true;

    /** Whether the popover should be focusTrapped. */
    @Input()
    focusTrapped = false;

    /**
     * Whether the popover should automatically move focus into the trapped region upon
     * initialization and return focus to the previous activeElement upon destruction.
     */
    @Input()
    focusAutoCapture = false;

    /**
     * Scroll strategy, there are 4 accepted
     * - CloseScrollStrategy
     * - NoopScrollStrategy
     * - BlockScrollStrategy
     * - RepositionScrollStrategy ( default )
     */
    @Input()
    scrollStrategy: ScrollStrategy;

    /**
     * List of positions options for overlay defined by angular CDK.
     * Positions will be taken in order, same like on array. If first position provided doesn't fit to window,
     * another will be used
     * More information can be found in https://material.angular.io/cdk/overlay/api
     */
    @Input()
    cdkPositions: ConnectedPosition[];

    /**
     * Preset options for the popover body width.
     * * `at-least` will apply a minimum width to the body equivalent to the width of the control.
     * * `equal` will apply a width to the body equivalent to the width of the control.
     * * Leave blank for no effect.
     */
    @Input()
    fillControlMode: PopoverFillMode;

    /** The element to which  the overlay is attached. By default it is body */
    @Input()
    appendTo: ElementRef

    /** @deprecated */
    @Input()
    options;

    /** @deprecated */
    @Input()
    addContainerClass;

    /** @deprecated */
    @Input()
    additionalClasses;

    /** Event emitted when the state of the isOpen property changes. */
    @Output()
    isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();

}
