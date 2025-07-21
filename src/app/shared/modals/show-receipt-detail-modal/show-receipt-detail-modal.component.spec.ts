import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowReceiptDetailModalComponent } from './show-receipt-detail-modal.component';

describe('ShowReceiptDetailModalComponent', () => {
  let component: ShowReceiptDetailModalComponent;
  let fixture: ComponentFixture<ShowReceiptDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowReceiptDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowReceiptDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
