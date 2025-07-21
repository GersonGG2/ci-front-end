import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'security'
})
export class SecurePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if (value === 'S') return 'Sistema';
    if (value === 'U') return 'Usuario';

    return 'N/A';
  }
}
