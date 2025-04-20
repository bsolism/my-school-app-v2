import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AppContainerComponent } from '../../../layouts/app-container/app-container.component';
import { RegisterService } from '../services/register.service';
import { Alumno } from '../interfaces/alumn.interface';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DxDataGridComponent, DxDataGridModule, DxPopupModule,DxSelectBoxModule, DxTextBoxModule,
  DxScrollViewModule, DxTemplateModule,
  DxCheckBoxModule
 } from 'devextreme-angular';
import { AlumnoMatricula } from '../interfaces/alumn-enroll.interface';
import {CursoMatricula } from '../../interfaces/course.interface';
import { CourseService } from '../../settings/services/course.service';
import { DxButtonModule, DxButtonTypes } from 'devextreme-angular/ui/button';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-enroll',
  standalone: true,
  imports: [
    AppContainerComponent, 
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxTextBoxModule, 
    DxDataGridModule,
    DxPopupModule,
    DxScrollViewModule,
    DxTemplateModule,
    DxCheckBoxModule
  ],
  templateUrl: './enroll.component.html',
  styleUrl: './enroll.component.scss'
})
export class EnrollComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent | undefined;

  alumnSource:Array<Alumno> =[]
  enrollSource=[];
  filteredAlumn: Array<AlumnoMatricula> = [];
  AlumnoMatricula: Array<AlumnoMatricula> = [];
  grados: Array<CursoMatricula> =[];
  term:string =''
  popupVisible: boolean = false;
  popupWithScrollViewVisible: boolean = false;
  infoPopup:AlumnoMatricula={}
  precioGrado:number = 0;
  isMatriculaOpen:any;
  dataMatricula:any;

  readonly enrollForm = inject(FormBuilder).group({
      id: new FormControl(0),
      fullName: new FormControl(''),
      dni: new FormControl(''),
      lastGrade: new FormControl(''),
      nextGrade: new FormControl(0),
      matriculaId:new FormControl(0),
      total:new FormControl(0),
    });
    
  constructor(private register: RegisterService, private cursoService: CourseService,
    private _alert : AlertService
  ){
    this.cursoService.getMatriculaOpen().then(()=>{
      this.isMatriculaOpen = true;
    }).catch(()=>{
      this.isMatriculaOpen = false;
    })
  }

  ngOnInit(): void {
    const currentYear: number = new Date().getFullYear(); 
    this.cursoService.getMatriculaDefinicion(currentYear).then(res=>{
      this.grados = res.data.grados;
      this.dataMatricula = res.data;
    });
  }

  async searchAlumn():Promise<void>{
    await this.register.getAlumnsWithEnroll(this.term).then((res=>{
      this.filteredAlumn = res.data
    }));
  }

  async onMatricula(): Promise<void>{
    const selectedRowData = this.dataGrid!.instance.getSelectedRowsData();
    if(selectedRowData.length === 0){
      this._alert.warning('Debe seleccionar un alumno');
      return;
    }
    
    this.infoPopup = selectedRowData[0];
    if(this.infoPopup.state === 'Matriculado'){
      this._alert.warning('El alumno ya fue matriculado');
      return;
    }
    this.enrollForm.patchValue(this.infoPopup)
    const nextGrado = this.infoPopup.nextGrade?? 0;
    if(nextGrado > 0){
      this.onValueChangedGrade(nextGrado);      
    }
    this.popupVisible = true;
  }

  onValueChangedGrade(data: any){
    const grado = this.grados.find(x=> x.id === data)?.precio;
    this.precioGrado = grado??0;
  }

  async onEnrollSave():Promise<void>{
    if(!this.enrollForm.valid) return;
    const dataForm = this.enrollForm.value;
    const dataMatricula ={
      matriculaId: dataForm.matriculaId,
      alumnoId : dataForm.id,
      courseId: dataForm.nextGrade
    }

    this.popupVisible = false;
    this._alert.loading('Procesando...')

    await this.register.postMatriculaAlumno(dataMatricula).then(()=>{
      this.searchAlumn();
      this._alert.close();
    }).catch(()=>{
      this._alert.warning('Ocurrió un error al procesar la solicitud...')
    });
  
    this.popupWithScrollViewVisible = false;

  }

  getGradoName(value: any):string{
    return this.grados.find(x=> x.id === value)?.courseName?? '';
  }

  bookButtonOptions: DxButtonTypes.Properties = {
    width: "100%",
    text: 'Matricular',
    type: 'default',
    stylingMode: 'contained',
    onClick: () => this.onEnrollSave()
  };


  

  


}
