import { FormControl } from '@angular/forms';

export interface ILoginForm {
  email: FormControl<string>;
  senha: FormControl<string>;
}

