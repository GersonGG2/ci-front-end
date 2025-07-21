import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LL12Component } from './ll12.component';

describe('LL12Component', () => {
  let component: LL12Component;
  let fixture: ComponentFixture<LL12Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LL12Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LL12Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
