import { Directive, AfterViewInit, ElementRef, Input } from "@angular/core";

interface PrivateServerStoredTypedValue {
   value: string;
   type: string;
   serverGuid: string;
}

// map back to the notion of CSS classes used from sprite
const iconsMap = {
   Folder: "demo-icon-folder",
   HostSystem: "demo-icon-host",
};

/**
 * prepare business icon for the list
 */
@Directive({
   // tslint:disable-next-line:directive-selector
   selector: '[demoInventoryIcon]'
})
export class DemoClientGridCardIconDirective implements AfterViewInit {

   // marks the object that holds one of the important fields: type
   @Input() entity: PrivateServerStoredTypedValue;

   constructor(public elem: ElementRef) {

   }

   ngAfterViewInit() {
      const c = this.determineIconClass();
      // conditional icon
      if (c) {
         this.elem.nativeElement.classList.add(c);
      }
   }

// -------- internal ------------
   private determineIconClass(): string {
      return iconsMap[this.entity.type];
   }

}
