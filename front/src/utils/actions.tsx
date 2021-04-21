import { Alert } from 'antd';
import React from 'react';
import { ResultadoAccion } from 'src/features/acciones/types';

export function renderActionValidation(record: ResultadoAccion & { estadoRespuesta: any }) {
  return record.estadoRespuesta ? (
    <Alert
      message={record.respuesta}
      type={record.estadoRespuesta === 'Ok' ? 'success' : record.estadoRespuesta === 'Warning' ? 'warning' : 'error'}
      showIcon
    />
  ) : (
    <Alert message={'No se pudo realizar la acción'} type={'error'} showIcon />
  );
}
