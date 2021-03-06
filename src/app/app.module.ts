import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { WebApiCallsService } from './core/services/web-api-calls.service';
import { GetCodecsService } from './core/services/get-codecs.service';
import { ConfirmDialogService } from './core/services/confirm-dialog.service';
import { HttpClientModule } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { EntityDataModule } from '@ngrx/data';
import { entityConfig } from './redux/entity-metadata';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,    
    AngularSvgIconModule.forRoot(),
    SharedModule,
    StoreDevtoolsModule.instrument({maxAge:25,logOnly: environment.production}),
    EntityDataModule.forRoot(entityConfig)
  ],
  providers: [
    WebApiCallsService,
    GetCodecsService,
    ConfirmDialogService,
    { provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
