import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanApproveInformationModalComponent } from './plan-approve-information-modal.component';

describe('PlanApproveInformationModalComponent', () => {
  let component: PlanApproveInformationModalComponent;
  let fixture: ComponentFixture<PlanApproveInformationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanApproveInformationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanApproveInformationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
