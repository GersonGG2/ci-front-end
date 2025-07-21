import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanLineStatusModalComponent } from './plan-line-status-modal.component';

describe('PlanLineStatusModalComponent', () => {
  let component: PlanLineStatusModalComponent;
  let fixture: ComponentFixture<PlanLineStatusModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanLineStatusModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanLineStatusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
