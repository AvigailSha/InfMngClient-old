import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InformersListComponent } from './components/informers-list/informers-list.component';

const routes: Routes = [
  {path: '', component: InformersListComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformersRoutingModule { }
