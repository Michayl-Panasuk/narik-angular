import {
  NarikCheckBoxList,
  NARIK_DATA_DISPLAY_VALUE_INPUTS
} from "narik-ui-core";
import { Component, forwardRef, Injector, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "narik-prime-checkbox-list , narik-checkbox-list",
  templateUrl: "narik-prime-checkbox-list.component.html",
  inputs: [...NARIK_DATA_DISPLAY_VALUE_INPUTS],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NarikPrimeCheckBoxList),
      multi: true
    }
  ]
})
export class NarikPrimeCheckBoxList extends NarikCheckBoxList {
  constructor(injector: Injector) {
    super(injector);
  }
}