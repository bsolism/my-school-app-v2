import { Component } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-form-base',
  standalone: true,
  imports: [],
  template: `<div></div>`,
  styleUrls: []
})
export abstract class FormBaseComponent {

  dniFormatter(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const dniPattern = /^\d{4}-\d{4}-\d{5}$/; 
      const isValid = dniPattern.test(control.value); 
      return isValid ? null : { invalidDni: true };
    };
  }

  dniAutoFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        const cleanedValue = control.value.replace(/[^0-9]/g, ''); 
        const formattedValue = `${cleanedValue.slice(0, 4)}${cleanedValue.length > 4 ? '-' : ''}${cleanedValue.slice(4, 8)}${cleanedValue.length > 8 ? '-' : ''}${cleanedValue.slice(8, 13)}`.trim();
  
        if (control.value !== formattedValue) {
          control.setValue(formattedValue, { emitEvent: false }); 
        }
      }
      return null;
    };
  }

  phoneFormatter(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phonePattern = /^\d{4}-\d{4}$/; 
      const isValid = phonePattern.test(control.value); 
      return isValid ? null : { invalidPhone: true };
    };
  }

  phoneAutoFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        const cleanedValue = control.value.replace(/[^0-9]/g, ''); 
        const formattedValue = `${cleanedValue.slice(0, 4)}${cleanedValue.length > 4 ? '-' : ''}${cleanedValue.slice(4, 8)}`.trim();
  
        if (control.value !== formattedValue) {
          control.setValue(formattedValue, { emitEvent: false }); 
        }
      }
      return null;
    };
  }

  formatCurrency = (cellInfo: any) => {
    const value = cellInfo.value;
    if (value !== null && value !== undefined) {
      return `L${value.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return 'L0.00';
  };
  
}
