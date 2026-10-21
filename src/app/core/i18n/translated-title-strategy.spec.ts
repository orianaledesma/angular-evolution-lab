import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { TranslatedTitleStrategy } from './translated-title-strategy';

@Component({ selector: 'app-blank', template: '' })
class Blank {}

describe('TranslatedTitleStrategy', () => {
  it('translates route titles and follows language changes', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateTesting(),
        provideRouter([
          { path: '', title: 'nav.home', component: Blank },
          { path: 'v22', title: 'nav.v22', component: Blank },
          { path: 'untitled', component: Blank },
        ]),
        { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
      ],
    });
    const title = TestBed.inject(Title);
    const harness = await RouterTestingHarness.create('/v22');
    expect(title.getTitle()).toBe('OnPush by default · Angular Evolution Lab');

    await firstValueFrom(TestBed.inject(TranslateService).use('de'));
    expect(title.getTitle()).toBe('OnPush als Standard · Angular Evolution Lab');

    await harness.navigateByUrl('/untitled');
    expect(title.getTitle()).toBe('Angular Evolution Lab');
  });
});
