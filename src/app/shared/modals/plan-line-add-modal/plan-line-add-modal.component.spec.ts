import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanLineAddModalComponent } from './plan-line-add-modal.component';

describe('PlanLineAddModalComponent', () => {
  let component: PlanLineAddModalComponent;
  let fixture: ComponentFixture<PlanLineAddModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanLineAddModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanLineAddModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
