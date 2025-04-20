import { Component, inject, OnInit } from '@angular/core';
import { AppContainerComponent } from '../../../layouts/app-container/app-container.component';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { FinanceService } from '../services/finance.service';
import {
  AlumnoMatriculadoDto,
  EstadoPago,
  PagosResDto,
  TipoPago,
  TipoPlanilla,
} from '../interfaces/alumno-matriculado.interface';
import { AlertService } from '../../../shared/services/alert.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AppInfoService } from '../../../shared/services/app-info.service';
import html2pdf from 'html2pdf.js';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PagoDetalle } from '../interfaces/alumno-pago.interface';
import { TipoPagoPipe } from '../../../shared/pipes/tipo-pago.pipe';

const imageUrl = '../../../../assets/logo2.png';

@Component({
  selector: 'app-pago-recibido',
  standalone: true,
  imports: [
    AppContainerComponent,
    DxDataGridModule,
    DxTextBoxModule,
    DxButtonModule,
    DxPopupModule,
    DxCheckBoxModule,
    DxTemplateModule,
    DxSelectBoxModule,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    DxTextAreaModule,
    TipoPagoPipe,
  ],
  templateUrl: './pago-recibido.component.html',
  styleUrl: './pago-recibido.component.scss',
})
export class PagoRecibidoComponent implements OnInit {

  term: string = '';
  allAlumns: AlumnoMatriculadoDto[] = [];
  alumns: AlumnoMatriculadoDto[] = [];
  selectedAlumn: AlumnoMatriculadoDto | null = null;
  logo = imageUrl;

  popupVisible: boolean = false;
  popupRecibidoVisible: boolean = false;

  pagosSource: PagosResDto[] = [];
  reciboDataSource: PagoDetalle[] = [];

  tipoPago = -1;
  numeroReferencia = '';
  tipoPagoItems: { text: string, value: number }[] = [];
  buttonPagoDisabled = true;

  today = new Date();

  readonly pagoForm: FormGroup;

  private readonly formBuilder = inject(FormBuilder);

  constructor(private financeService: FinanceService, private alertService: AlertService, public appInfo: AppInfoService ) {
    this.pagoForm = this.initPagoForm();
    this.initTipoPagoItems();

  }

  async ngOnInit(): Promise<void> {
    try {
      this.allAlumns = await this.loadAlumnosMatriculados();
    } catch (error) {
      this.handleError('Error al cargar alumnos', error);
    }
  }

  private initPagoForm() {
    return this.formBuilder.group({
      id: new FormControl(0),
      alumnId: new FormControl(0),
      cursoId: new FormControl(0),
      subTotal: new FormControl(0),
      total: new FormControl(0),
      descuento: new FormControl(0),
      isv: new FormControl(0),
      fechaPago: new FormControl(new Date()),
      referencia: new FormControl(''),
      numeroDocumento: new FormControl(''),
      cai: new FormControl(''),
      fechaLimite: new FormControl(null),
      rtnEmisor: new FormControl(''),
      rtnCliente: new FormControl(''),
      cliente: new FormControl(''),
      estado: new FormControl(0),
      tipoTransaccion: new FormControl(''),
      comentario: new FormControl(''),
      detalle: new FormControl<PagoDetalle[]>([]),
    });
  }

  private initTipoPagoItems(): void {
    this.tipoPagoItems = Object.keys(TipoPago)
      .filter(key => isNaN(Number(key)))
      .map(key => ({
        text: key,
        value: TipoPago[key as keyof typeof TipoPago]
      }));
  }

  private async loadAlumnosMatriculados(): Promise<AlumnoMatriculadoDto[]> {
    try {
      const res = await this.financeService.getAlumnosMatriculados();
      return res.data;
    } catch (error) {
      this.handleError('Error al cargar alumnos matriculados', error);
      return [];
    }
  }

