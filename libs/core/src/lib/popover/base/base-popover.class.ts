import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';

@Directive()
export class BasePopoverClass {

    /** Whether the popover should have an arrow. */
    @Input()
    noArrow = true;

    /** Whether the popover should have an arrow. */
    @Input()
    hasBackdrop = false;

    /** Whether the popover container needs an extra class for styling. */
    @Input()
    additionalBodyClass: string;

    /** Whether the popover container needs an extra class for styling. */
    @Input()
    additionalTriggerClass: string;

    /** Whether the popover should close when the escape key is pressed. */
    @Input()
    closeOnEscapeKey = true;

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

    /** Event emitted when the state of the isOpen property changes. */
    @Output()
    isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();

}
