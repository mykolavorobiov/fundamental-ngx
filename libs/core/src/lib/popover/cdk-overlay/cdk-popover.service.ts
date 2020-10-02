import { ChangeDetectorRef, Optional, Renderer2 } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { RtlService } from '@fundamental-ngx/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';

export class CdkPopoverService {
    constructor(
        private _overlay: Overlay,
        @Optional() private _rtlService: RtlService
    ) {}

    overlayOutsideClick = new Subject<MouseEvent>();

    private _overlayRef: OverlayRef;

    open(overlayConfig: OverlayConfig): void {
    }

    // close()

}
