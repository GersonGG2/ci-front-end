import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  NgbAccordionModule,
  NgbCarouselModule,
  NgbDropdownModule,
  NgbModal,
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ToastrService } from 'ngx-toastr';
import { AuthGuard } from 'src/app/features/authentication/auth.guard';
import { AuthService } from 'src/app/features/authentication/authService.service';
import { NotificationService } from 'src/app/features/notifications/services/notificationService.service';
import { Alert } from 'src/app/helpers/alerts';

declare var $: any;

@Component({
  selector: 'app-horizontal-navigation',
  imports: [
    NgScrollbarModule,
    NgbNavModule,
    CommonModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbDropdownModule,
    RouterModule,
  ],
  templateUrl: './horizontal-navigation.component.html'
})
export class HorizontalNavigationComponent implements AfterViewInit {
  @Output() toggleSidebar = new EventEmitter<void>();


  public showSearch = false;
  public isCollapsed = false;
  public showMobileMenu = false;
  public loading = false;

  notifications: any[] = [];
  unreadCount: number = 0;

  // This is for Mymessages
  mymessages: any[] = [
    {
      useravatar: 'assets/images/users/user1.jpg',
      status: 'online',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:30 AM',
    },
    {
      useravatar: 'assets/images/users/user2.jpg',
      status: 'busy',
      from: 'Sonu Nigam',
      subject: 'I have sung a song! See you at',
      time: '9:10 AM',
    },
    {
      useravatar: 'assets/images/users/user2.jpg',
      status: 'away',
      from: 'Arijit Sinh',
      subject: 'I am a singer!',
      time: '9:08 AM',
    },
    {
      useravatar: 'assets/images/users/user4.jpg',
      status: 'offline',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:00 AM',
    },
  ];

  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: 'us',
  };

  public languages: any[] = [
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: 'us',
    },
    {
      language: 'French',
      code: 'fr',
      icon: 'fr',
    },
    {
      language: 'Spanish',
      code: 'es',
      icon: 'es',
    },
    {
      language: 'German',
      code: 'de',
      icon: 'de',
    },
  ];
  user: any = null;
  name: string = '';
  email: string = '';
  role: string = '';
  image: string = 'assets/images/users/default.jpg';

  constructor(
    private modalService: NgbModal,
    private translate: TranslateService,
    private authGuard: AuthGuard,
    private toastr: ToastrService,
    private notificationService: NotificationService,
    private authService: AuthService,
  ) {
    translate.setDefaultLang('en');
    this.configUser();
  }

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.name = `${user.nombre} ${user.apellidos}`;
      this.email = user.email;
      // Si roles es un array de objetos, mapea a string antes de unir
      this.role = Array.isArray(user.roles)
        ? user.roles.map(r => typeof r === 'string' ? r : r.nombre).join(', ')
        : user.roles;
    }
  }

  /**
   * Carga las notificaciones desde la API
   */
  async loadNotifications(): Promise<void> {
    try {
      this.loading = true;

      // Filtrar por notificaciones sin leer y limitar a 5
      const filters = {
        limit: 5,
        status: 'unread',
      };

      const response = await this.notificationService.getNotifications(filters);

      if (response && response.data && response.data.rows) {
        this.notifications = response.data.rows.map(notification => {
          // Mapeo de prioridad a clase de botón
          const btnMap = {
            'info': 'btn-info',
            'success': 'btn-success',
            'warning': 'btn-warning',
            'error': 'btn-danger'
          };
          // Mapeo de estado a icono
          const iconMap = {
            'read': 'icon-check',
            'unread': 'icon-bell'
          };

          // Formatear fecha para que sea legible
          const createdDate = new Date(notification.createdAt);
          const formattedDate = createdDate.toLocaleDateString() + ' ' +
            createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return {
            id: notification.id,
            btn: btnMap[notification.type] || 'btn-primary',
            icon: iconMap[notification.status] || 'icon-bell',
            title: notification.module,
            subject: notification.message,
            time: formattedDate,
            link: notification.link || '/notifications',
            type: notification.type,
            status: notification.status
          };
        });

        // Contar notificaciones sin leer (solo las que tienen status: 'unread')
        this.unreadCount = response.data.count;
      } else {
        this.notifications = [];
        this.unreadCount = 0;
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      this.toastr.error('Error al cargar notificaciones', 'Error');
    } finally {
      this.loading = false;
    }
  }
  /**
   * Marca una notificación como leída
   */
  async markAsRead(id: number, event: Event): Promise<void> {
    try {
      event.preventDefault(); // Evitar navegación
      event.stopPropagation(); // Detener propagación

      // Usar el nuevo método específico
      await this.notificationService.markNotificationReadStatus(id, true);

      // Actualizar la lista localmente
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.unreadCount = Math.max(0, this.unreadCount - 1);

      this.toastr.success('Notificación marcada como leída', 'Éxito');
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      this.toastr.error('Error al marcar como leída', 'Error');
    }
  }

  async markAsUnread(id: number, event: Event): Promise<void> {
    try {
      event.preventDefault(); // Evitar navegación
      event.stopPropagation(); // Detener propagación

      await this.notificationService.markNotificationReadStatus(id, false);

      // Recargar notificaciones para mostrar la que acaba de marcarse como no leída
      await this.loadNotifications();

      this.toastr.success('Notificación marcada como no leída', 'Éxito');
    } catch (error) {
      console.error('Error al marcar como no leída:', error);
      this.toastr.error('Error al marcar como no leída', 'Error');
    }
  }

  // configUser() {

  //   this.user = this.authGuard.getUser();

  //   const names = this.user?.nickname.split('.');
  //   if (names.length >= 2) {
  //     this.name = names[0].charAt(0).toUpperCase() + names[0].slice(1);
  //     this.name += ' ' + names[1].charAt(0).toUpperCase() + names[1].slice(1);
  //   }

  //   this.email = this.user?.email;
  //   this.image = this.user?.picture;
  // }
  configUser() {
    // Obtener datos del usuario actual
    this.user = this.authService.getUser();

    // Establecer nombre como Admin
    this.name = "Admin";

    // Mantener el email original
    this.email = this.user?.email || 'admin@sistema.com';

    // Generar avatar con iniciales "AD" (de ADmin)
    // Color de fondo dorado/amarillo para representar admin
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;

    // Fondo
    context.fillStyle = '#ffc107'; // Color amarillo/dorado
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Texto
    context.font = 'bold 100px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('AD', canvas.width / 2, canvas.height / 2);

    // Convertir a imagen
    this.image = canvas.toDataURL('image/png');
  }
  ngAfterViewInit() { }

  changeLanguage(lang: any) {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  async onLogout() {

    if (await Alert.question(
      'Cerrar sesión',
      '¿Está seguro de que desea cerrar sesión?'
    )) {
      this.authService.logout(); // Llama al método de logout
    }
  }

  async onRecover() {
    if (await Alert.question(
      'Recuperar contraseña',
      '¿Está seguro de que desea recuperar su contraseña?'
    )) {
      this.toastr.success('Recuperar contraseña', 'Se ha enviado un correo para recuperar su contraseña');
    }
  }

}
