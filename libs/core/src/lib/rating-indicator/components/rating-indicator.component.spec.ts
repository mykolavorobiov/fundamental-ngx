import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingIndicatorComponent } from './rating-indicator.component';

const prefix = 'fd-rating-indicator';

describe('RatingIndicatorComponent', () => {
  let elementRef: ElementRef;
  let component: RatingIndicatorComponent;
  let fixture: ComponentFixture<RatingIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RatingIndicatorComponent]
    })
      .compileComponents();
  });

  async function wait(componentFixture: ComponentFixture<any>): Promise<any> {
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingIndicatorComponent);
    elementRef = fixture.componentInstance.elementRef();
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have available to select halves`, () => {
    component.allowHalves = true;
    component.buildComponentCssClass();
    expect(elementRef.nativeElement.classList.contains(`${prefix}--half-star`)).toBeTrue();
  });

  it(`should have compact icon`, () => {
    component.size = 'compact';
    component.buildComponentCssClass();
    expect(elementRef.nativeElement.classList.contains(`${prefix}--${component.size}`)).toBeTrue();
  });

  it(`should use custom rating icons`, () => {
      component.ratedIcon = 'test-icon-favorite';
      component.unratedIcon = 'test-icon-unfavorite';
      component.buildComponentCssClass();
      expect(elementRef.nativeElement.classList.contains(`${prefix}--icon`)).toBeTrue();
  });

  it(`should have correct viewValue`, () => {
    const ratingChangedSpy = spyOn(component.ratingChanged, 'emit');
    component.onSelect(2);
    expect(ratingChangedSpy).toHaveBeenCalledWith(2);
  });

  it(`should have correct indicator capacity`, () => {
    component.indicatorCapacity = 4;
    component.allowHalves = false;
    component.ngOnInit();
    fixture.detectChanges();
    expect(component._rates.length).toEqual(4);
  });

  it(`should have correct indicator capacity with halves`, () => {
    component.indicatorCapacity = 4;
    component.allowHalves = true;
    component.ngOnInit();
    fixture.detectChanges();
    expect(component._rates.length).toEqual(4 * 2);
  });

  it(`should have an indicator capacity with value = 111 (wrong capacity)`, () => {
    component.indicatorCapacity = 111;
    component.allowHalves = false;
    component.ngOnInit();
    fixture.detectChanges();
    expect(component._rates.length).toEqual(7);
  });

  it(`should have value after click on rate icon`, () => {
    component.allowHalves = false;
    elementRef.nativeElement.querySelectorAll('.fd-rating-indicator__label')[2].click();

    expect(component.value).toBe(2);
    component.ratingChanged.subscribe((value: number) => {
      expect(value).toBe(2);
    });
  });
});
