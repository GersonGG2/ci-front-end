import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsRoutingModule } from './norification-routing.module';
import { NotificationsComponent } from './pages/main-page/notifications.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPagination, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from './services/notificationService.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    NotificationsComponent,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule
  ],
  providers: [NotificationService] 
})
export class NotificationsModule { }