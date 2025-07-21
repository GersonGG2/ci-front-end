import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DamagesModalComponent } from './damages-modal.component';

describe('DamagesModalComponent', () => {
  let component: DamagesModalComponent;
  let fixture: ComponentFixture<DamagesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DamagesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DamagesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
