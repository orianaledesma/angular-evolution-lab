import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService, isLanguage } from '@core/i18n/language.service';
import { Badge } from '@shared/ui/badge/badge';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { QUESTIONS } from '../interview/questions';
import { REQUIREMENTS } from '../requirements/requirements-data';
import { TIMELINE } from './timeline';

@Component({
  selector: 'app-home',
  imports: [TranslatePipe, RouterLink, Badge, Button, Card],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class Home {
  protected readonly language = inject(LanguageService);
  protected readonly timeline = TIMELINE;
  protected readonly stats = [
    { value: String(TIMELINE.length), key: 'home.stats.versions' },
    { value: '40+', key: 'home.stats.demos' },
    { value: String(REQUIREMENTS.length), key: 'home.stats.requirements' },
    { value: String(QUESTIONS.length), key: 'home.stats.questions' },
    { value: '0', key: 'home.stats.zone' },
  ] as const;
  protected readonly topics = [
    { path: '/lifecycle', key: 'nav.lifecycle', body: 'home.topics.lifecycle' },
    { path: '/rxjs', key: 'nav.rxjs', body: 'home.topics.rxjs' },
    { path: '/interview', key: 'nav.interview', body: 'home.topics.interview' },
    { path: '/quiz', key: 'nav.quiz', body: 'home.topics.quiz' },
  ] as const;

  protected switchTo(lang: string): void {
    if (isLanguage(lang)) {
      this.language.use(lang).subscribe();
    }
  }
}
