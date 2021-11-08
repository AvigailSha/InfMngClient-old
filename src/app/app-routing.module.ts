import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { FoldersModule } from './folders/folders.module';
import { InformersModule } from './informers/informers.module';
import { TasksModule } from './tasks/tasks.module';

const routes: Routes = [
  //{path: '', redirectTo: 'main', pathMatch: 'full'},
  {path: 'login', component: LoginComponent}, 
  {path: '', component: MainComponent, children: [
    {path: '', loadChildren: () => import('./informers/informers.module').then(m => InformersModule)},
    {path: 'informers', loadChildren: () => import('./informers/informers.module').then(m => InformersModule)},
    //{path: 'checkes', loadChildren: () => import('./informers/informers.module').then(m => InformersModule)},
    {path: 'tasks', loadChildren: () => import('./tasks/tasks.module').then(m => TasksModule)},
    {path: 'folders', loadChildren: () => import('./folders/folders.module').then(m => FoldersModule)} ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
