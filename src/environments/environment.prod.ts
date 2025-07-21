import { AuthConfig } from '@auth0/auth0-angular/lib/auth.config';

export class EnviromentHelper {
  public static URL_INSPECTIONS_WS = 'https://dyinspecws.tipmexico.com/dyinspectionws';
  public static URL_CATALOG_WS = 'https://dycatws.tipmexico.com/dycatalogws';
  public static URL_CONFIGURATION_WS = 'https://dyconfws.tipmexico.com/dyconfigurationws';
  public static URL_HUMANRESOURCES_WS = 'https://dyhrws.tipmexico.com/dyhumanresourcesws';
  public static URL_ENTRIES_WS = 'https://dyentryws.tipmexico.com/dyentryws';
  public static URL_WORK_ORDERS_WS = 'https://dywkordrws.tipmexico.com/dyworkorderws';
  public static URL_FILES_WS = 'https://dyfilews.tipmexico.com/dyfilews';
  public static URL_FLEETS = 'https://dyfleetws.tipmexico.com/dyfleetws';
  public static URL_SECURITY_WS = 'https://dysecws.tipmexico.com/dysecurityws';
  public static URL_NOTIFICATION_WS = 'https://dynotifwsdev.tipmexico.com/dynotificationws';
  public static URL_PRODUCTIVITY_WS = 'https://dypdtvtwsdev.tipmexico.com/dyproductivityws';
  public static URL_REPORT_WS = 'https://dyrptwsdev.tipmexico.com/dyreportws';

  public static readonly AUTH: AuthConfig = {
    domain: 'auth.tipmexico.com',
    clientId: 'yYFuxMr7Pzolju2qlwHrmNf2AYU8jjds',
    authorizationParams: {
      audience: 'dywsdev-tip-api',
      organization: 'org_N2LNYF51RLpOBEt8',
      redirect_uri: window.location.origin
    }
  };

  public static readonly AUTH_CALLBACK = 'https://dywa.tipmexico.com/';
}

