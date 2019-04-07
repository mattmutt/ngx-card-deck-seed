import { InjectionToken } from "@angular/core";
import { StudioCompositorConfigurationSchema } from "./nodeflow-studio-compositor-configuration.interface";

export const NODEFLOW_STUDIO_COMPOSITOR_CONFIG = new InjectionToken<StudioCompositorConfigurationSchema>("Compositor Configuration Properties");

