import { Alert } from 'antd';
import React from 'react';
import { PreviewPedidoCarrito } from '../features/carrito/types';

export function canAddToCart(record: any): boolean {
  if ('estadoCaja' in record) {
    return record.stateId === 'Archivado' || record.stateId === 'Recibido' || record.stateId === 'Ingresado' || record.stateId === 'PrestadoParcialmente'; // Documento
  } else {
    return record.stateId === 'Archivada' || record.stateId === 'PrestadaParcialmente' || record.stateId === 'PendienteUbicacion'; // Caja
  }
}

export function renderValidation(record: PreviewPedidoCarrito) {

  return record ? (
    <Alert
      message={record.descripcion}
      type={record.estado === 'Ok' ? 'success' : record.estado === 'Warning' ? 'warning' : 'error'}
    //showIcon
    />
  ) : (
    <Alert
      message={'No se pudo agregar al carrito'}
      type={'error'}
    //showIcon
    />
  );
}
