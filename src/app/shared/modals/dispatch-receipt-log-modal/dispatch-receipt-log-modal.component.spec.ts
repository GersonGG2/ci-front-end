import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchReceiptLogModalComponent } from './dispatch-receipt-log-modal.component';

describe('DispatchReceiptLogModalComponent', () => {
  let component: DispatchReceiptLogModalComponent;
  let fixture: ComponentFixture<DispatchReceiptLogModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispatchReceiptLogModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DispatchReceiptLogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
