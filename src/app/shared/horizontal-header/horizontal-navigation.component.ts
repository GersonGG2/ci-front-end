import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
import { PeriodosSocketService } from 'src/app/features/periodo/periodos-socket.service';
import { Alert } from 'src/app/helpers/alerts';
import { Subscription } from 'rxjs';

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
export class HorizontalNavigationComponent implements AfterViewInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  public showSearch = false;
  public isCollapsed = false;
  public showMobileMenu = false;
  public loading = false;

  notifications: any[] = [];
  unreadCount: number = 0;

  // 🔥 Suscripciones a WebSocket
  private periodoAperturadoSub: Subscription;
  private periodoCerradoSub: Subscription;

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
    private authService: AuthService,
    private periodosSocketService: PeriodosSocketService,
    private router: Router
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

    // 🔥 Inicializar notificaciones de periodos
    this.initPeriodosNotifications();
  }

  // 🔥 Inicializar escucha de notificaciones de periodos
  initPeriodosNotifications(): void {
    // Escuchar cuando se apertura un periodo
    this.periodoAperturadoSub = this.periodosSocketService.onPeriodoAperturado().subscribe({
      next: (data) => {
        console.log('📢 Periodo aperturado:', data);
        
        // Agregar notificación a la lista
        const notification = {
          id: `periodo-${data.id}-${Date.now()}`,
          btn: 'btn-success',
          icon: 'ti-calendar',
          title: 'Periodo Aperturado',
          subject: `El periodo "${data.nombre}" ha sido aperturado`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          link: '/periodos',
          type: 'success',
          periodoId: data.id
        };

        this.notifications.unshift(notification);
        this.unreadCount++;

        // Mostrar toast
        this.toastr.success(
          `El periodo "${data.nombre}" ha sido aperturado`,
          'Nuevo Periodo Disponible',
          { timeOut: 5000 }
        );
      },
      error: (error) => {
        console.error('Error al escuchar periodo aperturado:', error);
      }
    });

    // Escuchar cuando se cierra un periodo
    this.periodoCerradoSub = this.periodosSocketService.onPeriodoCerrado().subscribe({
      next: (data) => {
        console.log('📢 Periodo cerrado:', data);
        
        // Agregar notificación a la lista
        const notification = {
          id: `periodo-${data.id}-${Date.now()}`,
          btn: 'btn-warning',
          icon: 'ti-lock',
          title: 'Periodo Cerrado',
          subject: `El periodo "${data.nombre}" ha sido cerrado`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          link: '/periodos',
          type: 'warning',
          periodoId: data.id
        };

        this.notifications.unshift(notification);
        this.unreadCount++;

        // Mostrar toast
        this.toastr.warning(
          `El periodo "${data.nombre}" ha sido cerrado`,
          'Periodo Finalizado',
          { timeOut: 5000 }
        );
      },
      error: (error) => {
        console.error('Error al escuchar periodo cerrado:', error);
      }
    });
  }

  // 🔥 Navegar a periodos cuando se haga click en una notificación
  onNotificationClick(notification: any): void {
    console.log('🔔 Notificación clickeada:', notification);
    
    // Marcar como leída (remover de la lista)
    this.notifications = this.notifications.filter(n => n.id !== notification.id);
    this.unreadCount = Math.max(0, this.unreadCount - 1);

    // Navegar a la lista de periodos
    this.router.navigate(['/periodos']);
  }

  // 🔥 Marcar todas las notificaciones como leídas
  markAllAsRead(): void {
    this.notifications = [];
    this.unreadCount = 0;
    this.toastr.info('Todas las notificaciones han sido marcadas como leídas', 'Notificaciones');
  }

  configUser() {
    // Obtener datos del usuario actual
    this.user = this.authService.getUser();

    // Establecer nombre completo del usuario
    this.name = this.user?.nombre && this.user?.apellidos
      ? `${this.user.nombre} ${this.user.apellidos}`
      : 'Usuario';

    // Mantener el email original
    this.email = this.user?.email || 'usuario@sistema.com';

    // 🔥 Generar iniciales dinámicamente
    let initials = 'US'; // Por defecto
    if (this.user?.nombre && this.user?.apellidos) {
      const firstInitial = this.user.nombre.charAt(0).toUpperCase();
      const lastInitial = this.user.apellidos.charAt(0).toUpperCase();
      initials = firstInitial + lastInitial;
    }

    // Generar avatar con iniciales del usuario
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;

    // Fondo (color aleatorio basado en el nombre para que sea único)
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'];
    const colorIndex = (this.user?.nombre?.length || 0) % colors.length;
    context.fillStyle = colors[colorIndex];
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Texto con iniciales
    context.font = 'bold 100px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(initials, canvas.width / 2, canvas.height / 2);

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
      this.authService.logout();
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

  // 🔥 Limpiar suscripciones al destruir el componente
  ngOnDestroy(): void {
    if (this.periodoAperturadoSub) {
      this.periodoAperturadoSub.unsubscribe();
    }
    if (this.periodoCerradoSub) {
      this.periodoCerradoSub.unsubscribe();
    }
    // Desconectar socket
    this.periodosSocketService.disconnect();
  }
}