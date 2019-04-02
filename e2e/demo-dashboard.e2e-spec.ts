import { DemoDashboardPage } from './demo-dashboard.po';

describe('dashboard demo page', () => {
   let page: DemoDashboardPage;

   beforeEach(() => {
      page = new DemoDashboardPage();
      page.navigateTo();
   });

   it('verify 7-card layout with sample titles on deck', async () => {

      expect(await page.getCardCount()).toEqual(7);

      const expectedTitleList: Array<string> = [
         'Frozen Landscapes',
         'Consumer Insights',
         'Hardware Health Insights',
         'Remote ~ Plugin 1',
         'Remote ~ Video Streams Plugin 2',
         'Remote ~ Banking Agent Plugin 3',
         'Satellite Weather'
      ];

      expect((await page.getCardTitleTextList()).sort()).toEqual(expectedTitleList.sort());
      expect((await page.getCardTitleTextList()).sort()).not.toContain("garbage title"); // negative

   });

});
