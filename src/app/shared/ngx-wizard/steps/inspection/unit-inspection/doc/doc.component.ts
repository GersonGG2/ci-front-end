import { Component, OnInit } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkflowService } from 'src/app/shared/ngx-wizard/workflow/workflow.service';
import { ZoneDOCI } from 'src/app/shared/ngx-wizard/workflow/workflow.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Session } from 'src/app/helpers/session.service';
import { captureImage } from '../unit-inspection.component';

@Component({
  selector: 'app-doc',
  imports: [CommonModule, ReactiveFormsModule, NgbNavModule],
  templateUrl: './doc.component.html',
  styleUrls: ['../unit-inspection.component.scss']
})
export class DocComponent implements OnInit {
  id = '';

  pluginsForm = this.fb.group({
    vinPlate: ['Y'],
    circulationCard: ['Y'],
    verificationHologram: ['Y'],
    verificationDictum: ['Y'],
    importRequest: ['Y']
  });

  pluginsForm2 = this.fb.group({
    Luces: ['Y'],
    Marco: ['Y'],
    Llantas: ['Y'],
    Rines: ['Y'],
    Suspension: ['Y'],
    SistemaDeAire: ['Y'],
    Conexiones: ['Y'],
    Patines: ['Y'],
    Defensa: ['Y']
  });

  zoneDOCI = {} as ZoneDOCI;
  showPluginsForm = false;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private workflowService: WorkflowService, private toastr: ToastrService, private router: Router) { }

  async ngOnInit() {
    const currentRoute = this.router.url;
    this.showPluginsForm = currentRoute.includes('/quality-release/edit/unit-inspection/');

    this.id = this.route.snapshot.params?.['id'];
    this.zoneDOCI.headerId = Number(this.id);
    this.zoneDOCI.zoneType = 'DOC';
    this.getZonesDamages();
  }

  async getZonesDamages() {
    let response = await this.workflowService.getZonesDamages(this.zoneDOCI);
    if (!!response.data && !!response.data.zoneData) {
      const itemCode = response.data.headerData.itemCode;

      this.pluginsForm.patchValue({
        vinPlate: !!response.data.zoneData.docPlacaVin ? response.data.zoneData.docPlacaVin : 'N',
        circulationCard: !!response.data.zoneData.docTarjetaDeCirculacion ? response.data.zoneData.docTarjetaDeCirculacion : 'N',
        verificationHologram: !!response.data.zoneData.docHologrameDeVerificacion ? response.data.zoneData.docHologrameDeVerificacion : 'N',
        verificationDictum: !!response.data.zoneData.docDictamenDeVerificacion ? response.data.zoneData.docDictamenDeVerificacion : 'N',
        importRequest: !!response.data.zoneData.ocPedimientoDeImportacion ? response.data.zoneData.docPedimientoDeImportacion : 'N'
      });

      this.pluginsForm2.patchValue({
        Luces: !!response.data.zoneData.docLuces ? response.data.zoneData.docLuces : 'N',
        Marco: !!response.data.zoneData.docMarco ? response.data.zoneData.docMarco : 'N',
        Llantas: !!response.data.zoneData.docLlantas ? response.data.zoneData.docLlantas : 'N',
        Rines: !!response.data.zoneData.docRines ? response.data.zoneData.docRines : 'N',
        Suspension: !!response.data.zoneData.docSuspension ? response.data.zoneData.docSuspension : 'N',
        SistemaDeAire: !!response.data.zoneData.docSistemaDeAire ? response.data.zoneData.docSistemaDeAire : 'N',
        Conexiones: !!response.data.zoneData.docConexiones ? response.data.zoneData.docConexiones : 'N',
        Patines: !!response.data.zoneData.docPatines ? response.data.zoneData.docPatines : 'N',
        Defensa: !!response.data.zoneData.docDefensa ? response.data.zoneData.docDefensa : 'N'
      });

      this.initialState = this.getCurrentStateSnapshot();
      this.formInitialState = this.getFormStateSnapshot();

    } else {
      await this.savePlugins();
    }
  }

  async savePlugins(init: boolean = true) {

    // Si se está editando una inspección, no permitir guardar cambios
    if (Session.isViewInsp(this.id)) return;

    // Validar si hay cambios antes de guardar
    if (!this.hasChanges()) return;

    this.zoneDOCI.placaVin = this.pluginsForm.value.vinPlate;
    this.zoneDOCI.tarjetaDeCirculacion = this.pluginsForm.value.circulationCard;
    this.zoneDOCI.hologrameDeVerificacion = this.pluginsForm.value.verificationHologram;
    this.zoneDOCI.dictamenDeVerificacion = this.pluginsForm.value.verificationDictum;
    this.zoneDOCI.pedimientoDeImportacion = this.pluginsForm.value.importRequest;

    this.zoneDOCI.luces = this.pluginsForm2.value.Luces;
    this.zoneDOCI.marco = this.pluginsForm2.value.Marco;
    this.zoneDOCI.llantas = this.pluginsForm2.value.Llantas;
    this.zoneDOCI.rines = this.pluginsForm2.value.Rines;
    this.zoneDOCI.suspension = this.pluginsForm2.value.Suspension;
    this.zoneDOCI.sistemaDeAire = this.pluginsForm2.value.SistemaDeAire;
    this.zoneDOCI.conexiones = this.pluginsForm2.value.Conexiones;
    this.zoneDOCI.patines = this.pluginsForm2.value.Patines;
    this.zoneDOCI.defensa = this.pluginsForm2.value.Defensa;
    this.zoneDOCI.allDanos = [];

    let response = await this.workflowService.patchZonesDamages(this.zoneDOCI);
    this.initialState = this.getCurrentStateSnapshot();
    this.formInitialState = this.getFormStateSnapshot();

    if (!!response.data) {
      if (init) this.ngOnInit();
      this.toastr.success('Guardado correcto de la información.', 'Éxito');
    } else {
      this.toastr.error(response.error.error.error, 'Error');
    }
  }

  private initialState: any;
  private formInitialState: any;

  private getFormStateSnapshot() {
    return JSON.stringify({
      pluginsForm: this.pluginsForm.value,
      pluginsForm2: this.pluginsForm2.value
    });
  }

  private getCurrentStateSnapshot() {
    return JSON.stringify({
      zoneDOCI: this.zoneDOCI
    });
  }

  hasChanges(): boolean {
    const currentFormState = this.getFormStateSnapshot();
    const formChanged = currentFormState !== this.formInitialState;

    const current = this.getCurrentStateSnapshot();
    const zoneChanged = current !== this.initialState;

    return formChanged || zoneChanged;
  }

}
