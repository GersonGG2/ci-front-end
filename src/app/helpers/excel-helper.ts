import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelHelper {

    constructor(private toastr: ToastrService) {}

    exportDataToCSV(rows: any, name: string): void {
        const cleanData = []
        for (const object of rows) {
          for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
              if (key.includes('Html')) {
                delete object[key]
              }
            }
            cleanData.push(object)
          }
        }
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(cleanData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
        const url: string = URL.createObjectURL(data);
        const link: HTMLAnchorElement = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async exportDataToExcel(totalItems: number, rows: any, columns: any, fileName: string): Promise<void> {
        try {
          if (totalItems === 0) {
            this.toastr.warning('No hay datos para exportar.', 'Advertencia');
            return;
          }
    
          const excelData = rows.map(row => {
            const rowData: { [key: string]: any } = {};
    
            columns.forEach(col => {
              if (col.name && !col.actions && !col.checkbox && col.prop) {
                if (col.prop.includes('.')) {
                  const props = col.prop.split('.');
                  let value = row;
                  for (const prop of props) {
                    value = value?.[prop];
                    if (value === undefined) break;
                  }
                  rowData[col.name] = value || '';
                } else {
                  rowData[col.name] = row[col.prop] || '';
                }
              }
            });
    
            return rowData;
          });
    
          const worksheet = XLSX.utils.json_to_sheet(excelData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'DATA');
    
          XLSX.writeFile(workbook, fileName.concat('.xlsx'));
    
          //this.toastr.success('Excel exportado correctamente.', 'Éxito');
        } catch (error) {
          console.error('Error al exportar a Excel:', error);
          //const errorMessage = error?.error?.message || error?.message || 'Error desconocido al generar el Excel.';
          //this.toastr.error(errorMessage, 'Error');
        }
    }
}