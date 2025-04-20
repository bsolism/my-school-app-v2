import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBaseComponent } from '../../../shared/components/form-base/form-base.component';
import { Contact } from '../../interfaces/contact.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DxButtonModule, DxDataGridModule, DxDateBoxModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { RegisterService } from '../services/register.service';
import { City, Country, State } from '../interfaces/location.interface';
import { ValidationCallbackData } from 'devextreme/common';
import { Alumno, AlumnoContacto } from '../interfaces/alumn.interface';
import { AlertService } from '../../../shared/services/alert.service';
import { ActivatedRoute } from '@angular/router';


// const sendRequest = function (value: string) {
//   const invalidEmail = 'test@dx-email.com';
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(value !== invalidEmail);
//     }, 1000);
//   });
// };

@Component({
  selector: 'app-alumn-screen-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxValidatorModule,
    DxDataGridModule,
    DxTextAreaModule,
    DxButtonModule
  ],
  templateUrl: './alumn-screen-form.component.html',
  styleUrl: './alumn-screen-form.component.scss'

})
export class AlumnScreenFormComponent extends FormBaseComponent implements OnInit {

  imageSrc: string = 'assets/default.jpg';
  value: Date = new Date(1981, 3, 27);

  typeDni = ['DNI','Pasaporte']

  bloodType = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
  parents =['Padre','Madre','Hermano (a)','Abuelo (a)','Tio (a)','Tutor']
  sexs =['Femenino','Masculino']

  selectedDni:string='DNI'
  labelTypeDni:string ='DNI'

  countries:Array<Country> =[];
  states:Array<State> =[];
  currentStates:Array<State> =[];
  cities:Array<City> =[];
  currentCities:Array<City> =[];

  context :any 
  contacts:Array<AlumnoContacto>=[];

  readonly registerForm = inject(FormBuilder).group({
    id: new FormControl(0),
    firstName: new FormControl('', [Validators.required]),
    secondName: new FormControl(''),
    lastName: new FormControl('', [Validators.required]),
    secondLastName: new FormControl(''),
    dni: new FormControl('',[Validators.required]),
    sex: new FormControl('', [Validators.required]),
    bloodType: new FormControl('', [Validators.required]),
    dateOfBirth: new FormControl(new Date(), [Validators.required]),
    countryBorn: new FormControl(0, [Validators.required]),
    stateBorn: new FormControl(0, [Validators.required]),
    cityBorn: new FormControl(0,[Validators.required]),
    phone: new FormControl(''),
    email: new FormControl(''),
    countryResidence: new FormControl(0, [Validators.required]),
    stateResidence: new FormControl(0, [Validators.required]),
    cityResidence: new FormControl(0,[Validators.required]),
    address: new FormControl('',[Validators.required]),
    comment: new FormControl(''),
    dniType: new FormControl('dni', [Validators.required]),
    contacts: new FormControl<Contact[]>([])
  });

  // asyncValidation = (params: ValidationCallbackData) => sendRequest(params.value);

  constructor(private service: RegisterService, private cdr: ChangeDetectorRef,
    private _alert: AlertService, private route: ActivatedRoute, private location: Location
  ){
    super();    
  }

  async ngOnInit(): Promise<void> {
    await this.onGetCountries();
    await this.listenRoute();

    this.context = {
      service: {
        getStatesByCountryId: this.getStatesByCountryId.bind(this),  
        getCityByStateId: this.getCiyByStateId.bind(this), 
      },
      countries: this.countries,
      states: this.states,
      currentStates: this.currentStates,
      cities: this.cities,
      currentCities: this.currentCities,
    };
  }

  async listenRoute():Promise<void>{
    let id = 0;
    this.route.queryParams.subscribe(params => {
      if(params['id'])id = params['id']});
    if(id > 0){
      const {data} = await this.service.getAlumnById(id);
      
      this.contacts  = data.contacts??[];
    
      // const data = AlumnoMapper.populateForm(resp.data);
      this.registerForm.patchValue(data);
    
      const { states: birthStates, cities: birthCities } = await this.loadLocationData(
        data.countryBirth,
        data.stateBirth
      );
      this.states = birthStates;
      this.cities = birthCities;
    
      const { states: currentStates, cities: currentCities } = await this.loadLocationData(
        data.currentCountry,
        data.currentState
      );
      this.currentStates = currentStates;
      this.currentCities = currentCities;
      this.registerForm.patchValue({
        countryBorn: this.countries.find(x=> x.name === data.countryBirth)?.id,
        stateBorn: this.states.find(x=> x.name === data.stateBirth)?.id,
        cityBorn: this.cities.find(x=> x.name === data.cityBirth)?.id,
        countryResidence: this.countries.find(x=> x.name === data.countryBirth)?.id,
        stateResidence: this.currentStates.find(x=> x.name === data.currentState)?.id,
        cityResidence: this.currentCities.find(x=> x.name === data.currentCity)?.id,
      })
    }
  }

  async loadLocationData(countryName?: string, stateName?: string) {
    const countryId = this.countries.find(x => x.name === countryName)?.id ?? 0;
    const states = await this.service.getStatesByCountryId(countryId).then(res => res);
    const stateId = states.find(x => x.name === stateName)?.id ?? 0;
    const cities = await this.service.getCityByStateId(stateId).then(res => res);
    return { states, cities };
  }

