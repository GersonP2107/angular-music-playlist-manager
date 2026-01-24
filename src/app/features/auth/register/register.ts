import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    registerForm: FormGroup;
    errorMessage: string | null = null;
    loading = false;
    successMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    async onSubmit() {
        if (this.registerForm.valid) {
            this.loading = true;
            this.errorMessage = null;
            const { email, password } = this.registerForm.value;

            const { error } = await this.authService.signUp(email, password);

            this.loading = false;
            if (error) {
                this.errorMessage = error.message;
            } else {
                this.successMessage = 'Registro exitoso! Por favor verifica tu email antes de iniciar sesión.';
                // Optional: Redirect after a few seconds or let them click
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 3000);
            }
        }
    }
}
