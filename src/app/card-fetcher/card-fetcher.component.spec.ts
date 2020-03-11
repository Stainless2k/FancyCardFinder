import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFetcherComponent } from './card-fetcher.component';

describe('CardFetcherComponent', () => {
  let component: CardFetcherComponent;
  let fixture: ComponentFixture<CardFetcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardFetcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardFetcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
