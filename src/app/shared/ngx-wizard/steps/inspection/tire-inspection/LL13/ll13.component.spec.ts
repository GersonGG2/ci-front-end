import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LL13Component } from './ll13.component';

describe('LL13Component', () => {
  let component: LL13Component;
  let fixture: ComponentFixture<LL13Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LL13Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LL13Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
