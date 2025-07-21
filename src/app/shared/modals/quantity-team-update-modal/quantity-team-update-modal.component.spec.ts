import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantityTeamUpdateModalComponent } from './quantity-team-update-modal.component';

describe('QuantityTeamUpdateModalComponent', () => {
  let component: QuantityTeamUpdateModalComponent;
  let fixture: ComponentFixture<QuantityTeamUpdateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantityTeamUpdateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantityTeamUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
