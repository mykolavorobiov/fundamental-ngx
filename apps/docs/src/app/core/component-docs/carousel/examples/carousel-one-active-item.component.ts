import { Component } from '@angular/core';
import { CarouselConfig } from '@fundamental-ngx/core';

@Component({
    selector: 'app-carousel-single-active',
    templateUrl: './carousel-one-active-item.component.html'
})
export class CarouselOneItemActiveComponent {
    configuration: CarouselConfig = { vertical: false, elementsAtOnce: 1 };
}
