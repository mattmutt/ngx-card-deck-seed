import { BusinessNodeflowCardProviderSchema } from "../provider/business-nodeflow-card-provider.interface";

export interface AssetNodeConfigurationCardMetadataSchema {

    [identifier: string]: any;

    // a provider is a natural extension to the card structure and allows named injectors to supply business details
    provider: {
        // business use case - feel free to extend to supporting other functional needs
        business: BusinessNodeflowCardProviderSchema;
    };

    model: {

        producer: {
            messages: Array<{
                topic: string;
                form: {
                    component: string;
                };
                state: {
                    classifier: string;
                    data: any;
                }
            }>;
        };

        link: {
            sockets: Array<{
                id: string;
                type: "input" | "output",
                topic: string;
                multicast: boolean;

                // message producing socket deliver
                subscribers?: Array<{
                    id: string;
                    valid: boolean;
                }>;

            }>
        };
    };

    // connectors
    // inputs
    // validation state


}

export interface AssetNodeConfigurationCardSchema {
    id: string;
    component: string;
    header: {
        title: string;
        icon?: string;
    };
    layout: {
        x: number;
        y: number;
        width: number;
        height: number
    };
    metadata: AssetNodeConfigurationCardMetadataSchema;

    services?: Array<{
        network?: {
            url: string;
            isSync?: boolean;
        }
    }>;
    templates: Array<{
        body: {
            organization: string;
            template: string;
        }

    }>;
}


export interface AssetNodeConfigurationSchema {
    id: string;
    cards: Array<AssetNodeConfigurationCardSchema>;
}


