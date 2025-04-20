import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { AppContainerComponent } from '../../../layouts/app-container/app-container.component';
import {
  DxDataGridModule,
  DxFileUploaderModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { Alumno } from '../interfaces/alumn.interface';
import { RegisterService } from '../services/register.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../shared/services/alert.service';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxButtonModule, DxButtonTypes } from 'devextreme-angular/ui/button';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { CommonModule } from '@angular/common';

export const DEFAULT_LAT = 14.085028;
export const DEFAULT_LON = -87.199685;

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-transport',
  standalone: true,
  imports: [
    CommonModule,
    AppContainerComponent,
    DxDataGridModule,
    DxPopupModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxNumberBoxModule,
    DxFileUploaderModule,
    DxButtonModule
  ],
  templateUrl: './transport.component.html',
  styleUrl: './transport.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransportComponent implements OnInit  {
  dataSource: Array<Alumno> = [];
  popupVisible: boolean = false;
  tipoViajeSource: string[] = [
    'Ida y vuelta',
    'Solo ida',
    'Solo regreso'];
    fileValue: any[] = [];  

  readonly transportForm = inject(FormBuilder).group({
    id: new FormControl(0),
    alumnId: new FormControl(0, [Validators.required]),
    address: new FormControl('', [Validators.required]),
    typeTrip: new FormControl(''),
    fare: new FormControl(0, [Validators.required]),
    lat: new FormControl(''),
    lng: new FormControl(''),
    sketch: new FormControl(''),
  });

  private map:any;
  private marker:any;
   lat: number = DEFAULT_LAT;
   lon: number = DEFAULT_LON;
  alumns: Alumno[] = [];
  popupWidth: number = 760;
  popupHeight: number = 760;

  customCurrencyFormat = {
    type: 'currency',
    currency: 'HNL',
    precision: 2,
    currencySymbol: 'L', 
    useGrouping: true,
    formatter: (value:any) => {
      if (value === null || value === undefined) return '';    
      return `L ${value.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    }
  }; 

  constructor(
    private service: RegisterService,  private _alert: AlertService, private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this._alert.loading('Cargando registros');
    await this.service.getAlumns().then((response) => { 
      this.alumns = response.data;
    });

    this.getDataGrid();
   await this._alert.close();
    
  }

  @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
    this.initializePopupSize();
  }

  initializePopupSize() {
    const screenWidth = window.innerWidth;
    
    if (screenWidth <= 576) {
      this.popupWidth = screenWidth * 0.95;
      this.popupHeight = 480;
    } else if (screenWidth <= 768) {
      this.popupWidth = screenWidth * 0.8;
      this.popupHeight = 520;
    } else {
      this.popupWidth = 560;
      this.popupHeight = 560;
    }
  }

  async getDataGrid(): Promise<void> {
    await this.service.getTransporteAlumno().then((response) => {
      this.dataSource = [...response.data
      ];
      this.cdr.detectChanges();
    });
  }

  async onClickCroquis():Promise<void> {
    const croquisName = this.transportForm.get('sketch')?.value;
    if (!croquisName) {
      return;
    }
  
    try {
      const response = await this.service.getCroquisFile(croquisName);
      const contentType = response.headers.get('Content-Type'); 
      const blob = new Blob([response.body], { type: contentType });
      const url = window.URL.createObjectURL(blob);
  
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
  
    } catch (err) {
      this._alert.warning('Error al obtener el archivo');
    }


  }

  onEdit(data: any): void {
    this.transportForm.patchValue({
      id: data.id,
      alumnId: data.alumno.id,
      address: data.address,
      fare: data.fare,
      lat: data.lat,
      lng: data.lng,
      typeTrip: data.typeTrip,
      sketch: data.sketch,
    });
    this.lon = data.lng;
    this.lat = data.lat;
    this.popupVisible = true;
    this.cdr.detectChanges();
    this.configMap();
  }

  onAdd() {
    this.initializePopupSize();
    this.popupVisible = true;
    this.cdr.detectChanges(); 
    this.configMap();
  }

  onEnrollSave(): void {
    if (this.transportForm.invalid) {
      return;
    }
    if(this.transportForm.value.fare === 0){
      return;
    }
    this.popupVisible = false;
    this.cdr.detectChanges();
    this._alert.loading('Guardando registro...');  
    const data = this.transportForm.value;
    const promise = data.id === 0 ? this.service.postTransporteAlumno(data, this.fileValue) : this.service.putTransporteAlumno(data, this.fileValue);
    
    promise.then(() => {
      this.getDataGrid();
      this._alert.close();
    }).catch((err) => {
      this._alert.warning(err.error.Message);
    });
  }

  bookButtonOptions: DxButtonTypes.Properties = {
    width: '100%',
    text: 'Guardar',
    type: 'default',
    stylingMode: 'contained',
    disabled: false,
    onClick: () => this.onEnrollSave(),
  };

  get isButtonDisabled(): boolean {
    return !this.transportForm.valid;
  }

  get computedBookButtonOptions(): DxButtonTypes.Properties {
    return {
      ...this.bookButtonOptions,
      disabled: this.isButtonDisabled
    };
  }

  configMap() { 
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.map = L.map('map').setView([this.lat, this.lon], 13);

    const openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: ''
    });

    const labelsLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri'
    });

    const baseLayers = {
      "Mapa": openStreetMapLayer,
      "Satélite": satelliteLayer
    };

    openStreetMapLayer.addTo(this.map);

    L.control.layers(baseLayers).addTo(this.map);
    

    this.marker = L.marker([this.lat, this.lon], {
      draggable: true
    }).addTo(this.map);

    this.marker.on('dragend', (event:any) => {
      const position = this.marker.getLatLng();

      this.transportForm.patchValue({
        lat: position.lat.toString(),
        lng: position.lng.toString()
      });
    });

  }

  displayFullName = (alumn: any) => {
    if (!alumn) return '';
    return `${alumn.firstName} ${alumn.secondName || ''} ${alumn.lastName} ${alumn.secondLastName || ''}`.trim();
  }

  onToolbarPreparing(event: any): void {
    const { items } = event.toolbarOptions;
    const addButton = {
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'add',
        text: 'Agregar',
        hint: 'Agregar',
        type: 'normal',
        elementAttr: { id: 'agregarRegistros' },
        stylingMode: 'contained',
        onClick: () => this.onAdd(),
      },
    };

    items.unshift(addButton);
  }

  Columns: any[] = [
    { dataField: 'alumno.id', caption: 'Código', width: 100, allowEditing: false },
    {
      dataField: 'alumno.fullName',
      caption: 'Nombre',
      width: 350,
      allowEditing: false
    },
    { dataField: 'address', caption: 'Dirección', allowEditing: false },
    { dataField: 'fare', caption: 'Tarifa', width: 140, allowEditing: false, 
      customizeText: function(cellInfo: any) {
        return "L. " + cellInfo.value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    },
    {
      type: 'buttons',
      caption: 'Acciones',
      buttons: [
        {
          icon: 'edit', 
          hint: 'Editar', 
          onClick: (e: any) => {
            this.onEdit(e.row.data);
          },
        },
      ],
    },
  ];  
}
