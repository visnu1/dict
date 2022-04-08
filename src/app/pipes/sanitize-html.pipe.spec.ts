import { TestBed } from '@angular/core/testing';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';

describe('SanitizeHtmlPipe', () => {
  it('create an instance', () => {
    const fixture = TestBed.createComponent(SanitizeHtmlPipe);
    const pipe = fixture.componentInstance;
    expect(pipe).toBeTruthy();
  });
});
