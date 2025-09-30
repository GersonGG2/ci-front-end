import Swal from 'sweetalert2';

export const Alert = {
  inProgress: async () => {
    return await Alert.info('Funcionalidad pendiente');
  },
  info: async (title: string, text: string = '') => {
    return await Swal.fire({
      icon: 'info',
      title: title,
      html: text,
      confirmButtonColor: '#1b396a',
      confirmButtonText: 'Aceptar',
      heightAuto: false
    });
  },
  warn: async (title: string, text: string = '') => {
    return await Swal.fire({
      icon: 'warning',
      title: title,
      html: text,
      confirmButtonColor: '#1b396a',
      confirmButtonText: 'Aceptar',
      heightAuto: false
    });
  },
  success: async (title: string, text: string = '') => {
    return await Swal.fire({
      icon: 'success',
      title: title,
      html: text,
      confirmButtonColor: '#1b396a',
      confirmButtonText: 'Aceptar',
      heightAuto: false
    });
  },
  error: async (title: string, text: string = '') => {
    return await Swal.fire({
      icon: 'error',
      title: title,
      html: text,
      confirmButtonColor: '#1b396a',
      confirmButtonText: 'Aceptar',
      heightAuto: false
    });
  },
  question: async (title: string, text: string = '', buttons: 'YesNo' | 'AcceptCancel' = 'YesNo') => {
    let result = await Swal.fire({
      icon: 'question',
      title: title,
      html: text,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonColor: '#1b396a',
      confirmButtonText: buttons === 'YesNo' ? 'Sí, continuar' : 'Aceptar',
      cancelButtonText: buttons === 'YesNo' ? 'No, cancelar' : 'Cancelar',
      heightAuto: false,
      allowOutsideClick: false,
      focusConfirm: true,
      reverseButtons: true
    });
    return result.isConfirmed;
  }
};
