import { FormControl, FormGroup } from '@angular/forms';

export interface ISignupForm {
  name: FormControl<string>;
  email: FormControl<string>;
  telefone: FormControl<string>;
  password: FormControl<string>;
  passwordConfirm: FormControl<string>;
  extras: FormGroup;
}

