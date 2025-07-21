import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LLComponent } from './ll.component';

describe('LLComponent', () => {
  let component: LLComponent;
  let fixture: ComponentFixture<LLComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LLComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