export const environment = {
  tip: {
    inspections: {
      main: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections',
      processStart: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/',
      preloadForm: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/pre-load-form-data',
      excel: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/excel',
      damages: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/',
      damageDetail: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/detail/damage/',
      clone: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/clone',
      finish: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/finish',
      bindPreInspection: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/preinspection',
      clonePreInspection: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/clone-preinspection',
      exelInspection: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/excel',
      createDelivery: EnviromentHelper.URL_INSPECTIONS_WS + '/inspections/create-delivery'
    },
    catalog: {
      items: EnviromentHelper.URL_CATALOG_WS + '/catalog/items',
      misc: EnviromentHelper.URL_CATALOG_WS + '/catalog/misc',
      miscPOST: EnviromentHelper.URL_CATALOG_WS + '/catalog/misc',
      miscDelete: EnviromentHelper.URL_CATALOG_WS + '/catalog/misc',
      substitutes: EnviromentHelper.URL_CATALOG_WS + '/catalog/substitutes',
      substitutesPOST: EnviromentHelper.URL_CATALOG_WS + '/catalog/substitutes',
      substitutesDelete: EnviromentHelper.URL_CATALOG_WS + '/catalog/substitutes',
      zones: EnviromentHelper.URL_CATALOG_WS + '/catalog/zones',
      zonesExport: EnviromentHelper.URL_CATALOG_WS + '/catalog/zones/export-excel',
      zonesActivityExport: EnviromentHelper.URL_CATALOG_WS + '/catalog/download/excel',
      zonesActivity: EnviromentHelper.URL_CATALOG_WS + '/catalog/zone',
      zonesDelete: EnviromentHelper.URL_CATALOG_WS + '/catalog/zones',
      subs: EnviromentHelper.URL_CATALOG_WS + '/catalog/subs',
      requestGet: EnviromentHelper.URL_CATALOG_WS + '/catalog/request',
      requestPost: EnviromentHelper.URL_CATALOG_WS + '/catalog/request',
      requestPut: EnviromentHelper.URL_CATALOG_WS + '/catalog/request',
      requestGetData: EnviromentHelper.URL_CATALOG_WS + '/catalog/request',
      requestDelete: EnviromentHelper.URL_CATALOG_WS + '/catalog/request'
    },
    configuration: {
      ecoList: EnviromentHelper.URL_CONFIGURATION_WS + '/api/eco_list',
      moduleList: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_module_list',
      moduleCreate: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_module_create',
      moduleDelete: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_module_delete',
      pageList: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_page_list',
      pageCreate: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_page_store',
      pageUpdate: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_page_update',
      pageDelete: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_page_delete',
      menuList: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_menu_list',
      menuListDetail: EnviromentHelper.URL_CONFIGURATION_WS + '/api/pre-load-form-data',
      menuCreate: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_menu_store',
      menuUpdate: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_menu_update',
      menuDelete: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_menu_delete',
      docRejectedList: EnviromentHelper.URL_CONFIGURATION_WS + '/document/rejected-list',
      docRejectedPost: EnviromentHelper.URL_CONFIGURATION_WS + '/document/rejected',
      docRejectedDelete: EnviromentHelper.URL_CONFIGURATION_WS + '/document/rejected',
      docList: EnviromentHelper.URL_CONFIGURATION_WS + '/document/find-all',
      docCreate: EnviromentHelper.URL_CONFIGURATION_WS + '/document/add-document',
      docUpdate: EnviromentHelper.URL_CONFIGURATION_WS + '/document/add-document',
      docSetList: EnviromentHelper.URL_CONFIGURATION_WS + '/document-set/find-all',
      docSetPreFormData: EnviromentHelper.URL_CONFIGURATION_WS + '/document-set/pre-form-data',
      docPreLoadData: EnviromentHelper.URL_CONFIGURATION_WS + '/document/pre-load-form-data',
      docSetCreate: EnviromentHelper.URL_CONFIGURATION_WS + '/document-set/add-document-set',
      simpleUserExportExcel: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_simple_user_export_excel',
      simpleUserDelete: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_simple_user_delete',
      simpleUserCreate: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_simple_user_store',
      simpleUserUpdate: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_simple_user_update',
      simpleUserList: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_simple_user_list',
      simpleUserListPreLoadData: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_simple_user_preform',
      userList: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_user_list',
      userListData: EnviromentHelper.URL_CONFIGURATION_WS + '/api/pre-form-data',
      userCreate: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_user_store',
      userUpdate: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_user_update',
      userDelete: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_user_delete',
      userExportExel: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_user_export-excel',
      configList: EnviromentHelper.URL_CONFIGURATION_WS + '/config-list',
      configListData: EnviromentHelper.URL_CONFIGURATION_WS + '/config-list/pre-load-form-data',
      configListCreate: EnviromentHelper.URL_CONFIGURATION_WS + '/config-list',
      configListUpdated: EnviromentHelper.URL_CONFIGURATION_WS + '/config-list',
      configListDelete: EnviromentHelper.URL_CONFIGURATION_WS + '/config-list',
      sysSelectLov: EnviromentHelper.URL_CONFIGURATION_WS + '/api/sys_select_lov',
      ecoTire: EnviromentHelper.URL_CONFIGURATION_WS + '/api/eco_tyre',
      deleteDocument: EnviromentHelper.URL_CONFIGURATION_WS + '/document/delete-document'
    },
    humanresourcesws: {
      department: EnviromentHelper.URL_HUMANRESOURCES_WS + '/humanresources/department',
      departments: EnviromentHelper.URL_HUMANRESOURCES_WS + '/humanresources/departments',
      jobs: EnviromentHelper.URL_HUMANRESOURCES_WS + '/humanresources/jobs',
      jobsPOST: EnviromentHelper.URL_HUMANRESOURCES_WS + '/humanresources/jobs',
      employees: EnviromentHelper.URL_HUMANRESOURCES_WS + '/humanresources/employees',
      employeesPost: EnviromentHelper.URL_HUMANRESOURCES_WS + '/humanresources/employees'
    },
    entries: {
      branchCount: EnviromentHelper.URL_ENTRIES_WS + '/entry/branch-count',
      main: EnviromentHelper.URL_ENTRIES_WS + '/entry',
      preloadForm: EnviromentHelper.URL_ENTRIES_WS + '/entry/load-pre-form-data',
      customerData: EnviromentHelper.URL_ENTRIES_WS + '/entry/do-fetch-customer-data',
      transactionlist: EnviromentHelper.URL_ENTRIES_WS + '/transaction/de-transaction-list',
      transactionDownloadFiles: EnviromentHelper.URL_ENTRIES_WS + '/transaction/de-transaction-list',
      transactionExportExcel: EnviromentHelper.URL_ENTRIES_WS + '/transaction/export-excel',
      transactionlistCancel: EnviromentHelper.URL_ENTRIES_WS + '/transaction/cancel-orders',
      transactionlistConfirmOrdes: EnviromentHelper.URL_ENTRIES_WS + '/transaction/confirm-orders',
      activationList: EnviromentHelper.URL_ENTRIES_WS + '/activation',
      activationImport: EnviromentHelper.URL_ENTRIES_WS + '/activation/import-activation-data',
      activationExport: EnviromentHelper.URL_ENTRIES_WS + '/activation/export',
      deliveryList: EnviromentHelper.URL_ENTRIES_WS + '/delivery',
      deliveryPost: EnviromentHelper.URL_ENTRIES_WS + '/delivery',
      deliveryStatusGet: EnviromentHelper.URL_ENTRIES_WS + '/delivery/check-status',
      deliveryImport: EnviromentHelper.URL_ENTRIES_WS + '/delivery/import-delivery-data',
      carrierUpdatePost: EnviromentHelper.URL_ENTRIES_WS + '/delivery/update-carrier-signature',
      deliveryClientList: EnviromentHelper.URL_ENTRIES_WS + '/delivery-client',
      reservations: EnviromentHelper.URL_ENTRIES_WS + '/reservation',
      reservationPost: EnviromentHelper.URL_ENTRIES_WS + '/reservation',
      reservationImport: EnviromentHelper.URL_ENTRIES_WS + '/reservation/import-reservation-data',
      reservationConfirmUnits: EnviromentHelper.URL_ENTRIES_WS + '/reservation/reservation-document-bulk-rows',
      preFormData: EnviromentHelper.URL_ENTRIES_WS + '/delivery/load-pre-form-data',
      carrierDetails: EnviromentHelper.URL_ENTRIES_WS + '/delivery/carrier-details',
      deliveryCheckStatus: EnviromentHelper.URL_ENTRIES_WS + '/delivery/check-status',
      reservationCheckStatus: EnviromentHelper.URL_ENTRIES_WS + '/reservation/${id}/check-status',
      deliverySaveDocumentData: EnviromentHelper.URL_ENTRIES_WS + '/delivery/save-document-data',
      updateProcessStatus: EnviromentHelper.URL_ENTRIES_WS + '/delivery/update-in-process-status'
    },
    fleets: {
      // Rebill Status
      rebillStatus: EnviromentHelper.URL_FLEETS + '/rebill-status/findAll',
      deleteRebillStatus: EnviromentHelper.URL_FLEETS + '/rebill-status/delete',
      importData: EnviromentHelper.URL_FLEETS + '/rebill-status/import-excel',
      exportData: EnviromentHelper.URL_FLEETS + '/rebill-status/export',
      // Informe de robos
      theftReports: EnviromentHelper.URL_FLEETS + '/theft1/list',
      exportReport: EnviromentHelper.URL_FLEETS + '/theft1/export',
      deleteTheftReport: EnviromentHelper.URL_FLEETS + '/theft1',
      // Diario
      daily: EnviromentHelper.URL_FLEETS + '/daily/list',
      // Veirificaciones
      verifications: EnviromentHelper.URL_FLEETS + '/verify1/findAll',
      verificationsExport: EnviromentHelper.URL_FLEETS + '/verify1/export',
      insertVerification: EnviromentHelper.URL_FLEETS + '/catalog/request',
      deleteVerification: EnviromentHelper.URL_FLEETS + '/verify1',
      //WIP
      priorities: EnviromentHelper.URL_FLEETS + '/priority/findAll',
      excelPriorities: EnviromentHelper.URL_FLEETS + '/priority/export',
      updatePriority: EnviromentHelper.URL_FLEETS + '/priority/update-priority-code',
      updateOdtFlagPriority: EnviromentHelper.URL_FLEETS + '/priority/update-odt-flag'
    },
    productivity: {
      // Weekly endpoints
      weekly: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal/list',
      weeklyPreFormData: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal/pre-form-data/{id}',
      updateProductivity: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal',
      saveWeekly: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal',
      updateGlobalWeekly: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal/update-global',
      updatePersonWeekly: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal/update-person',
      exportWeekly: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal/export',
      importWeekly: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal/import-productivity-data',
      getWorkHours: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal/pre-form-data',
      fectchWorkhoursDetailWeekly: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal/fetch-workhours-detail',
      // Person endpoints
      persons: EnviromentHelper.URL_PRODUCTIVITY_WS + '/por-persona/list',
      exportPersons: EnviromentHelper.URL_PRODUCTIVITY_WS + '/por-persona/export',
      person: EnviromentHelper.URL_PRODUCTIVITY_WS + '/por-persona/list',
      // Team endpoints
      team: EnviromentHelper.URL_PRODUCTIVITY_WS + '/por-equipo/list',
      teamDetailHours: EnviromentHelper.URL_PRODUCTIVITY_WS + '/por-equipo/detalle-horas',
      teamExport: EnviromentHelper.URL_PRODUCTIVITY_WS + '/por-equipo/export',
      teams: EnviromentHelper.URL_PRODUCTIVITY_WS + '/teams/findAll',
      teamsPreFormData: EnviromentHelper.URL_PRODUCTIVITY_WS + '/teams/pre-form-data/{id}',
      createTeam: EnviromentHelper.URL_PRODUCTIVITY_WS + '/teams',
      editTeam: EnviromentHelper.URL_PRODUCTIVITY_WS + '/teams',
      deleteTeam: EnviromentHelper.URL_PRODUCTIVITY_WS + '/teams',
      removeMemberTeam: EnviromentHelper.URL_PRODUCTIVITY_WS + '/teams/remove-member',
      teamMembers: EnviromentHelper.URL_PRODUCTIVITY_WS + '/teams/{id}/members',
      updateTeamMembers: EnviromentHelper.URL_PRODUCTIVITY_WS + '/teams/update-team',
      // Profile endpoints
      perfil: EnviromentHelper.URL_PRODUCTIVITY_WS + '/profile',
      createPerfil: EnviromentHelper.URL_PRODUCTIVITY_WS + '/profile',
      updatePerfil: EnviromentHelper.URL_PRODUCTIVITY_WS + '/profile',
      deletePerfil: EnviromentHelper.URL_PRODUCTIVITY_WS + '/profile/delete-members',
      perfilPreFormData: EnviromentHelper.URL_PRODUCTIVITY_WS + '/profile/pre-form-data',
      // Otros endpoints que podrían ser útiles
      sendMessage: EnviromentHelper.URL_PRODUCTIVITY_WS + '/test/greeting', // Reasignado a test/greeting
      importData: EnviromentHelper.URL_PRODUCTIVITY_WS + '/prod-semanal' // Asumiendo que puede usarse para importación
    },
    reports: {
      // report
      report: EnviromentHelper.URL_REPORT_WS + '/report/list',
      exportReport: EnviromentHelper.URL_REPORT_WS + '/report/export',
      reportList: EnviromentHelper.URL_REPORT_WS + '/flota/dy_delivered_flota_list',
      exportFleetToExcel: EnviromentHelper.URL_REPORT_WS + '/flota/excel'
    },
    workOrders: {
      planList: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/list',
      planReceiptDetails: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/receipt-details/',
      planDetail: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/fetch-line-details',
      planAddLine: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/add-line',
      planDeleteLine: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/line/',
      planStatusLine: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/line-status',
      planData: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/fetch-line-data',
      planHeaderData: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/header-fetch-data',
      planAssignHeaderTeam: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/assign-header-team',
      planDispatchDetail: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/dispatch-line-data',
      planCreateAdditional: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/create-additional',
      planCheckOnHand: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/check-onhand',
      planPrint: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/plan-print',
      planLogStatusUpdate: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/log-status-update',
      planRevertProcess: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/revert-process',
      planEndProcess: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/process-end',
      planQuantityTeam: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/qty-team-data',
      planSaveQuantityTeam: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/save-qty-team-data',
      planDispatchCreateReceipt: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/dispatch-create-receipt',
      planDispatchEndReceipt: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/dispatch-end-receipt',
      planDispatchViewReceipt: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/dispatch-view-receipt',
      planDispatchPrint: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/plan-dispatch-print?headerId={0}&rcvHeaderId={1}',
      planSaveDispatchLineData: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/save-dispatch-line-data',
      planSwap: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/substitute-swap',
      planExportActivity: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/plan_excel_activity',
      receiptList: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt/list',
      receiptDetail: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt/dispatch-line-data',
      receiptSaveLineData: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt/receipt-save-line-data',
      receiptExportExcel: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt/excel',
      receiptUpdateStatus: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt/update-status',
      receiptMiscList: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt-misc/list',
      receiptMiscPreLoadFormData: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt-misc/pre-load-form-data',
      receiptMiscSaveDispatchLines: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt-misc/save-dispatch-lines',
      receiptMiscSavelineData: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt-misc/save-line-data',
      receiptMiscStore: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt-misc/store',
      receiptMiscDetail: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt-misc/line-data',
      miscReceiptApprove: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt-misc/update-status',
      receiptReissue: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt-reissue/list',
      receiptReissueDetail: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt-reissue/line-data',
      receiptReissueLine: EnviromentHelper.URL_WORK_ORDERS_WS + '/receipt-reissue/line',
      receiptBranchUpdate: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/update-branch',
      loadPreform: EnviromentHelper.URL_WORK_ORDERS_WS + '/plan/load-preform-data'
    },
    files: {
      file: EnviromentHelper.URL_FILES_WS + '/file',
      deleteFile: EnviromentHelper.URL_FILES_WS + '/file/delete'
    },
    security: {
      userByEmail: EnviromentHelper.URL_SECURITY_WS + '/authz/users/email/{email}',
      userByEmailAuth0: EnviromentHelper.URL_SECURITY_WS + '/users/{email}/{auth0}',
      auth0: {
        create: EnviromentHelper.URL_SECURITY_WS + '/authz/users',
        block: EnviromentHelper.URL_SECURITY_WS + '/authz/users/{auth0Id}/block',
        byEmail: EnviromentHelper.URL_SECURITY_WS + '/authz/users/email/{email}',
        saveRole: EnviromentHelper.URL_SECURITY_WS + '/authz/roles',
        roles: EnviromentHelper.URL_SECURITY_WS + '/authz/roles'
      }
    },
    notifications: {
      sendMail: EnviromentHelper.URL_NOTIFICATION_WS + '/email/send',
      createNotification: EnviromentHelper.URL_NOTIFICATION_WS + '/notifications',
      getNotifications: EnviromentHelper.URL_NOTIFICATION_WS + '/notifications',
      getNotificationById: EnviromentHelper.URL_NOTIFICATION_WS + '/notifications/{id}',
      updateNotification: EnviromentHelper.URL_NOTIFICATION_WS + '/notifications/{id}',
      deleteNotification: EnviromentHelper.URL_NOTIFICATION_WS + '/notifications/{id}'
    }
  },
  name: 'PROD'
};
