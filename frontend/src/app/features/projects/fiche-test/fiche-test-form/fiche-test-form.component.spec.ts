import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheTestFormComponent } from './fiche-test-form.component';

describe('FicheTestFormComponent', () => {
  let component: FicheTestFormComponent;
  let fixture: ComponentFixture<FicheTestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheTestFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheTestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
