import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RtlService } from '../utils/services/rtl.service';
import { CarouselItemComponent } from './carousel-item/carousel-item.component';

/**
 * Pending features:
 * 1. Looping -Done without multi item display
 * 2. multi item display - Done
 * 3. Error message - Done
 * 4. service creation - NA
 * 5. aria-label/accessibility
 * 6. code cleanup -Done
 * 7. touch device
 * 8. unit test cases
 * 9. Rtl- Done
 */

const ICON_PAGE_INDICATOR_LIMIT = 8;
let carouselUniqueId = 0;

class CarouselActiveItem {
    constructor(public readonly activeItem: CarouselItemComponent, public readonly slideDirection: -1 | 1) {}
}

@Component({
    selector: 'fd-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CarouselComponent implements OnInit, AfterContentInit, OnDestroy {
    /** @hidden */
    @ContentChildren(CarouselItemComponent)
    items: QueryList<CarouselItemComponent>;

    /** Id for the Carousel. */
    @Input()
    @HostBinding('attr.id')
    id = `fd-carousel-${carouselUniqueId++}`;

    /** Start position for visible items. Starts with position 0 */
    @Input()
    visibleItemsStartPosition = 0;

    /** Number of items to be visible at a time */
    @Input()
    visibleItemsCount = 1;

    /** Width of carousel container */
    @Input()
    width: string;

    /** Height of carousel container */
    @Input()
    height: string;

    /** Shows/hides optional page indicator container  */
    @Input()
    showPageIndicatorContainer = true;

    /** Shows/hides optional page indicator */
    @Input()
    showPageIndicator = true;

    /** Shows/hides optional navigation button */
    @Input()
    showNavigator = true;

    /** Sets position of page indicator container. Default position is bottom. */
    @Input()
    pageIndicatorContainerPlacement: 'top' | 'bottom' = 'bottom';

    /** Show navigation button in page indicator container or inside content. Default is page indicator container on true value */
    @Input()
    navigatorInPageIndicator = true;

    /** If carousel is in circular loop */
    @Input()
    isCircular = false;

    /** Display this error message when no item is loaded */
    @Input()
    errorMessage = 'The content could not be loaded';

    /** Event thrown, when active element is changed */
    @Output()
    readonly activeChange: EventEmitter<CarouselActiveItem>;

    /** @hidden Make left navigation button disabled */
    leftButtonDisabled = false;

    /** @hidden Make right navigation button disabled */
    rightButtonDisabled = false;

    /** @hidden Convert to Numeric page indicator */
    numericIndicator = false;

    /** @hidden Display error message when no carousel item is loaded */
    displayErrorMessage = false;

    /** @hidden Fake array for counting number of page indicator */
    pageIndicatorsCountArray: number[] = [];

    /** @hidden Start index of currently active items */
    currentActiveItemsStartIndex = 0;

    /** handles rtl service
     * @hidden */
    public dir: string;

    /** An RxJS Subject that will kill the data stream upon component’s destruction (for unsubscribing)  */
    private readonly _onDestroy$: Subject<void> = new Subject<void>();

    constructor(private readonly _changeDetector: ChangeDetectorRef, @Optional() private _rtlService: RtlService) {}

    /** @hidden */
    ngOnInit(): void {
        this._subscribeToRtl();
    }

    /** @hidden */
    ngAfterContentInit(): void {
        this.currentActiveItemsStartIndex = this.visibleItemsStartPosition;

        if (this.items.length > 0) {
            this._initializeCarousel();
        } else {
            this.displayErrorMessage = true;
        }

        // Change pagination display to numeric, if item count is more than 8
        if (this.items.length > ICON_PAGE_INDICATOR_LIMIT) {
            this.numericIndicator = true;
        }
        this._changeDetector.markForCheck();
    }

    /** @hidden */
    ngOnDestroy(): void {
        this._onDestroy$.next();
        this._onDestroy$.complete();
    }

    /** Shows/hides slide based on direction */
    public setCurrentSlide(slideDirection: -1 | 1): void {
        if (slideDirection === -1) {
            // Moving to previous slide
            this.rightButtonDisabled = false;
            this._hideSlide(slideDirection);
            this._adjustActiveItemPosition(slideDirection);
            this._showSlide(slideDirection);
        } else {
            // Moving to next slide
            this.leftButtonDisabled = false;
            this._hideSlide(slideDirection);
            this._adjustActiveItemPosition(slideDirection);
            this._showSlide(slideDirection);
        }
    }

    /** @hidden Rtl change subscription */
    private _subscribeToRtl(): void {
        this._rtlService.rtl.pipe(takeUntil(this._onDestroy$)).subscribe((isRtl: boolean) => {
            this.dir = isRtl ? 'rtl' : 'ltr';
            this._changeDetector.detectChanges();
        });
    }

    /** @hidden Add new visible item to carousel */
    private _showSlide(slideDirection: -1 | 1): void {
        let slidePositionToShow: number;

        if (slideDirection === -1) {
            slidePositionToShow = this.currentActiveItemsStartIndex;
        } else {
            slidePositionToShow = this.currentActiveItemsStartIndex + this.visibleItemsCount - 1;
        }

        // Show left slide of previous first visible slide
        this.items.toArray()[slidePositionToShow].showItem();

        // Add margin between visible items
        if (this.visibleItemsCount > 1) {
            if (slideDirection === 1) {
                this.items.toArray()[slidePositionToShow - 1].addMargin();
            } else {
                this.items.toArray()[slidePositionToShow].addMargin();
            }
        }
    }

    /** @hidden When moved left, hide the right most slide */
    private _hideSlide(slideDirection: -1 | 1): void {
        let slidePositionToHide: number;

        if (slideDirection === -1) {
            slidePositionToHide = this.currentActiveItemsStartIndex + this.visibleItemsCount - 1;
        } else if (slideDirection === 1) {
            slidePositionToHide = this.currentActiveItemsStartIndex;
        }
        // Remove previously set margin
        if (this.visibleItemsCount > 1) {
            if (slideDirection === -1) {
                this.items.toArray()[slidePositionToHide - 1].removeMargin();
            } else {
                this.items.toArray()[slidePositionToHide].removeMargin();
            }
        }

        // Remove right most slide
        this.items.toArray()[slidePositionToHide].hideItem();
    }

    /** @hidden  Initialize carousel with visible items */
    private _initializeCarousel(): void {
        // Handles navigator button enabled/disabled state
        this._initializeButtonVisibility();

        // set page indicator count with fake array, to use in template
        this.pageIndicatorsCountArray = new Array(this.items.length - this.visibleItemsCount + 1);

        // Make slide visible. Multiple item will be visible for multi item carousel.
        for (let visibleItemIndex = 0; visibleItemIndex < this.visibleItemsCount; visibleItemIndex++) {
            this.items.toArray()[this.visibleItemsStartPosition + visibleItemIndex].showItem();

            // add margin-right except the last slide
            if (visibleItemIndex + 1 !== this.visibleItemsCount) {
                this.items.toArray()[this.visibleItemsStartPosition + visibleItemIndex].addMargin();
            }
        }
    }

    /** @hidden Handles navigation button visibility */
    private _initializeButtonVisibility(): void {
        if (!this.isCircular) {
            // Navigation will be disabled if carousel has only one element
            if (this.items.length === 0) {
                this.leftButtonDisabled = true;
                this.rightButtonDisabled = true;
            }

            if (this.visibleItemsStartPosition === 0) {
                this.leftButtonDisabled = true;
            } else if (this.visibleItemsStartPosition === this.items.length - 1) {
                this.rightButtonDisabled = true;
            }

            // Disables right navigation button
            if (this.visibleItemsCount > 1) {
                if (this.currentActiveItemsStartIndex + this.visibleItemsCount >= this.items.length - 1) {
                    this.rightButtonDisabled = true;
                }
            }
        }
    }

    /** @hidden Adjust fits position of active item, based on slide direction */
    private _adjustActiveItemPosition(slideDirection: -1 | 1): void {
        // Move one step in the direction
        this.currentActiveItemsStartIndex = this.currentActiveItemsStartIndex + slideDirection;

        // If carousel set to loop
        if (this.isCircular) {
            if (this.currentActiveItemsStartIndex < 0) {
                this.currentActiveItemsStartIndex = this.items.length - 1;
            }

            if (this.currentActiveItemsStartIndex === this.items.length) {
                this.currentActiveItemsStartIndex = 0;
            }
        } else {
            this._disableNavigationButton();
        }
    }

    /** @hidden Disable navigation if either side limit reached */
    private _disableNavigationButton(): void {
        // Need to disable navigation button if either direction limit has reached.
        if (this.currentActiveItemsStartIndex === 0) {
            this.leftButtonDisabled = true;
        } else if (this.items.length - 1 === this.currentActiveItemsStartIndex) {
            this.rightButtonDisabled = true;
        } else if (
            this.visibleItemsCount > 1 &&
            this.currentActiveItemsStartIndex + this.visibleItemsCount === this.items.length
        ) {
            this.rightButtonDisabled = true;
        }
    }
}
