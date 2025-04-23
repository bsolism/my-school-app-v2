import { Component, inject, OnInit } from '@angular/core';
import { AppContainerComponent } from '../../../layouts/app-container/app-container.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDateRangeBoxModule, DxNumberBoxModule, DxSelectBoxModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { CourseService } from '../services/course.service';
import { Course, CursoMatricula } from '../../interfaces/course.interface';
import { AlertService } from '../../../shared/services/alert.service';
import { FormBaseComponent } from '../../../shared/components/form-base/form-base.component';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-matricula-definicion',
  standalone: true,
  imports: [AppContainerComponent, CommonModule, FormsModule, ReactiveFormsModule,
     DxCheckBoxModule, DxTextBoxModule, DxNumberBoxModule,DxButtonModule, DxDataGridModule,
     DxDateBoxModule,DxValidatorModule, DxDateRangeBoxModule, DxSelectBoxModule
  ],
  templateUrl: './matricula-definicion.component.html',
  styleUrl: './matricula-definicion.component.scss'
})
export class MatriculaDefinicionComponent extends FormBaseComponent implements OnInit {
  defaultDate = new Date();
  dataSourseCursos: Array<Course> =[];
  setDataSourseCursos: Array<CursoMatricula> =[];
  yearsEscolar:Array<number> =[]
  disableButtonSave: boolean = true;
  yearSearch: number= new Date().getFullYear();

  matriculaDate: Date[] =[];
  yearEscolar:Date[]=[];

  estadoMatricula =[{id:true, name:'Abierta'},{id:false, name:'Cerrada'}]


  readonly fb = inject(FormBuilder);
  readonly fb2 = inject(FormBuilder);
  readonly matriculaForm = inject(FormBuilder).group({
    id: new FormControl(0),
    name: new FormControl('',[Validators.required]),
    isOpen: new FormControl(true),
    isActive: new FormControl(true),
    yearEscolar: new FormControl(null, [Validators.required]),
    yearEscolarDates: this.fb.group({
      dateInit: new FormControl(new Date()),
      dateEnd: new FormControl(new Date())
    }),
    dateRange: this.fb2.group({
      dateInit: new FormControl(new Date()),
      dateEnd: new FormControl(new Date())
    }),
    grados: new FormControl<CursoMatricula[]>([])      
  })
  constructor(private cursoService: CourseService, private _alert: AlertService, breakpointObserver: BreakpointObserver){
    super(breakpointObserver)
  }

  ngOnInit(): void {
    this.cursoService.getCourses().then(res=>{
      this.dataSourseCursos = res.data
    });
    this.getCurrentAndNextYear();
  }

  generateMatricula():void{
    this.setDataSourseCursos = this.dataSourseCursos;
    this.disableButtonSave = false;

   }

  currentValueChanged(event: any, field:string): void{
    const [startDate, endDate] = event.value;
    this.matriculaForm.patchValue({
      [field]: {
        dateInit: startDate,
        dateEnd: endDate
      }
    });    
  }

  async onSaveClick():Promise<void>{ 
    if(!this.matriculaForm.valid){
      return;
    }
    let cursosInvalid = this.setDataSourseCursos.some((item: CursoMatricula) =>
      item.precio === 0 || item.precio === undefined || item.precio === null
    );
    cursosInvalid = this.setDataSourseCursos.some((item: CursoMatricula) =>
      item.mensualidad === 0 || item.mensualidad === undefined || item.mensualidad === null
    );
    if(cursosInvalid){
      this._alert.warning("Datos Incompletos","Debe completar la información de los grados");
      return;
    }
    this.matriculaForm.patchValue({grados : this.setDataSourseCursos});
    const data = this.matriculaForm.value;

    const promise = data.id === 0? this.cursoService.postMatricula(data):
    this.cursoService.putMatricula(data);
    this._alert.loading('Procesando...');

    await promise.then((res)=>{
      this._alert.close();
    }).catch((err)=>{
      this._alert.warning('Ocurrio un erro al procesar','Error');
    })
  }  

  getCurrentAndNextYear():void {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    this.yearsEscolar = [currentYear, nextYear];
  }

  async findByYear():Promise<void>{
    this._alert.loading("Cargando...")
    await this.cursoService.getMatriculaDefinicion(this.yearSearch).then(res=>{
      const data = res.data;
      this.matriculaForm.patchValue({
        id:data.id, 
        name: data.name,
        isOpen: data.isOpen,
        yearEscolar: data.yearEscolar,
        isActive: data.isActive
      });
      this.setDataSourseCursos = data.grados;
      this.matriculaDate= [data.dateRange.dateInit, data.dateRange.dateEnd]
      this.yearEscolar= [data.yearEscolarDates.dateInit, data.yearEscolarDates.dateEnd]
    });
    this._alert.close();
  }

  onToolbarPreparing(event: any): void {
    const { items } = event.toolbarOptions;
    const addButton = {
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'save',
        text: 'Guardar',
        hint: 'Guardar',
        type: 'normal',
        elementAttr: { id: 'agregarRegistros' },
        stylingMode: 'contained',
        onClick: () => this.onSaveClick()
      },
    };
    const addDetail = {
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'inserttable',
        text: 'Generar',
        hint: 'Generar',
        type: 'normal',
        elementAttr: { id: 'agregarRegistros' },
        stylingMode: 'contained',
        onClick: () => this.generateMatricula()
      },
    };

    items.unshift( addDetail,addButton);
  }

}