  async loadAlumnoAndPagos(id: number): Promise<void> {
    try {
      this.selectedAlumn = (await this.financeService.getAlumnoMatriculadoById(id)).data;
      this.pagosSource = this.mapPagosToDisplayData(this.selectedAlumn.pagos);
    } catch (error) {
      this.handleError('Error al cargar datos del alumno', error);
    }
  }

  private mapPagosToDisplayData(pagos: PagosResDto[]): PagosResDto[] {
    return pagos.map(pago => ({
      ...pago,
      descripcion: TipoPlanilla[pago.tipoPlanilla],
      estado: pago.estado,
      seleccionado: false,
      accion: false,
    }));
  }

  async searchAlumn(): Promise<void> {
    const term = this.term.trim().toLowerCase();

    if (this.isEmptyOrWildcard(term)) {
      this.showAllAlumns();
      return;
    }

    this.alumns = this.findMatchingAlumns(term);
    this.handleSearchResults();
  }

  private isEmptyOrWildcard(term: string): boolean {
    return !term || term === '*';
  }
  private showAllAlumns(): void {
    this.alumns = [...this.allAlumns];
    this.selectedAlumn = null;
    this.popupVisible = true;
  }

  private findMatchingAlumns(term: string): AlumnoMatriculadoDto[] {
    return /^\d+$/.test(term)? this.findByNumericIdentifiers(term) : this.findByNameOrDni(term);
  }

  private findByNumericIdentifiers(term: string): AlumnoMatriculadoDto[] {
    const byId = this.allAlumns.filter(alumn => 
      alumn.id.toString().includes(term)
    );

    return byId.length > 0 ? byId : this.findByDni(term);
  }

  private findByDni(term: string): AlumnoMatriculadoDto[] {
    return this.allAlumns.filter(alumn =>
      (alumn.dni?.toLowerCase() || '').includes(term)
    );
  }

  private findByNameOrDni(term: string): AlumnoMatriculadoDto[] {
    return this.allAlumns.filter(alumn => {
      const fullName = alumn.fullName?.toLowerCase() || '';
      const dni = alumn.dni?.toLowerCase() || '';
      return fullName.includes(term) || dni.includes(term);
    });
  }

  private handleSearchResults(): void {
    const resultsCount = this.alumns.length;
  
    type ActionFunction = () => void | Promise<void>;
    
    const strategies: Record<number | string, ActionFunction> = {
      0: () => this.clearSelection(),
      1: () => this.selectSingleResult(),
      'default': () => this.showMultipleResults()
    };
    
    const action = strategies[resultsCount] !== undefined 
      ? strategies[resultsCount] 
      : strategies['default'];
      
    action();
  }

  private async selectSingleResult(): Promise<void> {
    const alumn = this.alumns[0];
    await this.loadAlumnoAndPagos(alumn.id);
    this.popupVisible = false;
  }

  private showMultipleResults(): void {
    this.selectedAlumn = null;
    this.popupVisible = true;
  }

  private clearSelection(): void {
    this.selectedAlumn = null;
  }

  private clearForm(): void{
    this.pagoForm.reset();
    this.reciboDataSource = [];
    this.tipoPago = -1;
    this.numeroReferencia = '';
  }

  onSelectAlumn(e: any): void {
    const alumnSelected = e.data;
    this.loadAlumnoAndPagos(alumnSelected.id);
    this.popupVisible = false;
  }

