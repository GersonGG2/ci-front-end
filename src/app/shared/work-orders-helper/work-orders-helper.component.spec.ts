import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrdersHelperComponent } from './work-orders-helper.component';

describe('WorkOrdersHelperComponent', () => {
  let component: WorkOrdersHelperComponent;
  let fixture: ComponentFixture<WorkOrdersHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkOrdersHelperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrdersHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
