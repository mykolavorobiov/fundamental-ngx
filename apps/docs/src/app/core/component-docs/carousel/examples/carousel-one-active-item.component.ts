import { Component } from '@angular/core';
import { CarouselConfig } from '@fundamental-ngx/core';

@Component({
    selector: 'fd-carousel-one-active-item',
    templateUrl: './carousel-one-active-item.component.html'
})
export class CarouselOneActiveItemComponent {
    configuration: CarouselConfig = { vertical: false, elementsAtOnce: 1 };
}
