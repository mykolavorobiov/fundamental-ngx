import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { CssClassBuilder } from '../../utils/interfaces/css-class-builder.interface';
import { applyCssClass } from '../../utils/decorators/apply-css-class.decorator';
import { CSS_CLASS_NAME, getTypeClassName } from './constants';

export type MessageStates = 'success' | 'error' | 'warning' | 'information';

/**
 * Form message. Intended to be displayed with a form control for validation purposes.
 */
@Component({
    selector: 'fd-form-message',
    templateUrl: './form-message.component.html',
    styleUrls: ['./form-message.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormMessageComponent implements CssClassBuilder, OnInit, OnChanges {
    /** Type of the message. Can be 'success' | 'error' | 'warning' | 'information' */
    @Input()
    type: MessageStates;

    /** Whether message should be in static mode, without popover. It's mostly used for forms component, that contain dropdown */
    @Input()
    static = false;

    /**
     * Whether message is used inside popovers or dialogs.
     * When it is enabled box shadow is removed and message is expanded to whole container width
     */
    @Input()
    embedded = false;

    /** @hidden User's custom classes */
    @Input()
    class: string;

    constructor(private _elementRef: ElementRef) {}

    /** @hidden */
    ngOnChanges(): void {
        this.buildComponentCssClass();
    }

    /** @hidden */
    ngOnInit(): void {
        this.buildComponentCssClass();
    }

    /** @hidden */
    @applyCssClass
    buildComponentCssClass(): string[] {
        return [
            CSS_CLASS_NAME.message,
            this.static ? CSS_CLASS_NAME.messageStatic : '',
            this.embedded ? CSS_CLASS_NAME.messageEmbedded : '',
            getTypeClassName(this.type),
            this.class
        ];
    }

    /** @hidden */
    elementRef(): ElementRef {
        return this._elementRef;
    }
}
