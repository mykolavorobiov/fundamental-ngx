import {
    AfterContentInit,
    AfterViewChecked,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FdCarouselResourceStrings, CarouselResourceStringsEN } from './i18n/carousel-resources';
import { CarouselItemComponent } from './carousel-item/carousel-item.component';
import {
    CarouselService,
    CarouselConfig,
    PanEndOutput,
    CarouselItemInterface
} from '../utils/services/carousel.service';
import { RtlService } from '../utils/services/rtl.service';

/** Page limit to switch to numerical indicator */
const ICON_PAGE_INDICATOR_LIMIT = 8;

export type CarouselIndicatorsOrientation = 'bottom' | 'top';

export enum SlideDirection {
    None,
    NEXT,
    PREVIOUS
}

let carouselUniqueId = 0;

class CarouselActiveSlides {
    constructor(public readonly activeItems: CarouselItemComponent[], public readonly slideDirection: string) {}
}

@Component({
    selector: 'fd-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [CarouselService]
})
export class CarouselComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked, OnDestroy {
    /** Id for the Carousel. */
    @Input()
    @HostBinding('attr.id')
    id = `fd-carousel-${carouselUniqueId++}`;

    /** Sets aria-label attribute for carousel */
    @Input()
    ariaLabel = 'carousel';

    /** Sets aria-labelledby attribute for carousel */
    @Input()
    ariaLabelledBy: string;

    /** Sets aria-describedby attribute for carousel */
    @Input()
    ariaDescribedBy: string;

    /** Sets position of page indicator container. Default position is bottom. */
    @Input()
    carouselIndicatorsOrientation: CarouselIndicatorsOrientation = 'bottom';

    /** Height for carousel container */
    @Input()
    height: string;

    /** Width for carousel container */
    @Input()
    width: string;

    /** If carousel is in circular loop */
    @Input()
    loop = false;

    /** Label for left navigation button */
    @Input()
    leftNavigationBtnLabel = 'Go to previous item';

    /** Label for right navigation button */
    @Input()
    rightNavigationBtnLabel = 'Go to next item';

    /** Shows/hides optional navigation button */
    @Input()
    navigation = true;

    /** Show navigation button in page indicator container or inside content. Default is page indicator container on true value */
    @Input()
    navigatorInPageIndicator = true;

    /** Convert to Numeric page indicator */
    @Input()
    numericIndicator = false;

    /** Shows/hides optional page indicator container  */
    @Input()
    pageIndicatorContainer = true;

    /** Shows/hides optional page indicator */
    @Input()
    pageIndicator = true;

    /**
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    set resourceStrings(value: FdCarouselResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
     */
    get resourceStrings(): FdCarouselResourceStrings {
        return this._resourceStrings;
    }

    /** Sets sliding duration in millie seconds. Default is 150 */
    @Input()
    slideTransitionDuration = 150;

    /** Is swipe enabled */
    @Input()
    swipeEnabled = true;

    /** Is carousel is vertical. Default value is false. */
    @Input()
    vertical = false;

    /** Number of items to be visible at a time */
    @Input()
    visibleSlidesCount = 1;

    /** An event that is emitted after a slide transition has happened */
    @Output()
    readonly slideChange: EventEmitter<CarouselActiveSlides> = new EventEmitter<CarouselActiveSlides>();

    /**
     * Returns the `role` attribute of the carousel.
     */
    @HostBinding('attr.role')
    role = 'region';

    /**
     * Returns the `tabIndex` of the carousel component.
     */
    @HostBinding('attr.tabindex')
    get tabIndex(): number {
        return 0;
    }

    /**
     * Sets the overflow to auto value.
     */
    @HostBinding('style.overflow')
    overflow = 'auto';

    /** @hidden */
    @ContentChildren(CarouselItemComponent, { descendants: true })
    slides: QueryList<CarouselItemComponent>;

    @ViewChild('slideContainer')
    slideContainer: ElementRef;

    /** @hidden Start index of currently active items */
    currentActiveSlidesStartIndex = 0;

