import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoldersComponent } from './components/folders/folders.component';
import { FolderItemsComponent } from './components/folder-items/folder-items.component';
import { FoldersRoutingModule } from './folders-routing.module';
import { MaterialModule } from '../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ENTITY_METADATA_TOKEN } from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { foldersEffects } from './redux/folders.effects';
import { StoreModule } from '@ngrx/store';
import { folderFeatureKey } from './redux/folders.state';
import { foldersReducer } from './redux/folders.reducer'



@NgModule({
  declarations: [FoldersComponent, FolderItemsComponent],
  imports: [
    CommonModule,
    FoldersRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule,
    EffectsModule.forFeature([foldersEffects]),
    StoreModule.forFeature(folderFeatureKey, foldersReducer)
  ],
  providers: [

  ]
})
export class FoldersModule { }