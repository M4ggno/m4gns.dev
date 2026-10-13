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

  it('renderiza todas as perguntas da FAQ', () => {
    const heads = fixture.nativeElement.querySelectorAll('h3');
    expect(heads.length).toBe(FAQ_DATA.length);
  });

  it('cada cartão exibe a pergunta seguida da resposta esperada', () => {
    const articles = fixture.nativeElement.querySelectorAll('article');
    expect(articles.length).toBe(FAQ_DATA.length);

    for (let i = 0; i < articles.length; i++) {
      const heading = articles[i].querySelector('h3')?.textContent?.trim();
      const answer = articles[i].querySelector('p')?.textContent?.trim();
      expect(heading).toBe(FAQ_DATA[i].question);
      expect(answer).toBe(FAQ_DATA[i].answer);
    }
  });
});