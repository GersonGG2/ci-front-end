import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrdersDetailComponent } from './work-orders-detail.component';

describe('WorkOrdersDetailComponent', () => {
  let component: WorkOrdersDetailComponent;
  let fixture: ComponentFixture<WorkOrdersDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkOrdersDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrdersDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
