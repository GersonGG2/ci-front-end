import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NGXFormWizardComponent } from './ngx-wizard.component';

describe('NGXFormWizardComponent', () => {
  let component: NGXFormWizardComponent;
  let fixture: ComponentFixture<NGXFormWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NGXFormWizardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NGXFormWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
