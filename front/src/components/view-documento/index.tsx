import { Button, Descriptions } from 'antd';
import React from 'react';
import Moment from 'moment';
import { renderEstadoDocumento } from '../../utils/renderEstados';
import { PlusOutlined } from '@ant-design/icons';
import documentosPendientesSlice from 'src/features/documentos/documentos-pendientes/documentos-pendientes.slice';

const { Item } = Descriptions;

export interface ViewDetailtDocumentoProps {
  id: number;
  detalle: string;
  fechaAlta: Date;
  fechaDocumental: Date;
  fechaHasta: Date;
  fechaVencimiento: Date;
  idCaja: number;
  idUsuarioAlta: number;
  usuarioAlta: string;
  idSectorOrigen: number;
  sectorOrigenDesc: string;
  idSectorPropietario: number;
  sectorPropietarioDesc: string;
  idSectorTenedor: number;
  sectorTenedorDesc: string;
  idTipoDocumento: number;
  tipoDocumentoDesc: string;
  fechaDesde: Date;
  fechaCierre: Date;
  fechaUltimaTransicion: Date;
  stateId: string;
  numeroProducto: string;
  dniCuitTitular: number;
  nombreTitular: string;
  eliminado: number;
  estadoCaja: string;
  tenenciaCaja: string;
  fechaUltimoCambioCaja: Date;
  fechaVenceCaja: Date;
}

interface ViewDocumentoProps {
  data: ViewDetailtDocumentoProps | undefined;
}

const renderSucursalCC = (doc: any) => {
  return doc && doc.idSectorPropietario && doc.sectorPropietarioDesc ? doc.idSectorPropietario + ' - ' + doc.sectorPropietarioDesc
    : (doc && doc.idSectorPropietario ? doc.idSectorPropietario : (doc.sectorPropietarioDesc ? doc.sectorPropietarioDesc : "-"))
};

export const ViewDocumento: React.FC<ViewDocumentoProps | undefined> = (documento) => {
  return (
    <>
      <Descriptions size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
        <Item label="Número">{documento.data?.id}</Item>
        <Item label="Número de caja">{documento.data?.idCaja}</Item>
        <Item label="Tipo de documento">{documento.data?.tipoDocumentoDesc}</Item>
        <Item label="Estado">{renderEstadoDocumento(documento.data?.stateId)}</Item>

        <Item label="Suc/CC Alta">{documento.data?.idSectorOrigen + ' - ' + documento.data?.sectorOrigenDesc}</Item>
        <Item label="Tenencia Suc/CC">{documento.data?.idSectorTenedor + ' - ' + documento.data?.sectorTenedorDesc}</Item>

        <Item label="Fecha generación">
          {documento.data?.fechaAlta != null ? Moment(documento.data?.fechaAlta).format('DD/MM/YYYY') : ' - '}
        </Item>
        <Item label="Fecha últ. cambio estado">
          {documento.data?.fechaUltimaTransicion != null ? Moment(documento.data?.fechaUltimaTransicion).format('DD/MM/YYYY HH:mm') : ' - '}
        </Item>
        <Item label="Fecha documental">
          {documento.data?.fechaDocumental != null ? Moment(documento.data?.fechaDocumental).format('DD/MM/YYYY') : ' - '}
        </Item>
        <Item label="Fecha vencimiento">
          {documento.data?.fechaVencimiento != null ? Moment(documento.data?.fechaVencimiento).format('DD/MM/YYYY') : ' - '}
        </Item>

        <Item label="Detalle" span={2}>
          {documento.data?.detalle}
        </Item>
        <Item label="Suc/CC Propietario" span={2}>
          {renderSucursalCC(documento.data)}
        </Item>

        <Item label="Número de producto" span={2}>
          {documento.data?.numeroProducto}
        </Item>
        <Item label="DNI / CUIT titular" span={2}>
          {documento.data?.dniCuitTitular}
        </Item>
        <Item label="Nombre / Razon Social" span={2}>
          {documento.data?.nombreTitular}
        </Item>
        <Item label="Fecha cierre" span={2}>
          {documento.data?.fechaCierre != null ? Moment(documento.data?.fechaCierre).format('DD/MM/YYYY') : ' - '}
        </Item>
      </Descriptions>
    </>
  );
};
