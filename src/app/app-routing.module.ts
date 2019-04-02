import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from "./about/about.component";


const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'about', component: AboutComponent},
    {
        path: 'dashboard',
        loadChildren: './pages/dashboard/demo-dashboard.module#DemoDashboardModule'
    },

    /*
    {
       path: 'dashboard',
       component: DemoDashboardComponent,
       children: [
          {
             path: 'dashboard-page/:organizer/:configuration',
             component: DemoDashboardPageComponent,
             resolve: {configuration: DemoDashboardRouting}
          }
       ]
    },
    */

    {path: '**', redirectTo: ''}
];

export const ROUTING: ModuleWithProviders = RouterModule.forRoot(routes,
    {
        // Note: the HTML5 strategy is highly recommended. It requires server rewrites to be configured

        // For purposes of this demo, the simple ( always works ) hashing strategy is applied for routing
        useHash: true,

        // enableTracing: true,
        // preloadingStrategy: PreloadSelectedModulesList
    }
);


@NgModule({
    imports: [ROUTING],
    exports: [RouterModule]
})
export class AppRoutingModule {
}


