import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './pages/main-page/users.component';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        UsersRoutingModule,
        UsersComponent
    ]
})
export class UsersModule { }