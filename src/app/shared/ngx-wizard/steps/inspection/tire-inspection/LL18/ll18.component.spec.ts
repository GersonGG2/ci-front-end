import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LL18Component } from './ll18.component';

describe('LL18Component', () => {
  let component: LL18Component;
  let fixture: ComponentFixture<LL18Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LL18Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LL18Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
