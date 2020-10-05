import { Component } from '@angular/core';
import { XPositions, YPositions } from '@fundamental-ngx/core';

@Component({
    selector: 'fd-popover-placement-example',
    templateUrl: './popover-placement-example.component.html',
    styleUrls: ['popover-placement-example.component.scss']
})
export class PopoverPlacementExampleComponent {
    list = [
        { text: 'Option 1', url: '#' },
        { text: 'Option 2', url: '#' },
        { text: 'Option 3', url: '#' }
    ];

    yPositions: YPositions[] = ['bottom', 'center', 'top'];
    xPositions: XPositions[] = ['start', 'center', 'end'];

    xOverlay = 'center';
    yOverlay = 'center';
    xBackdrop = 'center';
    yBackdrop = 'center';
}
