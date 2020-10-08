import {
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    Input,
    OnChanges,
    HostBinding,
    OnInit
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { HtmlSanitizer } from './utils/html-sanitizer';

export type LinkTargetType = '' | '_blank' | '_self' | '_top' | '_parent' | '_search';

/**
 * Formatted-text allowed tags, only this tags will render in component, other will skip;
 *
 * ``` selector: fd-formatted-text ```
 *
 * ```html
 * <fd-formatted-text [htmlText]="..."></fd-formatted-text>
 * ```
 */

@Component({
    selector: 'fd-formatted-text',
    exportAs: 'fd-formatted-text',
    template: ``,
    styles: [
        `
            fd-formatted-text {
                display: block;
            }
            fd-formatted-text.fd-formatted-text-with-height {
                overflow-y: auto;
            }
            fd-formatted-text.fd-formatted-text-with-width {
                overflow-x: auto;
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormattedTextComponent implements OnInit, OnChanges {
    /**
     * Text for formatted render.
     */
    @Input() htmlText: string;
    /**
     * Target attribute for included links.
     */
    @Input() convertedLinksDefaultTarget: LinkTargetType = '_blank';
    /**
     * Height style for component.
     */
    @Input()
    @HostBinding('class.fd-formatted-text-with-height')
    @HostBinding('style.height')
    height?: string;
    /**
     * Width style for component.
     */
    @Input()
    @HostBinding('class.fd-formatted-text-with-width')
    @HostBinding('style.width')
    width?: string;

    /** @hidden */
    @HostBinding('innerHTML') formattedText: SafeHtml = '';

    /** @hidden */
    private htmlSanitizer!: HtmlSanitizer;

    /** @hidden */
    constructor(private readonly domSanitizer: DomSanitizer) {
        this.htmlSanitizer = new HtmlSanitizer();
    }

    /** @hidden */
    ngOnInit(): void {
        this.render();
    }

    /** @hidden */
    ngOnChanges(): void {
        this.render();
    }

    /** @hidden */
    private render(): void {
        this.htmlSanitizer.extendAttrs({
            target: this.convertedLinksDefaultTarget
        });
        const text = this.htmlSanitizer.sanitizeHtml(this.htmlText);
        if (text.trim().length) {
            this.formattedText = this.domSanitizer.bypassSecurityTrustHtml(text);
        }
    }
}
