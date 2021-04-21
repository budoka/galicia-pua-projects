import { Button, Descriptions, Divider } from 'antd';
import React, { useEffect } from 'react';
import { renderEstadoCaja } from '../../utils/renderEstados';
import Moment from 'moment';

import { EtiquetaCaja } from '../EtiquetaCaja';
import { DetalleCaja } from '../DetalleCaja';
import { DocumentoCaja } from '../DocumentoCaja';

import { PlusOutlined } from '@ant-design/icons';

const { Item } = Descriptions;

export interface ViewDetailtCajaProps {
  fechaGeneracion: Date;
  numero: number;
  stateId: string;
  fechaUltimaTransicion: Date;
  idUsuarioAlta: number;
  legajo: string;
  nombre: string;
  idSectorOrigen: number;
  nombreSector: string;
  fechaVencimiento: Date;
  idTipoCaja: number;
  tipoContenido: number;
  descripcionContenido: string;
  idPlantilla: number;
  fechaDocumentacionDesde: Date;
  fechaDocumentacionHasta: Date;
  descripcion: string;
  restringida: number;
  nombreTipoCaja: string;
  contenido: any;
  descripcionPlantilla: string;
  nombreSectorPropietario: string;
  nombreUsuarioCierre: string;
  nombreSectorTenedor: string;
  fechaRecepcion: Date;
  fechaArchivada: Date;
  idSectorPropietario: number;
  idSectorTenedor: number;
}

interface ViewCajaProps {
  data: ViewDetailtCajaProps | undefined;
}

export const ViewCaja: React.FC<ViewCajaProps | undefined> = (caja) => {
  const renderContenidoCaja = () => {
    switch (caja.data?.tipoContenido) {
      case 0:
        return (
          <>
            <EtiquetaCaja
              idTipoCaja={caja.data.idTipoCaja}
              idTipoContenido={caja.data.tipoContenido}
              etiquetas={caja.data.contenido}></EtiquetaCaja>
          </>
        );
      case 1:
        return (
          <>
            <DetalleCaja
              idTipoCaja={caja.data.idTipoCaja}
              idTipoContenido={caja.data.tipoContenido}
              idPlantilla={caja.data.idPlantilla}
              detalle={caja.data.contenido}></DetalleCaja>
          </>
        );
      case 2:
        return (
          <>
            <DocumentoCaja
              idTipoCaja={caja.data.idTipoCaja}
              idTipoContenido={caja.data.tipoContenido}
              documentos={caja.data.contenido}></DocumentoCaja>
          </>
        );
    }
  };

  return (
    <>
      <Descriptions size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
        <Item label="Número">{caja.data?.numero}</Item>
        <Item label="Estado">{renderEstadoCaja(caja.data?.stateId)}</Item>

        <Item label="Fecha generación">
          {caja.data?.fechaGeneracion != null ? Moment(caja.data?.fechaGeneracion).format('DD/MM/YYYY') : ' - '}
        </Item>
        <Item label="Suc/CC Alta">{caja.data?.idSectorOrigen + ' - ' + caja.data?.nombreSector}</Item>

        <Item label="Usuario de Alta">{caja.data?.nombre}</Item>
        <Item label="Suc/CC Propietario">{caja.data?.idSectorPropietario + ' - ' + caja.data?.nombreSectorPropietario}</Item>

        <Item label="Tipo de contenido">{caja.data?.descripcionContenido}</Item>
        <Item label="Tenencia Suc/CC">{caja.data?.idSectorTenedor + ' - ' + caja.data?.nombreSectorTenedor}</Item>

        <Item label="Tipo de caja">{caja.data?.nombreTipoCaja}</Item>
        <Item label="Fecha últ. cambio estado">
          {caja.data?.fechaUltimaTransicion != null ? Moment(caja.data?.fechaUltimaTransicion).format('DD/MM/YYYY HH:mm') : ' - '}
        </Item>

        <Item label="Usuario de Cierre de caja">{caja.data?.nombreUsuarioCierre}</Item>
        <Item label="Fecha vencimiento">
          {caja.data?.fechaVencimiento != null ? Moment(caja.data?.fechaVencimiento).format('DD/MM/YYYY') : ' - '}
        </Item>

        <Item label="Descripción" span={2}>
          {caja.data?.descripcion}
          <br />
          <br />
          <br />
        </Item>

        <Item label="Fecha documentación desde">
          {caja.data?.fechaDocumentacionDesde != null ? Moment(caja.data?.fechaDocumentacionDesde).format('DD/MM/YYYY') : ' - '}
        </Item>
        <Item label="Fecha recepción">
          {caja.data?.fechaRecepcion != null ? Moment(caja.data?.fechaRecepcion).format('DD/MM/YYYY HH:mm') : ' - '}
        </Item>

        <Item label="Fecha documentación hasta">
          {caja.data?.fechaDocumentacionHasta != null ? Moment(caja.data?.fechaDocumentacionHasta).format('DD/MM/YYYY') : ' - '}
        </Item>
        <Item label="Fecha de archivado">
          {caja.data?.fechaArchivada != null ? Moment(caja.data?.fechaArchivada).format('DD/MM/YYYY HH:mm') : ' - '}
        </Item>
      </Descriptions>
      <Divider />
      {renderContenidoCaja()}
    </>
  );
};