  customizeCurrencyDisplay = (cellInfo: any): string => {
    if (cellInfo.value) {
      const value = typeof cellInfo.value === 'string'
        ? parseFloat(cellInfo.value)
        : cellInfo.value;
        
      const formattedNumber = value.toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });      
      return `L. ${formattedNumber}`;
    }
    return '';
  };

  getNombreEstado = (rowData: any): string => {
    return EstadoPago[rowData.estado];
  }

  onShowPopup(): void {
    const seleccionados = this.pagosSource.filter(p => p.seleccionado);
    
    if (seleccionados.length === 0) {
      this.alertService.warning('No ha seleccionado ningún pago.');
      return;
    }
    
    this.reciboDataSource = this.generarReciboDataSource(seleccionados);    
    this.pagoForm.patchValue({
      alumnId: this.selectedAlumn?.id,
      cursoId: this.selectedAlumn?.cursoId
    });
    
    this.popupRecibidoVisible = true;
  }

  async confirmarPago(): Promise<void> {

    this.alertService.loading('Registrando pago...');
    this.popupRecibidoVisible = false;

    this.pagoForm.patchValue({
      fechaPago: new Date(),
      estado: EstadoPago.Pagado,
      subTotal: this.calcularTotalPagos(),
      total: this.calcularTotalFinal(),
      descuento: this.calcularDescuento(),
      detalle: this.reciboDataSource,
    });

    await this.financeService.createPago(this.pagoForm.value).then(res => {
        if (res.type === 200){
          this.alertService.loading('Pago registrado exitosamente.',3000);
          this.loadAlumnoAndPagos(this.selectedAlumn?.id || 0);
          this.clearForm();
          this.exportarReciboPDF(); 
        }else {
          this.alertService.warning('Error al registrar el pago');
        }          
      
      }).catch(error => {
        this.handleError('Error al registrar el pago', error);
      });

  }

  onPagoValidation(): boolean {
    if (this.tipoPago === 0) 
      return true;    
    
    if (this.tipoPago === 1 || this.tipoPago === 2) 
      return !!this.numeroReferencia;    
    
    return false;
  }

  obtenerPeriodo(pago: any): string {
    if (pago.descripcion.toLowerCase().includes('matrícula')) {
      return 'Año Escolar 2025';
    }

    const fechaLimite = pago.fechaLimite? new Date(pago.fechaLimite): new Date();
      
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    
    const mes = meses[fechaLimite.getMonth()];
    const año = fechaLimite.getFullYear();

    return `${mes} ${año}`;
  }

  calcularTotalPagos(): number {
    return this.reciboDataSource.reduce((total, p) => {
      const monto = Number(p.totalLinea) || 0;
      return total + monto;
    }, 0);
  }

  calcularDescuento(): number {
    return 0; 
  }

  calcularTotalFinal(): number {
    return this.calcularTotalPagos() - this.calcularDescuento();
  }

  private generarReciboDataSource(data: PagosResDto[]): PagoDetalle[] {
    const reciboDataSource: PagoDetalle[] = [];

    for (const pago of data) {
      reciboDataSource.push({
        id: pago.id,
        descripcion: pago.descripcion,
        tipoPlanilla: pago.tipoPlanilla,
        periodo: this.obtenerPeriodo(pago),
        totalLinea: pago.monto ?? 0,
        fecha: new Date(),
        alumnoId: this.selectedAlumn?.id || 0,
        cursoId: this.selectedAlumn?.cursoId || 0,
      });

      if (pago.montoTransporte) {
        reciboDataSource.push({
          id: reciboDataSource.length + 1,
          descripcion: 'Servicio de Transporte',
          tipoPlanilla: TipoPlanilla.Transporte,
          periodo: this.obtenerPeriodo(pago),
          totalLinea: pago.montoTransporte,
          fecha: new Date(),
          alumnoId: this.selectedAlumn?.id || 0,
          cursoId: this.selectedAlumn?.cursoId || 0,
        });
      }
    }    
    return reciboDataSource;
  }

  exportarReciboPDF(): void {
    const element = document.getElementById('recibo-pdf');
    if (!element) return;

    element.classList.add('printing-pdf');
    const pdfOptions = {
      margin: 0.5,
      filename: `recibo_${this.selectedAlumn?.fullName || 'alumno'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf().from(element).set(pdfOptions).save().then(() => {
        element.classList.remove('printing-pdf');
      });
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.alertService.warning(message);
  }
  
}
