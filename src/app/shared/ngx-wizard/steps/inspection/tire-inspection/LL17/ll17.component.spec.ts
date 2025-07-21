import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LL17Component } from './ll17.component';

describe('LL17Component', () => {
  let component: LL17Component;
  let fixture: ComponentFixture<LL17Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LL17Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LL17Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
