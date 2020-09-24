import { Component } from '@angular/core';

import * as carouselSingleItemActiveTsCode from '!raw-loader!./examples/carousel-one-active-item.component.ts';

import { ExampleFile } from '../../../documentation/core-helpers/code-example/example-file';

@Component({
    selector: 'app-input',
    templateUrl: './carousel-docs.component.html'
})
export class CarouselDocsComponent {
    carouselSingle: ExampleFile[] = [
        {
            language: 'typescript',
            fileName: 'carousel-one-active-item',
            component: 'CarouselOneItemActiveComponent',
            code: carouselSingleItemActiveTsCode
        }
    ];
}
