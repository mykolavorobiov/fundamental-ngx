import { InjectionToken, Optional } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { MobileModeConfig, RtlService } from '@fundamental-ngx/core';
import { Subject } from 'rxjs';

const OVERLAY_CONFIG = new InjectionToken<OverlayConfig>('CDK Overlay Config');



export class CdkPopoverService {
    constructor(
        private _overlay: Overlay,
        @Optional() private _rtlService: RtlService
    ) {}

    overlayOutsideClick = new Subject<MouseEvent>();

    private _overlayRef: OverlayRef;

    open(overlayConfig: OverlayConfig): void {}

}
