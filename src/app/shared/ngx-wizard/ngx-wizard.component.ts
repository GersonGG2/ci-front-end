import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'multi-step-wizard-app',
  templateUrl: './ngx-wizard.component.html',
  styleUrls: ['./ngx-wizard.component.scss'],
  standalone: false
})
export class NGXFormWizardComponent {

  currentModule: string = '';
  currentId: string = '';
  
  constructor(private router: Router, private route: ActivatedRoute) {
    const fullUrl = this.router.url;
    const parts = fullUrl.split('/');
    this.currentModule = parts[1];
    this.currentId = parts[parts.length - 1];
  }

  goBack() {
    this.router.navigate([`/${this.currentModule}`]);
  }

}
