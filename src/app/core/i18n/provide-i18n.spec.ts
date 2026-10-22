import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import en from '../../../../public/i18n/en.json';
import { provideI18n } from './provide-i18n';

describe('provideI18n', () => {
  it('loads the initial language over HTTP before the app starts', async () => {
    localStorage.clear();
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ...provideI18n()],
    });
    const init = TestBed.inject(ApplicationInitStatus);
    TestBed.inject(HttpTestingController).expectOne('i18n/en.json').flush(en);
    await init.donePromise;
    expect(TestBed.inject(TranslateService).instant('app.title')).toBe('Angular Evolution Lab');
  });
});
