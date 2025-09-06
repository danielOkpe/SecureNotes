import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailNotValid } from './email-not-valid';

describe('EmailNotValid', () => {
  let component: EmailNotValid;
  let fixture: ComponentFixture<EmailNotValid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailNotValid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailNotValid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
