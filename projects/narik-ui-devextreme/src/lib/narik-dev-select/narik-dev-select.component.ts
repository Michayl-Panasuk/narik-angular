import {
  Component,
  forwardRef,
  Injector,
  OnInit,
  HostBinding
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  NarikSelect
} from "@narik/ui-core";
import { NARIK_DATA_DISPLAY_VALUE_INPUTS, NARIK_SELECT_INPUTS, NARIK_DATA_DISPLAY_VALUE_OUTPUTS } from "../input-output-items";



@Component({
  selector: "narik-dev-select , narik-select",
  templateUrl: "narik-dev-select.component.html",
  styleUrls: ["narik-dev-select.component.css"],
  inputs: [...NARIK_DATA_DISPLAY_VALUE_INPUTS, ...NARIK_SELECT_INPUTS],
  outputs: [...NARIK_DATA_DISPLAY_VALUE_OUTPUTS],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NarikDevSelect),
      multi: true
    }
  ]
})
export class NarikDevSelect extends NarikSelect implements OnInit {
  optionData: any[] = [];

  @HostBinding("class")
  class = "dx-field display-block";

  constructor(injector: Injector) {
    super(injector);
  }

  protected useData(data: any[]) {
    this.optionData = data;
  }
}
