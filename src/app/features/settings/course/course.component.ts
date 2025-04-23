import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxNumberBoxModule, DxTagBoxModule, DxTextBoxModule } from 'devextreme-angular';
import { FormBaseComponent } from '../../../shared/components/form-base/form-base.component';
import { AppContainerComponent } from '../../../layouts/app-container/app-container.component';
import { Course} from '../../interfaces/course.interface';
import { CourseService } from '../services/course.service';
import { AlertService } from '../../../shared/services/alert.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [AppContainerComponent,CommonModule, FormsModule,ReactiveFormsModule, 
    DxCheckBoxModule, DxTextBoxModule, DxNumberBoxModule,DxButtonModule, DxDataGridModule,
    DxTagBoxModule],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent extends FormBaseComponent implements OnInit {

  hasLimit: boolean = false;
  hasPreviewCourse: boolean = false;
  coursesSource:Array<Course>=[]

  readonly courseForm = inject(FormBuilder).group({
    id: new FormControl(0),
    courseName: new FormControl('', [Validators.required]),
    courseDescription: new FormControl(''),
    hasLimit: new FormControl(false),
    limit: new FormControl(0),
    isActive: new FormControl(true),
    hasPreviewCourse: new FormControl(false),
    cursosPrev: new FormControl([])
  })

  constructor(private _service: CourseService, private _alert: AlertService, breakpointObserver: BreakpointObserver){
    super(breakpointObserver);
  }

  async ngOnInit(): Promise<void> {
    this.getInitData();
    
  }

  getInitData():void{
    this._service.getCourses().then(res=>{
      this.coursesSource = res.data;
    })   
  }

  onSelection(event:any):void{
    const data = event.data
    const cursosPreviosId = data.cursosPrevs.map((res: any)=> res.id);
    this.courseForm.patchValue(data);
    this.courseForm.patchValue({
      cursosPrev:cursosPreviosId,
      hasPreviewCourse: cursosPreviosId.length > 0
    })
    this.hasLimit = data.hasLimit;
    this.hasPreviewCourse = cursosPreviosId.length > 0
  }

  async onSaveClick():Promise<void>{
    const course: Course = this.courseForm.value as Course;
    
    const promise = course.id===0 ? this._service.addCourse(course)
              : this._service.updateCourse(course);  
    
    await promise.then(()=>{
      this.getInitData();
      this._alert.close();
        
      this.resetForm();
    })   
  }
  resetForm():void{
    this.hasPreviewCourse = false;
    this.hasLimit = false;
    this.courseForm.patchValue({
      id:0,
      courseName:'',
      courseDescription:'',
      hasLimit:false,
      limit:0,
      cursosPrev:[]
    })
  }
}

