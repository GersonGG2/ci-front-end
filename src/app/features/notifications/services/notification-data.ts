import { Notification } from './notification';

export const notifications: Notification[] = [
  {
    titulo: 'Inspección en curso',
    mensaje: 'Se ha iniciado una inspección. Requiere tu aprobación.',
    tipo: 'btn-danger',
    fecha: '15/02/2025',
    hora: '14:32',
  },
  {
    titulo: 'Aprobación pendiente',
    mensaje: 'Una inspección realizada. Aún espera tu aprobación.',
    tipo: 'btn-success',
    fecha: '14/02/2025',
    hora: '10:15',
  },
  {
    titulo: 'Inspección programada',
    mensaje: 'Recuerda que tienes una inspección programada',
    tipo: 'btn-info',
    fecha: '20/02/2025',
    hora: '09:00',
  },
  {
    titulo: 'Inspección aprobada',
    mensaje: 'La inspección ha sido aprobada con éxito.',
    tipo: 'btn-primary',
    fecha: '13/02/2025',
    hora: '16:45',
  },
  {
    titulo: 'Inspección rechazada',
    mensaje: 'La inspección fue rechazada. Revisa los detalles.',
    tipo: 'btn-primary',
    fecha: '12/02/2025',
    hora: '11:20',
  },
];