  async onGetCountries(): Promise<void>{
    this.countries = await this.service.getCountries()
  }

  async onValueSelected(event:any, field:string){
    if(!event) return;    
    const fieldStrategy = new FieldStrategy(this.context);
    await fieldStrategy.execute(field, event);
    this.cdr.detectChanges();
  }

  onSaveClick():void{
    if(!this.registerForm.valid){
      this._alert.warning('Información incompleta');
      return;
    }
    if(this.contacts.length === 0){
      this._alert.warning('Debe especificar personas de contacto');
      return;
    }
    let alumn: Alumno = this.mapDtoToForm(this.registerForm.value as Alumno)
    this._alert.loading('Guardando...')

    const promise = alumn.id === 0? this.service.postAlumn(alumn) :
                    this.service.putAlumn(alumn);

    promise.catch(err=>{
      this._alert.warning('Ocurrió un error al procesar la solicitud', err.error.title);
      return;

    })
    promise.then(()=>{
      this.location.back();      
    })                  
    this._alert.close();    
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageSrc = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onValueChangeTypeDni(event: any){
    this.selectedDni = event;
    this.labelTypeDni = event;
    this.registerForm.patchValue({dni:''})
  }

  get dniMask(): string {
    return this.selectedDni === 'DNI' ? '0000-0000-00000' : '';
  }

  private async getStatesByCountryId(idCountry: number, targetArray: keyof typeof this.context): Promise<void> {
    const res = await this.service.getStatesByCountryId(idCountry);  
    this.context[targetArray] = res;  

    if (targetArray === 'states') {
      this.states = res;  
    } else if (targetArray === 'currentStates') {
      this.currentStates = res;  
    }
    this.cdr.detectChanges();
  }

  private async getCiyByStateId(idState: number, targetArray: keyof typeof this.context): Promise<void> {
    const res = await this.service.getCityByStateId(idState);
    this.context[targetArray] = res;
    if (targetArray === 'cities') {
      this.cities = res;  
    } else if (targetArray === 'currentCities') {
      this.currentCities = res;  
    }
    this.cdr.detectChanges();  
  }

  private mapDtoToForm(alumnDto: Alumno): Alumno{
    alumnDto.contacts = this.contacts;
    alumnDto.countryBirth = this.countries.find(x=> x.id === this.registerForm.value.countryBorn)?.name;
    alumnDto.stateBirth = this.states.find(x=> x.id === this.registerForm.value.stateBorn)?.name;
    alumnDto.cityBirth = this.cities.find(x=> x.id === this.registerForm.value.cityBorn)?.name;
    alumnDto.currentCountry = this.countries.find(x=> x.id === this.registerForm.value.countryResidence)?.name;
    alumnDto.currentState = this.currentStates.find(x=> x.id === this.registerForm.value.stateResidence)?.name;
    alumnDto.currentCity = this.currentCities.find(x=> x.id === this.registerForm.value.cityResidence)?.name;
    
    return alumnDto
  }

  Columns:any[] = [
    { dataField: 'fullName', caption: 'Nombre'},
    { dataField: 'dni', caption: 'Identidad',
      editorOptions:{ type: 'mask', mask: '0000-0000-00000', useMaskedValue: true }
     },
    { dataField: 'phone', caption: 'Telefono',
      editorOptions:{ type: 'mask', mask: '(+000) 0000-0000', useMaskedValue: true }
    },
    {
      dataField: 'email',
      caption: 'Correo',
      validationRules: [
        { type: 'required', message: 'El correo es obligatorio' },
        { type: 'email', message: 'El formato del correo no es válido' }
      ],
    },
    {
      dataField: 'parent',
      caption: 'Parentesco',
      lookup: {
        dataSource: this.parents, 
        valueExpr: 'this', 
        displayExpr: 'this', 
      },
    }
  ]
}

class FieldStrategy {
  private strategies: Record<string, (id: number) => Promise<void>>;

  constructor(private context: { 
    service: any;  
    countries: Array<Country>;
    states: Array<State>; 
    currentStates: Array<State>;  
    cities: Array<City>;  
    currentCities: Array<City>;  
  }) {
    this.strategies = {
      countryBorn: (id: number) => this.context.service.getStatesByCountryId(id, 'states'),
      countryResidence: (id: number) => this.context.service.getStatesByCountryId(id, 'currentStates'),
      stateBorn: (id: number) => this.context.service.getCityByStateId(id, 'cities'),
      stateResidence: (id: number) => this.context.service.getCityByStateId(id, 'currentCities')
    };
  }

  async execute(field: string, id: number): Promise<void> {
    const strategy = this.strategies[field]; 
    if (strategy)
      await strategy(id);
  }

  getList(field: string): any[] | null {
    const fieldMap: Record<string, any[]> = {
      'countryBorn': this.context.countries,
      'countryResidence': this.context.countries,
      'stateBorn': this.context.states,
      'stateResidence': this.context.currentStates,
      'cityBorn': this.context.cities,
      'cityResidence': this.context.currentCities
    };
    return fieldMap[field] || null;    
  }  
}
