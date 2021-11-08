import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './components/loader/loader.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from '../material.module';
import { DisabledSwapPipe } from './pipes/disabled.pipe';
import { ValueOfKeyPipe } from './pipes/value-of-key.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { StarRatingComponent } from './components/star-rating/star-rating.component';


@NgModule({
  declarations: [
    LoaderComponent, 
    ConfirmDialogComponent,
    DisabledSwapPipe,
    FilterPipe,
    ValueOfKeyPipe,
    StarRatingComponent
  ],
  imports: [
    CommonModule,
    MaterialModule    
  ],
  exports: [
    ConfirmDialogComponent,
    ValueOfKeyPipe,
    DisabledSwapPipe,
    FilterPipe,
    LoaderComponent,
    StarRatingComponent
  ]
})
export class SharedModule { }
