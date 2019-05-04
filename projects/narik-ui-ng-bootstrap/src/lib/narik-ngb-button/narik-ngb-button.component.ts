import { NarikInject } from "narik-core";
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Renderer2,
  HostListener,
  Injector
} from "@angular/core";
import {
  NarikButton,
  BUTTON_DEFAULT_OPTIONS,
  ButtonDefaultOptions
} from "narik-ui-core";

@Component({
  selector: "narik-ngb-buuton , narik-button ",
  templateUrl: "narik-ngb-button.component.html"
})
export class NarikNgbButtonComponent extends NarikButton
  implements OnInit, AfterViewInit {
  @NarikInject(BUTTON_DEFAULT_OPTIONS, {
    buttonStyle: "mat-raised-button",
    busyFontIcon: "fa-spinner"
  })
  defaultOptions: ButtonDefaultOptions;

  constructor(private renderer: Renderer2, injector: Injector) {
    super(injector);
  }

  ngOnInit() {}

  ngAfterViewInit(): void {}
}