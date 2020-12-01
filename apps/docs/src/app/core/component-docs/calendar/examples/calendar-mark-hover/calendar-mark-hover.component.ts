import { Component } from '@angular/core';
import { DateRange, FdDate } from '@fundamental-ngx/core';

@Component({
    selector: 'fd-calendar-mark-hover',
    templateUrl: './calendar-mark-hover.component.html'
})
export class CalendarMarkHoverComponent {
    rangeDate = new DateRange(new FdDate(2020, 10, 25), new FdDate(2020, 10, 26));
}
