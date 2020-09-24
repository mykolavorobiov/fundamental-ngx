import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarouselModule } from '@fundamental-ngx/core';
import { SharedDocumentationPageModule } from '../../../documentation/shared-documentation-page.module';
import { ApiComponent } from '../../../documentation/core-helpers/api/api.component';
import { API_FILES } from '../../api-files';
import { CarouselHeaderComponent } from './carousel-header/carousel-header.component';
import { CarouselDocsComponent } from './carousel-docs.component';
import { CarouselOneItemActiveComponent } from './examples/carousel-one-active-item.component'

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
    imports: [
        CarouselModule,
        RouterModule.forChild(routes),
        SharedDocumentationPageModule
    ],
    exports: [RouterModule],
    declarations: [
        CarouselDocsComponent,
        CarouselHeaderComponent,
        CarouselOneItemActiveComponent
    ]
})
export class CarouselDocsModule {}
