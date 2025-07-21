import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LL16Component } from './ll16.component';

describe('LL16Component', () => {
  let component: LL16Component;
  let fixture: ComponentFixture<LL16Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LL16Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LL16Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