    /** @hidden handles rtl service */
    dir: string;

    /** @hidden Make left navigation button disabled */
    leftButtonDisabled = false;

    /** @hidden Make right navigation button disabled */
    rightButtonDisabled = false;

    /** @hidden Fake array for counting number of page indicator */
    pageIndicatorsCountArray: number[] = [];

    private _resourceStrings = CarouselResourceStringsEN;

    private _config: CarouselConfig = {};

    private _slidesCopy = [];

    private _previousVisibleSlidesCount: number;

    private _slideSwiped = false;

    /** An RxJS Subject that will kill the data stream upon component’s destruction (for unsubscribing) */
    private readonly _onDestroy$: Subject<void> = new Subject<void>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _carouselService: CarouselService,
        @Optional() private readonly _rtlService: RtlService
    ) {}

    /** @hidden */
    ngOnInit(): void {
        this._subscribeToRtl();
    }

    /** @hidden */
    ngAfterContentInit(): void {
        // On carousel load, display first slide + number of slide visible
        this.currentActiveSlidesStartIndex = 0;

        // Change pagination display to numeric, if item count is more than 8
        if (this.slides.length > ICON_PAGE_INDICATOR_LIMIT) {
            this.numericIndicator = true;
        }

        if (this.slides.length > 0) {
            this._initializeCarousel();
        } else {
            this.leftButtonDisabled = true;
            this.rightButtonDisabled = true;
        }
        this._carouselService.activeChange.subscribe((event) => this._onSlideSwipe(event));
        this._carouselService.dragStateChange.subscribe((event) => this._onSlideDrag(event));

        this._slidesCopy = this.slides.toArray().slice();
        this._changeDetectorRef.markForCheck();
    }

    /** @hidden */
    ngAfterViewInit(): void {
        this._initializeServiceConfig();
        this._carouselService.initialise(this._config, this.slides, this.slideContainer);
        this._previousVisibleSlidesCount = this.visibleSlidesCount;
    }

    /** @hidden */
    ngAfterViewChecked(): void {
        if (this._previousVisibleSlidesCount && this._previousVisibleSlidesCount !== this.visibleSlidesCount) {
            this._initializeCarousel();
            this._initializeServiceConfig();
            this._carouselService.updateConfig(this._config);
            this._previousVisibleSlidesCount = this.visibleSlidesCount;
            this._changeDetectorRef.detectChanges();
        }
    }

    /** @hidden */
    ngOnDestroy(): void {
        this._onDestroy$.next();
        this._onDestroy$.complete();
    }

    /** @hidden */
    public get getPageIndicatorLabel(): string {
        return `${this.currentActiveSlidesStartIndex + 1} ${this.resourceStrings.fd_carousel_of} ${
            this.pageIndicatorsCountArray.length
        }`;
    }

    /** @hidden */
    public get screenReaderLabel(): string {
        return `${this.resourceStrings.fd_carousel_reader} ${this.currentActiveSlidesStartIndex + 1} ${
            this.resourceStrings.fd_carousel_of
        } ${this.pageIndicatorsCountArray.length}`;
    }

    /** @hidden */
    @HostListener('keydown.arrowright', ['$event'])
    public onKeydownArrowRight(event): void {
        event.preventDefault();
        if (!this.loop && this.currentActiveSlidesStartIndex >= this.pageIndicatorsCountArray.length - 1) {
            return;
        } else {
            this.next();
        }
    }

    /** @hidden */
    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event): void {
        event.preventDefault();
        if (!this.loop && this.currentActiveSlidesStartIndex <= 0) {
            return;
        } else {
            this.previous();
        }
    }

    /** Transitions to the previous slide in the carousel. */
    public previous(): void {
        this.rightButtonDisabled = false;
        this._adjustActiveItemPosition(SlideDirection.PREVIOUS);
        this._carouselService.pickPrevious(this.dir);
        this._notifySlideChange(SlideDirection.PREVIOUS);
        this._changeDetectorRef.detectChanges();
    }

    /** Transitions to the next slide in the carousel. */
    public next(): void {
        // Moving to next slide
        this.leftButtonDisabled = false;
        this._adjustActiveItemPosition(SlideDirection.NEXT);
        this._carouselService.pickNext(this.dir);
        this._notifySlideChange(SlideDirection.NEXT);
        this._changeDetectorRef.detectChanges();
    }

    /** @hidden Adjust position of active item, based on slide direction */
    private _adjustActiveItemPosition(slideDirection: SlideDirection, step: number = 1): void {
        // Move one step in the direction
        const positionAdjustment = slideDirection === SlideDirection.NEXT ? step : -step;
        this.currentActiveSlidesStartIndex = this.currentActiveSlidesStartIndex + positionAdjustment;

        // If carousel set to loop
        if (this.loop) {
            if (this.currentActiveSlidesStartIndex < 0) {
                this.currentActiveSlidesStartIndex = this.slides.length + this.currentActiveSlidesStartIndex;
            } else if (this.currentActiveSlidesStartIndex >= this.slides.length) {
                this.currentActiveSlidesStartIndex = this.currentActiveSlidesStartIndex % this.slides.length;
            }
        } else {
            this._buttonVisibility();
        }
    }

    /** Handles navigation button visibility */
    private _buttonVisibility(): void {
        if (!this.loop) {
            // Need to disable navigation button if either direction limit has reached.
            if (this.currentActiveSlidesStartIndex === 0) {
                this.leftButtonDisabled = true;
            } else if (this.slides.length - 1 === this.currentActiveSlidesStartIndex) {
                this.rightButtonDisabled = true;
            } else if (
                this.visibleSlidesCount > 1 &&
                this.currentActiveSlidesStartIndex + this.visibleSlidesCount >= this.slides.length
            ) {
                this.rightButtonDisabled = true;
            } else {
                this.leftButtonDisabled = false;
                this.rightButtonDisabled = false;
            }

            if (this.slides.length === 1) {
                this.leftButtonDisabled = true;
                this.rightButtonDisabled = true;
            }
        }
    }

    /** @hidden Initialize carousel with visible items */
    private _initializeCarousel(): void {
        // Handles navigator button enabled/disabled state
        this._buttonVisibility();

        // set page indicator count with fake array, to use in template
        if (this.loop && this.visibleSlidesCount > 1) {
            // If loop with multi item visible.
            this.pageIndicatorsCountArray = new Array(this.slides.length);
        } else {
            this.pageIndicatorsCountArray = new Array(this.slides.length - this.visibleSlidesCount + 1);
        }

        for (
            let index = this.currentActiveSlidesStartIndex;
            index < this.currentActiveSlidesStartIndex + this.visibleSlidesCount;
            index++
        ) {
            this.slides.toArray()[index].visibility = 'visible';
        }
    }

    /** @hidden Initialize config for Carousel service */
    private _initializeServiceConfig(): void {
        this._config.vertical = this.vertical;
        this._config.elementsAtOnce = this.visibleSlidesCount;
        this._config.gestureSupport = this.swipeEnabled;
        this._config.infinite = this.loop;
        this._config.transition = String(this.slideTransitionDuration) + 'ms';
        // Carousel service expects transition in string format with unit.
    }

    /**
     * Returns the slide swapping steps
     */
    private _getStepTaken(event: PanEndOutput, actualActiveSlideIndex: number): number {
        let stepsCalculated: number;

        if (event.after) {
            if (actualActiveSlideIndex === 0 && this.currentActiveSlidesStartIndex === 0) {
                stepsCalculated = 0;
            } else if (actualActiveSlideIndex > this.currentActiveSlidesStartIndex) {
                stepsCalculated = actualActiveSlideIndex - this.currentActiveSlidesStartIndex;
            } else {
                stepsCalculated = this.slides.length - this.currentActiveSlidesStartIndex + actualActiveSlideIndex;
            }
        } else {
            // Special case, when first left swipe before slides are rotated in carousel service
            if (actualActiveSlideIndex === 0 && this.currentActiveSlidesStartIndex === 0) {
                stepsCalculated = 0;
            } else if (actualActiveSlideIndex < this.currentActiveSlidesStartIndex) {
                stepsCalculated = this.currentActiveSlidesStartIndex - actualActiveSlideIndex;
            } else {
                stepsCalculated = this.currentActiveSlidesStartIndex + this.slides.length - actualActiveSlideIndex;
            }
        }
        return stepsCalculated;
    }

    /** @hidden Handles notification on visible slide change */
    private _notifySlideChange(slideDirection: SlideDirection, firstActiveSlide?: CarouselItemInterface): void {
        const activeSlides: CarouselItemComponent[] = new Array();
        const slides = this.slides.toArray();
        let firstActiveSlideIndex: number;

        if (this.loop) {
            firstActiveSlide = this._carouselService.active;
        }

        if (firstActiveSlide) {
            firstActiveSlideIndex = this.slides.toArray().findIndex((_item) => _item === firstActiveSlide);
        } else {
            firstActiveSlideIndex = this.currentActiveSlidesStartIndex;
        }

        for (let activeSlideIndex = 0; activeSlideIndex < this.visibleSlidesCount; activeSlideIndex++) {
            activeSlides.push(slides[firstActiveSlideIndex + activeSlideIndex]);
            this.slides.toArray()[firstActiveSlideIndex + activeSlideIndex].visibility = 'visible';
        }

        this._manageSlideVisibility(firstActiveSlideIndex);
        const direction = slideDirection === SlideDirection.NEXT ? 'Next' : 'Previous';
        this.slideChange.emit(new CarouselActiveSlides(activeSlides, direction));
    }

    /** @hidden Manages visibility for slides. Useful in managing tab order */
    private _manageSlideVisibility(firstActiveSlideIndex: number): void {
        setTimeout(() => {
            this.slides.forEach((_slides, index) => {
                if (index >= firstActiveSlideIndex && index < firstActiveSlideIndex + this.visibleSlidesCount) {
                    if (_slides.visibility === 'hidden') {
                        _slides.visibility = 'visible';
                    }
                } else {
                    if (_slides.visibility === 'visible') {
                        _slides.visibility = 'hidden';
                    }
                }
            });
            this._changeDetectorRef.markForCheck();
        }, this.slideTransitionDuration);
    }

    /** @hidden Rtl change subscription */
    private _subscribeToRtl(): void {
        this._rtlService?.rtl.pipe(takeUntil(this._onDestroy$)).subscribe((isRtl: boolean) => {
            this.dir = isRtl ? 'rtl' : 'ltr';
            this._changeDetectorRef.detectChanges();
        });
    }

    /** On Swiping of slide, manage page indicator */
    private _onSlideSwipe(event: PanEndOutput): void {
        this._slideSwiped = true;
        const firstActiveSlide = event.item;
        const actualActiveSlideIndex = this._slidesCopy.findIndex((_slide) => _slide === firstActiveSlide);
        const stepTaken = this._getStepTaken(event, actualActiveSlideIndex);
        if (stepTaken > 0) {
            const slideDirection: SlideDirection = event.after ? SlideDirection.NEXT : SlideDirection.PREVIOUS;

            this._adjustActiveItemPosition(slideDirection, stepTaken);
            this._notifySlideChange(slideDirection, firstActiveSlide);
            this._changeDetectorRef.detectChanges();
        }
    }

    /**
     * @hidden Making slides visible when slides are dragged. Otherwise it looses the effect.
     */
    private _onSlideDrag(isDragging: boolean): void {
        if (isDragging) {
            this.slides.forEach((_slide) => {
                _slide.visibility = 'visible';
            });
            this._slideSwiped = false;
            this._changeDetectorRef.markForCheck();
        } else {
            // After slide limit reached, if dragging starts then revert visibility
            if (!this._slideSwiped) {
                this._manageSlideVisibility(this.currentActiveSlidesStartIndex);
            }
        }
    }
}
