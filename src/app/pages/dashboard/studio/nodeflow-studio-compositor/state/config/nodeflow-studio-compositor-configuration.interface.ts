export interface StudioCompositorConfigurationSchema {

    asset: {
        arrow: {
            layout: {
                scalable: boolean;
                width: number;
                height: number;
            };
        };
        socket: {
            layout: {
                size: number;
                padding: number;
                smallCondensingFactor: number;
            };
        };
        connector: {
            layout: {
                lineProximityThreshold: number
            };
        };

        plug: {
            layout: {
                size: number
            };
        };
    };
    component: {
        compositor: {
            node: {};
            connector: {};
            socket: {
                orientation: "horizontal" | "vertical"
            };
        };
    };
}


