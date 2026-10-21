import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { REQUIREMENTS, testName } from './requirements-data';

@Component({
  selector: 'app-requirements',
  imports: [TranslatePipe, RouterLink, Badge],
  templateUrl: './requirements.html',
  styleUrl: './requirements.scss',
})
export default class Requirements {
  protected readonly rows = REQUIREMENTS;
  protected readonly testName = testName;
}
