import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DamagesTiresModalComponent } from './damages-tires-modal.component';

describe('DamagesTiresModalComponent', () => {
  let component: DamagesTiresModalComponent;
  let fixture: ComponentFixture<DamagesTiresModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DamagesTiresModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DamagesTiresModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
