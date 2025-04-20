import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private swalInstance: any = null;

  constructor() { }

  loading(message: string, time: number = 5000) {
    this.swalInstance = Swal.fire({
      title: message,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title'
      },
      timer: time,
      didOpen: () => {
        Swal.showLoading();
      },
    }); 
  }

  warning(message: string, text?: string){
      this.swalInstance = Swal.fire({
        title: message,
        text: text,
        allowOutsideClick: false,
        showConfirmButton: true,
        confirmButtonText: 'OK',
        icon: "warning",
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title'
        },
      });
  }

  close() {
    if (this.swalInstance) {
      Swal.close();
      this.swalInstance = null;
    }
  }
}
