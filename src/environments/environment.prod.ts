
export class EnviromentHelper {
  public static URL_ITZ_WS = 'http://localhost:3000';


  public static readonly AUTH_CALLBACK = 'http://localhost:4200/';
}
export const environment = {
  itz: {
    auth: {
      login: EnviromentHelper.URL_ITZ_WS + '/auth/login',
      register: EnviromentHelper.URL_ITZ_WS + '/auth/register',
      profile: EnviromentHelper.URL_ITZ_WS + '/auth/profile',
      callback: EnviromentHelper.URL_ITZ_WS + '/auth/callback' 
    },
    usuarios: {
      main: EnviromentHelper.URL_ITZ_WS + '/usuarios',
      create: EnviromentHelper.URL_ITZ_WS + '/users',
      getAll: EnviromentHelper.URL_ITZ_WS + '/users',
      getById: EnviromentHelper.URL_ITZ_WS + '/users/',
      update: EnviromentHelper.URL_ITZ_WS + '/users/',
      delete: EnviromentHelper.URL_ITZ_WS + '/users/',
      replaceRoles: EnviromentHelper.URL_ITZ_WS + '/users/',
      getByAuth0Id: EnviromentHelper.URL_ITZ_WS + '/users/auth/{auth0Id}',  // MANTENER PARA COMPATIBILIDAD
      getByEmail: EnviromentHelper.URL_ITZ_WS + '/users/email/{email}',
    },
    periodos: {
      main: EnviromentHelper.URL_ITZ_WS + '/periodos',
      create: EnviromentHelper.URL_ITZ_WS + '/periodos', // POST
      getAll: EnviromentHelper.URL_ITZ_WS + '/periodos', // GET con filtros y paginación
      getById: EnviromentHelper.URL_ITZ_WS + '/periodos/', // GET /periodos/{id}
      update: EnviromentHelper.URL_ITZ_WS + '/periodos/', // PATCH /periodos/{id}
      delete: EnviromentHelper.URL_ITZ_WS + '/periodos/', // DELETE /periodos/{id}
      activar: EnviromentHelper.URL_ITZ_WS + '/periodos/', // PATCH /periodos/{id}/activar
      cerrar: EnviromentHelper.URL_ITZ_WS + '/periodos/', // PATCH /periodos/{id}/cerrar
    },
    cursos: {
      main: EnviromentHelper.URL_ITZ_WS + '/cursos',
      create: EnviromentHelper.URL_ITZ_WS + '/cursos', // POST
      getAll: EnviromentHelper.URL_ITZ_WS + '/cursos', // GET
      getById: EnviromentHelper.URL_ITZ_WS + '/cursos/', // GET /cursos/{id}
      update: EnviromentHelper.URL_ITZ_WS + '/cursos/', // PATCH /cursos/{id}
      delete: EnviromentHelper.URL_ITZ_WS + '/cursos/', // DELETE /cursos/{id}
      aprobar: EnviromentHelper.URL_ITZ_WS + '/cursos/', // PATCH /cursos/{id}/aprobar
      rechazar: EnviromentHelper.URL_ITZ_WS + '/cursos/', // PATCH /cursos/{id}/rechazar
      finalizar: EnviromentHelper.URL_ITZ_WS + '/cursos/', // PATCH /cursos/{id}/finalizar
      aprobarMultiples: EnviromentHelper.URL_ITZ_WS + '/cursos/cambiar-estatus', // PATCH /cursos/aprobar-multiples
      getCursosByUser: EnviromentHelper.URL_ITZ_WS + '/cursos/mis-cursos', // GET /cursos/mis-cursos
      cambiarEstadoDecursoJefe: EnviromentHelper.URL_ITZ_WS + '/cursos/cambiar-estatus-por-filtro',
      eliminarMultiples: EnviromentHelper.URL_ITZ_WS + '/cursos/eliminar-multiples',
      exportarPdf: EnviromentHelper.URL_ITZ_WS + '/cursos/exportar-pdf', // GET /cursos/exportar-pdf
      exportarExcel: EnviromentHelper.URL_ITZ_WS + '/cursos/exportar-excel', // GET /cursos/exportar-excel
      importarExcel: EnviromentHelper.URL_ITZ_WS + '/cursos/importar-excel', // POST /cursos/importar-excel
    },
    academias: {
      main: EnviromentHelper.URL_ITZ_WS + '/academias',
      create: EnviromentHelper.URL_ITZ_WS + '/academias', // POST
      getAll: EnviromentHelper.URL_ITZ_WS + '/academias', // GET
      getById: EnviromentHelper.URL_ITZ_WS + '/academias/', // GET /academias/{id}
      update: EnviromentHelper.URL_ITZ_WS + '/academias/', // PATCH /academias/{id}
      delete: EnviromentHelper.URL_ITZ_WS + '/academias/', // DELETE /academias/{id}
    },
    inscripciones: {
      main: EnviromentHelper.URL_ITZ_WS + '/inscripciones',
      create: EnviromentHelper.URL_ITZ_WS + '/inscripciones', // POST
      getAll: EnviromentHelper.URL_ITZ_WS + '/inscripciones', // GET
      getMine: EnviromentHelper.URL_ITZ_WS + '/inscripciones/mis-inscripciones', // GET
      getById: EnviromentHelper.URL_ITZ_WS + '/inscripciones/', // GET /inscripciones/{id}
      update: EnviromentHelper.URL_ITZ_WS + '/inscripciones/', // PATCH /inscripciones/{id}
      delete: EnviromentHelper.URL_ITZ_WS + '/inscripciones/', // DELETE /inscripciones/{id}
      aprobar: EnviromentHelper.URL_ITZ_WS + '/inscripciones/', // PATCH /inscripciones/{id}/aprobar
      reprobar: EnviromentHelper.URL_ITZ_WS + '/inscripciones/', // PATCH /inscripciones/{id}/reprobar
      cancelar: EnviromentHelper.URL_ITZ_WS + '/inscripciones/', // PATCH /inscripciones/{id}/cancelar
    },

  },
  name: 'PROD'
};
