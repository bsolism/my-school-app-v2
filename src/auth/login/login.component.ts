import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DxButtonModule, DxCheckBoxModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { DxButtonTypes } from 'devextreme-angular/ui/button';
import { DxTextBoxTypes } from 'devextreme-angular/ui/text-box';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../../app/shared/services/alert.service';
import { CurrentUser } from '../../app/shared/interfaces/current-user.interface';
import { jwtDecode } from "jwt-decode";
import { Menu } from '../../app/shared/interfaces/menu.interface';
import { UserStoreService } from '../../app/shared/services/user-store.service';

const clave = environment.encryptionKey;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, DxButtonModule, DxTextBoxModule, 
    ReactiveFormsModule, FormsModule, DxValidatorModule, DxCheckBoxModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent { 

  rememberMe= false;

  readonly loginForm = inject(FormBuilder).group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
  })
  passwordMode: DxTextBoxTypes.TextBoxType = 'password';
  constructor(private cdr: ChangeDetectorRef, private readonly auth: AuthService, 
    private readonly _alert: AlertService, private userStore: UserStoreService,
  private readonly router: Router) {}

  passwordButton: DxButtonTypes.Properties = {
    icon: 'eyeopen',
    stylingMode: 'text',
    onClick: () => {
      this.passwordMode = this.passwordMode === 'text' ? 'password' : 'text';
      this.cdr.detectChanges(); 
    },
  };

  todayButton: DxButtonTypes.Properties = {
    text: "Today",
    stylingMode: "text",
  };

  async login(): Promise<void> {
    const encryptedData = this.encryptCredentials();
    this._alert.loading('Logging in...');

    const auth = await this.auth.login(encryptedData).then((response) => {
      return response;
    }).catch((error) => {return error;});

    if(auth.status === 400) {
      this._alert.warning('user or password incorrect');
    }
    this._alert.close();

    if(this.rememberMe) {
      localStorage
        .setItem('auth-ms', JSON.stringify(auth.data));
      }

      const decodedUser: any = jwtDecode(auth.data);
      const menus: Menu[] = JSON.parse(decodedUser["http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata"]);
      const currentUser: CurrentUser = {
        usuario: decodedUser.unique_name,
        name: decodedUser.given_name,
        email: decodedUser.email,
        rolId: decodedUser.role,
        menus: menus,
      };
      this.userStore.setUser(currentUser);
      this.router.navigate(['/inicio']);
    }

  encryptCredentials(): string {
    const claveSha = CryptoJS.SHA256(environment.encryptionKey); 
    const formData = JSON.stringify(this.loginForm.value);
  
    const iv = CryptoJS.lib.WordArray.random(16);
  
    const encrypted = CryptoJS.AES.encrypt(
      formData,
      claveSha, 
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
  
    const combined = iv.clone().concat(encrypted.ciphertext);
    const encryptedData = CryptoJS.enc.Base64.stringify(combined);
    return encryptedData;

  }
  
  
}
