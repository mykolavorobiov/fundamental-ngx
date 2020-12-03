import { Component, LOCALE_ID, ViewChild } from '@angular/core';
import { DatePickerComponent, FdDate, DatetimeAdapter, FdDatetimeAdapter } from '@fundamental-ngx/core';

import moment from 'moment';
// Moment locale data required for this example
import 'moment/locale/es';
import 'moment/locale/en-gb';
import 'moment/locale/de';
import 'moment/locale/fr';
import 'moment/locale/bg';
import 'moment/locale/pl';

@Component({
    selector: 'fd-date-picker-complex-i18n-example',
    templateUrl: './date-picker-complex-i18n-example.component.html',
    styleUrls: ['./date-picker-complex-i18n-example.component.scss'],
    providers: [
        { provide: LOCALE_ID, useValue: 'fr' },
        {
            provide: DatetimeAdapter,
            useClass: FdDatetimeAdapter
        }
    ]
})
export class DatePickerComplexI18nExampleComponent {
    @ViewChild(DatePickerComponent) datePicker: DatePickerComponent<FdDate>;

    actualLocale = 'fr';

    date: FdDate = FdDate.getNow();

    constructor(private datetimeAdapter: DatetimeAdapter<FdDate>) {}

    setLocale(locale: string): void {
        this.actualLocale = locale;
        this.datetimeAdapter.setLocale(locale);
    }

    isSelected(locale: string): string {
        return this.actualLocale === locale ? 'is-selected' : '';
    }
}
