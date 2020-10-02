import { Component, Input } from '@angular/core';

@Component({
    selector: 'fdp-object-marker',
    templateUrl: './object-marker.component.html'
})
export class PlatformObjectMarkerComponent {
    /**
     * Glyph (icon) of the Object Status.
     */
    @Input()
    glyph: string;

    /** Whether the Object Status is clickable. */
    @Input()
    clickable: boolean;

    /** Sets control aria-label attribute value */
    @Input()
    ariaLabel: string = null;

    /** Sets control aria-hiden to a boolean attribute value */
    @Input()
    ariaHidden: boolean;

    /** tab index value to be passed for the tabbing */
    tabIndex: string;
}
