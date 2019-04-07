import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    NgZone,
    OnInit,
    Renderer2,
    ViewContainerRef
} from "@angular/core";


// asset definitions
const resources = {};

@Component({
    selector: 'nodeflow-studio-menu-overlay',
    templateUrl: './nodeflow-studio-menu-overlay.html',
    styleUrls: ['./nodeflow-studio-menu-overlay.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeflowStudioMenuOverlayComponent implements OnInit, AfterViewInit {


    constructor(
        private element: ElementRef,
        private vcr: ViewContainerRef,
        private renderer: Renderer2,
        private zone: NgZone,
        private cdr: ChangeDetectorRef) {

    }


    ngOnInit() {


    }

    ngAfterViewInit() {

    }
}

