import './../../testing-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaqComponent } from './faq';
import { FAQ_DATA } from './faq.data';

describe('FaqComponent', () => {
  let fixture: ComponentFixture<FaqComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqComponent);
    fixture.detectChanges();
  });

  it('renderiza um comando (pergunta) por item da FAQ', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button[aria-expanded]');
    expect(buttons.length).toBe(FAQ_DATA.length);
  });

  it('exibe todos os comandos CLI esperados', () => {
    const text = fixture.nativeElement.textContent;
    for (const item of FAQ_DATA) {
      expect(text).toContain(`./m4gns ${item.command}`);
    }
  });

  it('abre a primeira pergunta por padrão', () => {
    const first = fixture.nativeElement.querySelector('button[aria-expanded]') as HTMLButtonElement;
    expect(first.getAttribute('aria-expanded')).toBe('true');
  });

  it('alterna a resposta ao clicar no comando', () => {
    const first = fixture.nativeElement.querySelector('button[aria-expanded]') as HTMLButtonElement;

    first.click();
    fixture.detectChanges();
    expect(first.getAttribute('aria-expanded')).toBe('false');

    first.click();
    fixture.detectChanges();
    expect(first.getAttribute('aria-expanded')).toBe('true');
  });

  it('mantém todas as respostas no DOM (AEO: crawlers leem o HTML cru)', () => {
    const text = fixture.nativeElement.textContent;
    for (const item of FAQ_DATA) {
      expect(text).toContain(item.answer);
    }
  });
});