import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapUpdateModalComponent } from './swap-update-modal.component';

describe('SwapUpdateModalComponent', () => {
  let component: SwapUpdateModalComponent;
  let fixture: ComponentFixture<SwapUpdateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwapUpdateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwapUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
