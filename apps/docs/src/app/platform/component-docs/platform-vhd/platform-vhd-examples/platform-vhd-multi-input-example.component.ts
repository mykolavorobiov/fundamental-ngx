import { Component, OnInit } from '@angular/core';

import { VhdDataProvider, VhdValueChangeEvent, ValueHelpDialogDataSource } from '@fundamental-ngx/platform';

interface ExampleTestModel {
  id: number;
  name: string;
  code: string;
  city: string;
  zipcode: string;
  address: string;
  nickname: string;
}

const exampleDataSource = () => {
  const dataSource = Array(137).fill(null).map((_value, index) => {
    return {
      id: index + 1,
      name: `Name ${index + 1}`,
      code: `${Math.floor(Math.random() * 99999)}`,
      city: `City ${Math.floor(Math.random() * index)}`,
      zipcode: `zipcode ${Math.floor(Math.random() * index)}`,
      address: `Address ${Math.floor(Math.random() * index)}`,
      nickname: `Nickname ${Math.floor(Math.random() * index)}`
    }
  })
  return {
    dataSource: dataSource,
    filters: Object.keys(dataSource[0]).map((value, index) => {
      return {
        key: value,
        name: `${value}`,
        label: `Product ${value}`,
        advanced: index > 0,
        include: index >= 0,
        exclude: index >= 0
      }
    })
  }
}

@Component({
  selector: 'fdp-vhd-multi-input-example',
  templateUrl: './platform-vhd-multi-input-example.component.html'
})
export class PlatformVhdMultiInputExampleComponent implements OnInit {
  filters: any;
  originalData: ExampleTestModel[];
  dataSource: ValueHelpDialogDataSource<ExampleTestModel>;
  currentValue: VhdValueChangeEvent = {};

  ngOnInit(): void {
    const data = exampleDataSource();
    this.filters = data.filters;
    this.originalData = data.dataSource;
    this.dataSource = new ValueHelpDialogDataSource(new VhdDataProvider(data.dataSource));
  }

  valueChange($event: VhdValueChangeEvent<ExampleTestModel[]>): void {
    this.currentValue = $event;
  }

  displayFunc(obj: any): string {
    return obj.name.toLocaleUpperCase();
  }

  multiSelectChange(): void {
    this.currentValue = {...this.currentValue};
  }

  parseFunc(value: string): object {
    if (value && value.length) {
        return { name: value, id: Date.now() };
    }
  }
}
