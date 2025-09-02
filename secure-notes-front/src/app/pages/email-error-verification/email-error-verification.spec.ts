import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailErrorVerification } from './email-error-verification';

describe('EmailErrorVerification', () => {
  let component: EmailErrorVerification;
  let fixture: ComponentFixture<EmailErrorVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailErrorVerification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailErrorVerification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
