import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNote } from './edit-note';

describe('EditNote', () => {
  let component: EditNote;
  let fixture: ComponentFixture<EditNote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditNote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditNote);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
