import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionSheetComponent } from './inspection-sheet.component';

describe('InspectionSheetComponent', () => {
  let component: InspectionSheetComponent;
  let fixture: ComponentFixture<InspectionSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionSheetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InspectionSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
