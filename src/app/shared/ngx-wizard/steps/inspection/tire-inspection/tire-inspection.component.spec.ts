import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TireInspectionComponent } from './tire-inspection.component';

describe('TireInspectionComponent', () => {
  let component: TireInspectionComponent;
  let fixture: ComponentFixture<TireInspectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TireInspectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TireInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
