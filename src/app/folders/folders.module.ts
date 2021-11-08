import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoldersComponent } from './components/folders/folders.component';
import { FolderItemsComponent } from './components/folder-items/folder-items.component';
import { FoldersRoutingModule } from './folders-routing.module';
import { MaterialModule } from '../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [FoldersComponent, FolderItemsComponent],
  imports: [
    CommonModule,
    FoldersRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class FoldersModule { }
