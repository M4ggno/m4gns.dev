import './../../testing-setup';
import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer';
import { SITE } from '@core/site.config';

describe('FooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FooterComponent] }).compileComponents();
  });

  it('promove o Instagram como âncora de conversão', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector(`a[href="${SITE.social.instagram.url}"]`);
    expect(anchor).toBeTruthy();
    expect(anchor.textContent).toContain(SITE.social.instagram.handle);
    expect(anchor.getAttribute('rel')).toContain('noopener');
  });

  it('não usa rastreadores: roda com zero cookies de terceiros', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('SEM COOKIES DE RASTREAMENTO');
  });
});