import { Directive, ElementRef, Input } from '@angular/core';
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

    /** The trigger events that will open/close the popover.
     *  Accepts any [HTML DOM Events](https://www.w3schools.com/jsref/dom_obj_event.asp). */
    @Input()
    triggers: string[] = ['click'];

}
