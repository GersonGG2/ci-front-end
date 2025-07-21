import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Session } from './session.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  @Input() set appHasPermission(permission: string | string[]) {

    const user = Session.getUser();
    const isAdmin = true;

    const userPermissions = this.getUserPermissions(); // Implementa esto según tu app

    const has =
      Array.isArray(permission)
        ? permission.some(p => userPermissions.includes(p))
        : userPermissions.includes(permission);

    if (isAdmin || has) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  private getUserPermissions(): string[] {
    // Aquí deberías obtener los permisos del usuario desde tu servicio de autenticación
    // Ejemplo:
    // return this.authService.getPermissions();
    return ['PERMISO_1', 'PERMISO_2']; // Solo para ejemplo
  }
}

export function extractUserPermissions(userJson: any): string[] {
  const permissions: string[] = [];
  const modules = userJson?.data?.user?.menu?.modules || [];

  for (const module of modules) {
    // Permiso a nivel módulo
    if (module.moduleCode) {
      permissions.push(module.moduleCode);
    }
    // Permiso a nivel página
    if (Array.isArray(module.pages)) {
      for (const page of module.pages) {
        if (page.filePath) {
          permissions.push(`${module.moduleCode}/${page.filePath}`);
        }
      }
    }
  }
  return permissions;
}