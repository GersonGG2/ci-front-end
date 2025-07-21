export const STEPS = {
  information: 'information',
  inspection: 'inspection',
  inspectionSheet: 'inspection-sheet',
  finish: 'finish'
};

export interface ZoneFREI {
  zoneType: string;
  headerId: number;
  placaVin: string;
  kmAbs: string;
  comments: string;
  numeroOcultos: string;
  allDanos: DanioI[];
  imgZoneDano: string;
  fileSource: any[];
  fileSourceHiddenNumber: any[];
  fileSourcePlateNumber: any[];
  imagesDeleted: [];
  imagesDeletedHiddenNumber: [];
  imagesDeletedPlateNumber: [];
}

export interface ZoneCII {
  zoneType: string;
  headerId: number;
  manivela: string;
  numeroOcultos: string;
  portllantas: string;
  comments: string;
  allDanos: DanioI[];
  imgZoneDano: string;
  fileSource: any[];
  fileSourceHiddenNumber: any[];
  imagesDeleted: [];
  imagesDeletedHiddenNumber: [];
}

export interface ZoneTRAI {
  zoneType: string;
  headerId: number;
  rearType: string;
  placaCirculacion: string;
  placa: string;
  comments: string;
  placaDeVin: string;
  numeroOcultos: string;
  allDanos: DanioI[];
  imgZoneDano: string;
  fileSource: any[];
  fileSourceHiddenNumber: any[];
  fileSourcePlateVinNumber: any[];
  fileSourcePlateNumber: any[];
  imagesDeleted: [];
  imagesDeletedHiddenNumber: [];
  imagesDeletedPlateVinNumber: [];
  imagesDeletedPlateNumber: [];
}

export interface ZoneINTI {
  zoneType: string;
  headerId: number;
  observacions: string;
  numeroOcultos: string;
  allDanos: DanioI[];
  imgZoneDano: string;
  fileSource: any[];
  fileSourceHiddenNumber: any[];
  imagesDeleted: [];
  imagesDeletedHiddenNumber: [];
}

export interface ZoneCDI {
  zoneType: string;
  headerId: number;
  observacions: string;
  numeroOcultos: string;
  allDanos: DanioI[];
  imgZoneDano: string;
  fileSource: any[];
  fileSourceHiddenNumber: any[];
  imagesDeleted: [];
  imagesDeletedHiddenNumber: [];
}

export interface ZoneINFI {
  zoneType: string;
  headerId: number;
  espigaType: string;
  patinesType: string;
  eje1: string;
  eje2: string;
  comments: string;
  numeroOcultos: string;
  allDanos: DanioI[];
  imgZoneDano: string;
  fileSource: any[];
  fileSourceHiddenNumber: any[];
  imagesDeleted: [];
  imagesDeletedHiddenNumber: [];
}

export interface ZoneTOLI {
  zoneType: string;
  headerId: number;
  observacions: string;
  numeroOcultos: string;
  allDanos: DanioI[];
  imgZoneDano: string;
  fileSource: any[];
  fileSourceHiddenNumber: any[];
  imagesDeleted: [];
  imagesDeletedHiddenNumber: [];
}

export interface ZoneDOCI {
  zoneType: string;
  headerId: number;
  placaVin: string;
  docVin: null;
  tarjetaDeCirculacion: string;
  hologrameDeVerificacion: string;
  dictamenDeVerificacion: string;
  pedimientoDeImportacion: string;
  luces: string;
  marco: string;
  llantas: string;
  rines: string;
  suspension: string;
  sistemaDeAire: string;
  conexiones: string;
  patines: string;
  defensa: string;
  all_danos: DanioI[];
  allDanos: DanioI[];
  numeroOcultos: string;
}

export interface ZoneLLI {
  zoneType: string;
  headerId: number;

  insTipo: string;
  insEco: string;
  insDot: string;
  insMarca: string;
  insModelo: string;
  insMedidas: string;
  insRenovados: string;
  insCondicion: string;
  val1321: string;
  val1322: string;

  comments: string;

  allDanos: DanioI[];
}

export interface DanioI {
  id: number;
  dano_type: string;
  zone_type: string;
  dano_order: number;
  header_id: string;
  recordExist: boolean;
  x: number;
  y: number;
  r: number;
  c: number;
  rearType: string;
  user: number;
  date: string;
}

export interface DamageDetailI {
  uploadFiles: [
    {
      url: string;
    }
  ];
  //action: string;
  damages: DanioI[];
  entries: EntryI[];
  fileSource: any[];
  imagesDeletes: [];
  detail: {
    danoOrder: number; //dano_order
    danoType: string; //dano_type
    headerId: number; //header_id
    x: number;
    y: number;
    zoneType: string; //zone_type
  };
  deletedEntries: DeletedEntryI[];
  imgZoneDano: string;
}

export interface DeletedEntryI {
  id: number;
  reason: string;
}

export interface EntryI {
  id: number;
  quantity: number;
  comments: string;
  danoCondition: string;
  failure: {
    //falla
    id: number; //listValueId
    value: string; //meaning
    list_code: string; //listCode
  };
  images: [];
  images_deleted: [];
  serial: {
    code: string; //itemCode
    description: string; //itemDescription
    assemblyItemId: number; //assemblyItemId
    workforce: string; //workforce
    zoneName: string;
  };
  zone: ZoneI;
}

export interface ZoneI {
  zoneName: string;
  itemCode: string;
  zoneArea: string;
  zoneId: number;
  zoneType: string;
  //zoneSubtype	null
}

export interface SysSelectLovI {
  module: string;
  params: {
    searchValue: string;
    page: number;
    limit: number;
    sort: string;
    order: string;
  };
  otherParams: {
    zoneType: string;
    zoneName: string;
    itemCode: string;
  };
}
