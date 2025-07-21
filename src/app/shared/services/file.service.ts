import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import imageCompression from 'browser-image-compression';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private http: HttpClient) {}

  async uploadFiles(module: string, id: number, path: string, files: File[], update = false): Promise<any> {
    const formData = new FormData();

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      initialQuality: 1,
      fileType: 'image/jpeg',
      alwaysKeepResolution: true
    };

    for await (const file of Array.from(files)) {
      // Comprimir imagen
      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type });

      formData.append('files', compressedFile);
    }

    const url = this.createUrl(module, id, path, update);

    try {
      return await firstValueFrom(this.http.post(url, formData));
    } catch (error) {
      console.error('Error en uploadFiles:', error);
      throw error;
    }
  }

  async getFiles(module: string, id: number, path?: string): Promise<any> {
    let params = new HttpParams();

    if (path) params.append('path', path);

    const url = `${environment.tip.files.file}/${module}/${id}/metadata`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  private createUrl(module: string, id: number, path: string, update = false) {
    let url = `${environment.tip.files.file}/${module}/${id}/upload?path=${path}`;
    if (update) url += '&update=true';
    return url;
  }

  getUrlImage(path: string): string {
    return `${environment.tip.files.file}/download?path=${path}`;
  }

  async getImageByUrl(url: string): Promise<any> {
    try {
      return await firstValueFrom(this.http.get(url, { responseType: 'arraybuffer' }));
    } catch (error) {
      console.error('Error:', error);
      return error;
    }
  }

  async deleteFile(deleteFile: any): Promise<any> {
    const url = `${environment.tip.files.deleteFile}`;
    try {
      return await firstValueFrom(this.http.post(url, deleteFile));
    } catch (error) {
      console.error('Error:', error);
      return error;
    }
  }

  async getInspectionPdf(headerId: string | number, download: boolean = true): Promise<Blob> {
    try {
      // Agregamos el parámetro download a la URL
      const url = `${environment.tip.inspections.processStart}${headerId}/pdf-report?download=${download}`;

      return await firstValueFrom(
        this.http.get(url, {
          responseType: 'blob'
        })
      );
    } catch (error) {
      console.error('Error al descargar el PDF de inspección:', error);
      throw error;
    }
  }
}
