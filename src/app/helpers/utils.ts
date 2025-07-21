import { SafeHtml } from '@angular/platform-browser';
import * as lists_json from 'src/app/json/lists.json';

export function isNull(value: any) { return value === null || value === undefined || (typeof value === 'string' && value.toLowerCase() === 'null'); }

export function isNullOrEmpty(item: any) { return isNull(item) || (typeof item === 'string' && item.trim() === ''); }

export function isNullOrArrayEmpty(item: any) { return isNull(item) || (Array.isArray(item) && item.length === 0); }

export function nowUnix() { return Math.trunc(new Date().getTime() / 1000); }

export function valueOrDefault(value: any, defaultValue: any) { return isNullOrEmpty(value) ? defaultValue : value }

export function splitArray(array: Array<any>, longitud: number = 10) {
  let matriz = [];
  for (let i = 0; i < array.length; i += longitud) { matriz.push(array.slice(i, i + longitud)); }
  return matriz;
}

export function normalize(str: string) {
  let from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
    to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
    mapping = {};

  for (let i = 0, j = from.length; i < j; i++)
    mapping[from.charAt(i)] = to.charAt(i);

  let ret = [];
  for (let i = 0, j = str.length; i < j; i++) {
    let c = str.charAt(i);
    if (mapping.hasOwnProperty(str.charAt(i)))
      ret.push(mapping[c]);
    else
      ret.push(c);
  }
  return ret.join('');
}

export function normalizeKey(str: string) {
  return normalize(str).toUpperCase().trim().replace(new RegExp(' ', 'g'), '_');
}

export function sortList(items: any[], key: string, typeKey: 'string' | 'number' = 'number', orderBy: 'ASC' | 'DESC' = 'ASC') {
  if (typeKey === 'number') {
    if (isNullOrEmpty(key))
      items.sort(function (a, b) { return a - b });
    else
      items.sort(function (a, b) { return a[key] - b[key] });
  }
  else {
    if (isNullOrEmpty(key))
      items.sort(function (a, b) { return a > b ? 1 : a < b ? -1 : 0 });
    else
      items.sort(function (a, b) { return a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0 });
  }

  if (orderBy === 'DESC')
    items.reverse();

  return items;
}

export function generateKey(str: string) {
  let chars = ['A', 'C', 'E', 'G', 'K', 'M', 'P', 'R', 'T', 'Z'];
  let newKey = normalize(str).trim() + '_';
  let nowArray = Array.from(nowUnix().toString());
  nowArray.forEach(num => { newKey += chars[num]; });

  newKey = newKey.toUpperCase();
  newKey = newKey.replace(new RegExp(' ', 'g'), '_');
  return newKey;
}

export const getValueByPath = (obj: any, path: string) => {
  let paths = path.split('.', 10)
  let current = isNull(obj) ? {} : obj;
  for (let i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined || current[paths[i]] === null)
      return null;
    else
      current = current[paths[i]];
  }
  return current;
}

export function doGetListValue(code: string) {
  return lists_json[code];
}

export function base64ToFilePNG(base64String: string, fileName: string): File {
  const byteString = atob(base64String.split(',')[1]);
  const mimeString = base64String.split(',')[0].split(':')[1].split(';')[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const int8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    int8Array[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([arrayBuffer], { type: mimeString });
  return new File([blob], fileName + '.png', { type: mimeString });
}

// Modificar la función existente en utils.ts
export function onRateChange(key, form, datePipe) {
  const today = new Date();
  const value = form.value[key];

  switch (value) {
    case 'Hoy':
      form.patchValue({
        fromDate: datePipe.transform(today, 'yyyy-MM-dd'),
        toDate: datePipe.transform(today, 'yyyy-MM-dd')
      });
      break;

    case 'Últimos 30 Días':
      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 30);

      form.patchValue({
        fromDate: datePipe.transform(last30Days, 'yyyy-MM-dd'),
        toDate: datePipe.transform(today, 'yyyy-MM-dd')
      });
      break;

    case 'Este Mes':
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      form.patchValue({
        fromDate: datePipe.transform(firstDayOfMonth, 'yyyy-MM-dd'),
        toDate: datePipe.transform(lastDayOfMonth, 'yyyy-MM-dd')
      });
      break;

    case 'El Mes Pasado':
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      form.patchValue({
        fromDate: datePipe.transform(firstDayLastMonth, 'yyyy-MM-dd'),
        toDate: datePipe.transform(lastDayLastMonth, 'yyyy-MM-dd')
      });
      break;

    case 'Últimos 3 Meses':
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

      form.patchValue({
        fromDate: datePipe.transform(threeMonthsAgo, 'yyyy-MM-dd'),
        toDate: datePipe.transform(today, 'yyyy-MM-dd')
      });
      break;

    case 'Año Actual':
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      const lastDayOfYear = new Date(today.getFullYear(), 11, 31);

      form.patchValue({
        fromDate: datePipe.transform(firstDayOfYear, 'yyyy-MM-dd'),
        toDate: datePipe.transform(lastDayOfYear, 'yyyy-MM-dd')
      });
      break;

    default:
      form.patchValue({ fromDate: '', toDate: '' });
      break;
  }
}

export function getLastMonthDefaultDate(datePipe: any): string {
  const today = new Date();
  const last30Days = new Date(today);
  last30Days.setDate(today.getDate() - 30);
  return datePipe.transform(last30Days, 'yyyy-MM-dd') || '';
}

export function getTodayDefaultDate(datePipe: any): string {
  const today = new Date();
  return datePipe.transform(today, 'yyyy-MM-dd') || '';
}

export function getCircleButton(domSanitizer: any, value: string): SafeHtml {
  const buttonClass = value === 'Y' ? 'btn-success' : 'btn-warning';
  const backgroundColor = value === 'Y' ? '#d6ecdb' : '#fef2d6';
  const iconClass = value === 'Y' ? 'icon-like' : ' icon-info';
  const iconColor = value === 'Y' ? '#05a34a' : '#ffc107';
  return domSanitizer.bypassSecurityTrustHtml(`
          <button class="btn btn-circle rounded-circle ${buttonClass}" style="width: 40px; height: 40px; background-color: ${backgroundColor}; border: none;">
            <i class="${iconClass}" style="font-size: 1.2rem; color: ${iconColor};"></i>
          </button>
        `);
}

export function convertBase64ToInputFile(base64String: string, name: string, type: string): any {
  if (!base64String) return null;
  const byteCharacters = atob(base64String.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: type });
  return new File([blob], name, { type: type });
}

/**
 * Formatea una fecha en formato español (DD de Mes de YYYY)
 * @param fecha Fecha en formato ISO o string válido para Date
 * @param mostrarDe Si es true muestra 'de' entre día/mes y mes/año
 * @returns Fecha formateada en español o '---' si es inválida
 */
export function formatearFechaEs(fecha: string | Date | null | undefined, mostrarDe: boolean = true): string {
  if (!fecha) return '---';

  try {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
      'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const date = fecha instanceof Date ? fecha : new Date(fecha);

    if (isNaN(date.getTime())) return '---';

    if (mostrarDe) {
      return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
    } else {
      return `${date.getDate()} ${meses[date.getMonth()]} ${date.getFullYear()}`;
    }
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '---';
  }
}