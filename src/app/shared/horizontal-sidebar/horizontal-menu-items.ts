import { RouteInfo } from './horizontal-sidebar.metadata';

export const ROUTES: RouteInfo[] = [

  {
    path: '/dashboard',
    title: 'Dashboard',
    icon: 'mdi mdi-view-dashboard',
    class: '',
    ddclass: '',
    extralink: false,
    submenu: [],
  },
  {
    path: '/',
    title: 'Configuraciones',
    icon: 'mdi mdi-settings',
    class: 'has-arrow',
    ddclass: '',
    extralink: false,
    submenu: [],
  },

];
