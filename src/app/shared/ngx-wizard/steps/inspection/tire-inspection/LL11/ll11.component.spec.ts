import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LL11Component } from './ll11.component';

describe('LL11Component', () => {
  let component: LL11Component;
  let fixture: ComponentFixture<LL11Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LL11Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LL11Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
