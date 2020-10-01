import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarouselNewModule } from '@fundamental-ngx/core';
import { SharedDocumentationPageModule } from '../../../documentation/shared-documentation-page.module';
import { ApiComponent } from '../../../documentation/core-helpers/api/api.component';
import { API_FILES } from '../../api-files';
import { CarouselHeaderComponent } from './carousel-header/carousel-header.component';
import { CarouselDocsComponent } from './carousel-docs.component';
import { CarouselOneActiveItemComponent } from './examples/carousel-one-active-item.component';

const routes: Routes = [
    {
        path: '',
        component: CarouselHeaderComponent,
        children: [
            { path: '', component: CarouselDocsComponent },
            { path: 'api', component: ApiComponent, data: { content: API_FILES.checkbox } }
        ]
    }
];

@NgModule({
    imports: [CarouselNewModule, RouterModule.forChild(routes), SharedDocumentationPageModule],
    exports: [RouterModule],
    declarations: [CarouselDocsComponent, CarouselHeaderComponent, CarouselOneActiveItemComponent]
})
export class CarouselDocsModule {}
