import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;

      const { error } = await this.authService.signIn(email, password);

      this.loading = false;
      if (error) {
        this.errorMessage = error.message;
      } else {
        this.router.navigate(['/']); // Redirect to home/dashboard
      }
    }
  }

  async onSignUp() {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      const { error } = await this.authService.signUp(email, password);
      this.loading = false;
      if (error) {
        this.errorMessage = error.message;
      } else {
        alert('Registro exitoso! Por favor verifica tu email.');
      }
    }
  }
}
