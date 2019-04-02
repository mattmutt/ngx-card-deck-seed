import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DemoDashboardComponent} from './demo-dashboard.component';
import {RouterTestingModule} from '@angular/router/testing';

describe('DemoDashboardComponent', () => {
  let component: DemoDashboardComponent;
  let fixture: ComponentFixture<DemoDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [DemoDashboardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create place holder', () => {
    expect(component).toBeTruthy();
  });
});
