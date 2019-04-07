import { Subject } from "rxjs";
import { NodeflowViewModelFacade } from "../../../../../../../studio/nodeflow-studio-compositor/nodeflow-studio.interface";

const resources = {
    temporalHeightProperty: "tempRowsProp"
};

export class CollapsibleCardWindowProvider {
    // view state
    cardWindowRollupState = false; // when true, asset card is minimized to one gridster row unit
    cardWindowRollupStateChange$ = new Subject<boolean>(); // for RWD stream

    private linkedViewModel?: NodeflowViewModelFacade; // async provisioning

    constructor() {

    }

    setViewModel(viewModel: NodeflowViewModelFacade) {
        this.linkedViewModel = viewModel;

    }

    // event when arrow is toggled. collapse the card to a minimal height
    onToggleCardRollup(evt: MouseEvent) {
        if (this.linkedViewModel) {
            const minimizedHeight = 1;
            const gi = this.linkedViewModel.nodeModel.view.gridItem;
            if (gi) { // gridster implementation ready

                this.cardWindowRollupState = !this.cardWindowRollupState;
                // a card that starts off minimized, cannot be rolledup
                if (gi.$item.rows === minimizedHeight && this.cardWindowRollupState) {
                    return;
                }

                this.cardWindowRollupStateChange$.next(this.cardWindowRollupState);

                // shrink
                if (this.cardWindowRollupState) {
                    gi.$item[resources.temporalHeightProperty] = gi.$item.rows;
                    gi.$item.rows = minimizedHeight;
                } else {
                    gi.$item.rows = gi.$item[resources.temporalHeightProperty];
                    delete gi.$item[resources.temporalHeightProperty];
                }

                gi.checkItemChanges(gi.$item, gi.item);
                gi.setSize(false); // checked
                gi.gridster.calculateLayoutDebounce();

                gi.itemChanged();

                this.linkedViewModel.compositor.updateViewTransition(); // sync connectors
            }
        }
    }

    // if card is sized/defined to be of short row height like 1, hide arrow toggle icon
    get isIconVisible(): boolean {

        let f = false;

        if (this.linkedViewModel) {
            const minimizedHeight = 1;
            const gi = this.linkedViewModel.nodeModel.view.gridItem;
            if (gi.canBeResized()) {
                if ((gi.$item.rows !== minimizedHeight || gi.$item.hasOwnProperty(resources.temporalHeightProperty))) {
                    f = true;
                }
            }

        }

        return f;
    }

}
