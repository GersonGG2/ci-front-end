import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { AppComponent } from './app.component';
import { SpinnerComponent } from './shared/spinner.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { AuthModule } from '@auth0/auth0-angular';
import { EnviromentHelper } from 'src/environments/environment';

import { NgxSpinnerModule } from 'ngx-spinner';
import { InterceptorService } from './shared/interceptors/interceptor.service';

import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent, SpinnerComponent],
  bootstrap: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    FeatherModule,
    FeatherModule.pick(allIcons),
    AppRoutingModule,
    NgSelectModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AuthModule.forRoot(EnviromentHelper.AUTH),
    NgxSpinnerModule,
    ToastrModule.forRoot()
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()), 
    { provide: HTTP_INTERCEPTORS, 
      useClass: InterceptorService, 
      multi: true,
      
    }]
})
export class AppModule {}
