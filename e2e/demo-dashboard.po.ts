import { browser, by, element } from "protractor";
import { promise } from "selenium-webdriver";

const resources = {
   mainComponentSelector: "ngx-card-deck",
   route: {
      test: "#/dashboard/dashboard-page/com_company_sample2/deck1"
   }
};

export class DemoDashboardPage {
   navigateTo() {
      return browser.get(resources.route.test);
   }

   getHeaderText(): promise.Promise<string> {
      return element(by.css(resources.mainComponentSelector + " section[role='headerLayout'] > SPAN")).getText();
   }

   getCardTitleTextList(): promise.Promise<Array<string>> {
      return element.all(by.css(resources.mainComponentSelector + " dash-card-outlet > article > header > [role='tab']")).getText() as any as promise.Promise<Array<string>>;
   }

   getCardCount(): promise.Promise<number> {
      return element.all(by.css(resources.mainComponentSelector + " dash-card-outlet")).count();
   }

}
