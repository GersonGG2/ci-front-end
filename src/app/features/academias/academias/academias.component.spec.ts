import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademiasComponent } from './academias.component';

describe('AcademiasComponent', () => {
  let component: AcademiasComponent;
  let fixture: ComponentFixture<AcademiasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademiasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
