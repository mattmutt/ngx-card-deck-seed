import { Inject, Injectable } from "@angular/core";
import { asyncScheduler, Observable, of, throwError } from "rxjs";
import { DemoDashboardDeploymentConfigurationService } from "../../../../../../../integration/environment/demo-dashboard-deployment-configuration.service";
import { DemoDashboardGlobalStateService } from "../../../../../../../integration/environment/demo-dashboard-global-state.service";
import { HttpClient, HttpEvent } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { MessageResult } from "ngx-card-deck";
import { DeploymentConfigurationBase } from "ngx-card-deck";


// checks on user session to lookup validation tokens, information
@Injectable()
export class DemoAppSessionObserverService {

    private _userSessionStream$: Observable<MessageResult>;
    private _appGlobalState: DemoDashboardGlobalStateService;
    private shouldRetry = false;


    constructor(private _http: HttpClient,
                @Inject(DeploymentConfigurationBase) private _deploymentConfiguration: DemoDashboardDeploymentConfigurationService) {

    }

    // supply state
    public setState(s: DemoDashboardGlobalStateService) {
        this._appGlobalState = s;
    }


    // +++++++++++ public interface +++++++++++++++++++++
    public getUserSessionStream(): Observable<MessageResult> {

        // session record is retained
        if ((!this._userSessionStream$) || this.shouldRetry) {
            this.shouldRetry = false;
            this._userSessionStream$ = this.initStream();
        } else {
            // console.log("cached session stream");
        }
        return this._userSessionStream$;
    }


    // -------------------- internal -------------

    /**
     * business rule : for production, sparing one network call
     * for standalone, incur a measly network call penalty
     */
    private initStream(): Observable<MessageResult> {

        // some thing not correct about the generalized casting
        return of<any>({success: true}, asyncScheduler);

        // check, has capabilities pulled from the legacy app client?
        /*
        if (this._deploymentConfiguration.deploymentMetadata.page.sandboxed ) {
            // use case when sandboxed, can borrow across hosting page
        } else {
            // provided from codebase
        }

        return this.get<MessageResult>("usersession");
        */

    }


    private handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body: any = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return throwError(errMsg);
    }

    // quintessential protocol for fetching basic data
    private get<T>(url: string, config: any = {}): Observable<HttpEvent<T>> {

        config.withCredentials = true; // potential

        return this._http.get<T>(this.generatePlatformUrl(url), config).pipe(catchError(this.handleError));

    }


    /* determine route, based upon platform connection to app via dashboard app */
    private generatePlatformUrl(endpoint: string): string {
        const sessionConfiguration = this._deploymentConfiguration.selectService("session");

        return this._deploymentConfiguration.assembleValidUrl(sessionConfiguration, null as any);
    }

}

