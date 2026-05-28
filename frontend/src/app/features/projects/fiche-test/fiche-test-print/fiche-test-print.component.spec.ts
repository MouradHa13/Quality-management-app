import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheTestPrintComponent } from './fiche-test-print.component';

describe('FicheTestPrintComponent', () => {
  let component: FicheTestPrintComponent;
  let fixture: ComponentFixture<FicheTestPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheTestPrintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheTestPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
