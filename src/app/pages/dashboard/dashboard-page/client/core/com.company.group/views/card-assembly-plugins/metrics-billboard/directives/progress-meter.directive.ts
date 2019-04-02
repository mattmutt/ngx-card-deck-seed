import { Directive, AfterViewInit, AfterContentInit, ElementRef } from "@angular/core";

@Directive({
   // tslint:disable-next-line:directive-selector
   selector: '[progressMeter]'
})
export class ProgressMeterDirective implements AfterViewInit, AfterContentInit {

   constructor(private element: ElementRef) {
      // IE11 safety, upon deprecation, combine lines
      this.element.nativeElement.classList.add("progress-meter");
      this.element.nativeElement.classList.add("render");

   }

   ngAfterViewInit() {


   }

   ngAfterContentInit() {

      // setTimeout( ()=> { this.element.nativeElement.classList.add("start"); }, 1* 1000);

   }

}

