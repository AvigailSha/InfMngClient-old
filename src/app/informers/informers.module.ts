import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InformersListComponent } from './components/informers-list/informers-list.component';
import { InformersDetailsComponent } from './components/informers-details/informers-details.component';
import { AddObservationComponent } from './components/add-observation/add-observation.component';
import { SwapInfStepsComponent } from './components/swap-inf-steps/swap-inf-steps.component';
import { FindNewInformerComponent } from './components/find-new-informer/find-new-informer.component';
import { InfFoldersComponent } from './components/inf-folders/inf-folders.component';
import { InformersRoutingModule } from './informers-routing.module';
import { MaterialModule } from '../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    InformersListComponent, 
    InformersDetailsComponent, 
    AddObservationComponent, 
    SwapInfStepsComponent, 
    FindNewInformerComponent, 
    InfFoldersComponent
  ],
  imports: [
    CommonModule,
    InformersRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class InformersModule { }
