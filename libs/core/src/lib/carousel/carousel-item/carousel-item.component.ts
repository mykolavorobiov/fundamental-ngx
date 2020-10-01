import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Input,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';

let carouselItemUniqueId = 0;

@Component({
    selector: 'fd-carousel-item',
    templateUrl: './carousel-item.component.html',
    styleUrls: ['./carousel-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CarouselItemComponent {
    /** Id of the Carousel items. */
    @Input()
    @HostBinding('attr.id')
    id = `fd-carousel-item-${carouselItemUniqueId++}`;

    /** Value of carousel item */
    @Input()
    value: any;

    /** Sets tooltip for carousel item */
    @Input()
    title: string;

    /** @hidden Display mode of carousel item. By default it is hidden from dom.*/
    displayMode = 'none';

    /** @hidden sets margin */
    setMargin: boolean;

    constructor(
        private readonly _changeDetectorRef: ChangeDetectorRef,
        private readonly _elementRef: ElementRef,
        private readonly _renderer: Renderer2
    ) {}

    /** Add right margin to carousel item. */
    public addMargin(): void {
        this.setMargin = true;
        this._changeDetectorRef.markForCheck();
    }

    /** Remove previously added right margin from carousel item. */
    public removeMargin(): void {
        this.setMargin = false;
        this._changeDetectorRef.markForCheck();
    }

    /** Shows carousel item */
    public showItem(): void {
        this.displayMode = 'block';
        this._changeDetectorRef.markForCheck();
    }

    /** Hides carousel item */
    public hideItem(): void {
        this.displayMode = 'none';
        this._changeDetectorRef.markForCheck();
    }
}
