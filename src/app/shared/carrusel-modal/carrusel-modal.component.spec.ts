import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarruselModalComponent } from './carrusel-modal.component';

describe('CarruselModalComponent', () => {
  let component: CarruselModalComponent;
  let fixture: ComponentFixture<CarruselModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarruselModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarruselModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
