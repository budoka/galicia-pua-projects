import React, { useState, useEffect } from 'react';
import { Moment } from 'moment';
import { useAzureAuth } from '../auth/hook/use-azure-auth';
import { Col, Descriptions, Row } from 'antd';

type InfoNoEditable = {
  fechaGeneracion?: Date | undefined;
  numero?: string;
  estado?: string;
  fechaUltimoCambioEstado?: Date;
  //usuarioCreador?: string;
  legajo?: string;
  username?: string;
  sectorPropietario?: string;
  fechaVencimiento?: Moment | null;
  setFechaVencimiento?: (e: Moment | null) => void;
};

export const InfoNoEditable = (props: InfoNoEditable) => {
  const [vencimiento, setVencimiento] = useState<Moment | null>(props.fechaVencimiento ? props.fechaVencimiento : null);

  useEffect(() => {
    setVencimiento(props.fechaVencimiento ? props.fechaVencimiento : null);
  }, [props.fechaVencimiento]);

  return (
    <Row justify={'center'} style={{ marginBottom: 20 }}>
      <Descriptions column={2} size={'small'} bordered style={{ minWidth: '600px' }}>
        {props.fechaGeneracion && (
          <Descriptions.Item label="Fecha generación">{props.fechaGeneracion && props.fechaGeneracion.toLocaleString()}</Descriptions.Item>
        )}
        <Descriptions.Item label="Fecha ult. cambio de estado">
          {props.fechaUltimoCambioEstado ? props.fechaUltimoCambioEstado.toLocaleString() : 'Sin Datos'}
        </Descriptions.Item>
        <Descriptions.Item label="Número">{props.numero ? props.numero : 'No asignado'}</Descriptions.Item>
        <Descriptions.Item label="Usuario creador">
          {props.legajo?.toUpperCase()} - {props.username?.replace(',', '')}
        </Descriptions.Item>
        <Descriptions.Item label="Estado">{props.estado ? props.estado : 'No asignado'}</Descriptions.Item>
        <Descriptions.Item label="Sector propietario">
          {props.sectorPropietario ? props.sectorPropietario.toLowerCase() : ''}
        </Descriptions.Item>
        <Descriptions.Item span={1} label="Vencimiento de caja">
          {vencimiento?.format('DD/MM/YYYY').toLocaleLowerCase()}
        </Descriptions.Item>
      </Descriptions>
    </Row>
  );
};
