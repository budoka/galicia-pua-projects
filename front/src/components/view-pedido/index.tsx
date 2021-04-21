import { EyeOutlined } from '@ant-design/icons';
import { Button, Descriptions, Divider, message, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import axios from 'axios';
import { RowInput } from 'jspdf-autotable';
import Moment from 'moment';
import React from 'react';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { createHojaRutaPDF, IPDFHojaRutaData } from 'src/helpers/pdf';
import { createEtiquetasPDF } from 'src/helpers/pdfEtiquetas';
import { renderEstadoPedido } from '../../utils/renderEstados';

const { Item } = Descriptions;

export interface ViewDetailPedidoProps {
  idDetalle: number;
  usuarioAlta: String;
  idPedido: number;
  sectorDestino: String;
  fechaEnvio: Date;
  observacionesPedido: String;
  estadoPedido: String;
  fechaUltimaTransicion: Date;
  fechaFinAtencion: Date;
  idSectorDestino: number;
  legajoAlta: String;
  descMotivoRechazoDetalle: String;
  observacionesRechazoDetalle: String;
  observacionesUrgente: String | null;
}

export interface ViewContenidoPedidoProps {
  idDetalle: number;
  observacionesDetalle: String | undefined;
  tipoPedidoNombre: String;
  idDocumento: number;
  idDigital: String;
  idCaja: number | undefined;
  tipoCaja: String | undefined;
  tipoDetalle: String | undefined;
  estadoDetalle: String;
}

interface ViewPedidoProps {
  data: ViewDetailPedidoProps | undefined;
  detail: ViewContenidoPedidoProps[] | undefined;
}

export const ViewPedido: React.FC<ViewPedidoProps | undefined> = (pedido) => {

  const openImage = async (numeroDoc: number) => {
    // obtiene detalle de pedido
    const api = apis['DOCUMENTO_GD'];
    const res = api.resources['VISUALIZAR_DOCUMENTO'];
    //const confDetalle = buildAxiosRequestConfig(api, res, { data: { id: numeroDoc } });

    //const response = await axios.request(buildAxiosRequestConfig(api, res, { data: { id: numeroDoc } }));
    //window.open(response.data, '_blank');
    // http://filenetprd.bancogalicia.com.ar/WorkplaceXT/WcmJavaViewer.jsp?id= VIEJA URL
    // http://dfnet1was01.bancogalicia.com.ar/navigator/bookmark.jsp?desktop=Filtrado&docid=%7B%%%7D // NUEVA URL
    window.open(
      'http://dfnet1was01.bancogalicia.com.ar/navigator/bookmark.jsp?desktop=Filtrado&docid=' +
      numeroDoc.toString() +
      '&objectType=document&objectStoreName=Produccion',
      '_blank',
    );
  };

  const contenidoARuta = (contenido: any): RowInput => {
    return {
      'codigoDetallePedido': contenido.idDetallePedido ? `${contenido.idDetallePedido}` : '',
      'caja': contenido.idCaja ? `${contenido.idCaja}` : '',
      'documento': contenido.idDocumento && contenido.tipoDocumento ? `${contenido.idDocumento} | ${contenido.tipoDocumento}` :
        (contenido.idDocumento ? contenido.idDocumento : ''),
      'tipoPedido': contenido.tipoPedido ? contenido.tipoPedido : '',
      'resolucion': contenido.motivoRechazo ? 'Motivo: ' + contenido.motivoRechazo : (contenido.estado ? contenido.estado : ''),
      'observaciones': contenido.observacionesDetalle ? contenido.observacionesDetalle : '',
    }
  };

  const buildHojaDeRuta = (data: any): IPDFHojaRutaData => {
    return {
      'hojaRutaNro': data.id ? `${data.id}` : '',
      'tipo': data.tipo ? data.tipo : '',
      'pedidoNro': data.idPedido ? `${data.idPedido}` : '',
      'usuarioSolicitante': data.usuarioSolicitante && data.legajoUsuarioSolicitante ? `${data.usuarioSolicitante} / ${data.legajoUsuarioSolicitante}` :
        (data.usuarioSolicitante ? data.usuarioSolicitante : (data.legajoUsuarioSolicitante ? data.legajoUsuarioSolicitante : '')),
      'enviarA': data.sectorDestino ? data.sectorDestino : '',
      'deposito': data.deposito ? data.deposito : '',
      'fecha': data.fecha ? Moment(data.fecha).format('DD/MM/YYYY') : '',
      // Una descripcion larga de prueba: descripcion:  "Solicitamos nos remitan digitalizacion del comprobante de pago del plazo Fijo N° de certificado 0229382020 por US$ 2.498.50 de Haiyee Alida Mendieta DNI 3971979."
      // Cortar ... antes de pasar a sig. pagina; permitir ingresar una cant. condiderable de texto...
      'descripcion': data.descripcionPedido ? data.descripcionPedido : '',
      'fechaPedidoUrgente': data.fechaPedidoUrgente ? Moment(data.fechaPedidoUrgente).format('DD/MM/YYYY') : undefined,
      'filename': "Hoja de Ruta para Pedido",
      'rutas': data.contenido.map((contenido: any) => contenidoARuta(contenido)),
    }
  };

  const onClickHojaRuta = async (idPedido: number | undefined) => {
    var api = apis['HOJA_RUTA'];
    var res = api.resources['CREAR'];
    var data = { idPedido: idPedido }
    const axiosConfig = buildAxiosRequestConfig(api, res, { data });
    try {
      const response = await axios.request<any>(axiosConfig);
      createHojaRutaPDF('code39', buildHojaDeRuta(response.data));
    }
    catch (error) {
      message.error('Ocurrió un error al generar la hoja de ruta. Vuelva a intentarlo');
    };
  };

  const onClickEtiquetas = (data: any) => {
    createEtiquetasPDF('code39', data);
  };

  return (
    <>
      <Descriptions size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
        <Item label="Número">{pedido.data?.idPedido}</Item>
        <Item label="Estado">{renderEstadoPedido(pedido.data?.estadoPedido)}</Item>

        <Item label="Usuario que Solicita">
          {pedido.data?.usuarioAlta} ({pedido.data?.legajoAlta})
        </Item>
        <Item label="Fecha de pedido">
          {pedido.data?.fechaEnvio != null ? Moment(pedido.data?.fechaEnvio).format('DD/MM/YYYY') : ' - '}
        </Item>

        <Item label="Suc/CC Destino" span={2}>
          {pedido.data?.idSectorDestino} - {pedido.data?.sectorDestino}
        </Item>

        <Item label="Fecha último cambio">
          {pedido.data?.fechaUltimaTransicion != null ? Moment(pedido.data?.fechaUltimaTransicion).format('DD/MM/YYYY') : ' - '}
        </Item>
        <Item label="Fecha fin de atención">
          {pedido.data?.fechaFinAtencion != null ? Moment(pedido.data?.fechaFinAtencion).format('DD/MM/YYYY') : ' - '}
        </Item>

        <Item label="Observaciones" span={pedido.data?.observacionesUrgente != null ? 1 : 2}>
          {pedido.data?.observacionesPedido}
          <br />
          <br />
          <br />
        </Item>
        {pedido.data?.observacionesUrgente != null ? <Item label="Motivo de Urgencia">{pedido.data?.observacionesUrgente}<br />
          <br />
          <br /></Item> : null}
        {pedido.data?.estadoPedido?.toString() === 'Rechazado' ? (
          <>
            <Item label="Motivo de Rechazo" span={2}>
              {pedido.data?.descMotivoRechazoDetalle}
            </Item>
            <Item label="Observaciones de Rechazo" span={2}>
              {pedido.data?.observacionesRechazoDetalle}
              <br />
              <br />
              <br />
            </Item>
          </>
        ) : null}
      </Descriptions>
      <br />
      <Button
        type="primary"
        onClick={(e) => onClickEtiquetas({ "idPedido": pedido.data?.idPedido, "etiquetas": pedido.detail })}
        disabled={!pedido.data?.idPedido && (pedido.detail && pedido.detail.length === 0) && !pedido.detail}
      >
        Etiquetas
      </Button>
      {
        pedido.data?.estadoPedido !== 'PendienteAtencion' &&
        pedido.data?.estadoPedido !== 'PendienteEnvio' &&
        pedido.data?.estadoPedido !== 'PendienteAprobacion' &&
        <Button type="primary" onClick={(e) => onClickHojaRuta(pedido.data?.idPedido)} disabled={!pedido.data?.idPedido} style={{ left: 15 }} >
          Hoja de Ruta
        </Button>
      }
      <Divider />
      <Table dataSource={pedido.detail} rowKey="idDetalle" pagination={{ pageSize: 5 }} size="small">
        <Column
          title="Imagen"
          dataIndex="idDigital"
          key="imagen"
          align="center"
          render={(text: number, record: ViewContenidoPedidoProps) => {
            return (
              <Button
                type="primary"
                shape="circle"
                hidden={record.idDigital === null}
                onClick={() => openImage(text)}
                style={{ color: '#fa7923', backgroundColor: 'transparent', border: 'none' }}
                icon={<EyeOutlined />}></Button>
            );
          }}
        />
        <Column title="Observaciones" dataIndex="observacionesDetalle" key="observaciones" ellipsis={true} />
        <Column title="Tipo Pedido" dataIndex="tipoPedidoNombre" key="tipoPedido" ellipsis={true} />

        <Column title="Nº de Documento" dataIndex="idDocumento" key="idDocumento" ellipsis={true} />
        <Column title="Número de Caja" dataIndex="idCaja" key="idCaja" />
        <Column title="Tipo de Caja" dataIndex="tipoCaja" key="tipoCaja" ellipsis={true} />
        <Column title="Tipo de Detalle" dataIndex="tipoDetalle" key="tipoDetalle" ellipsis={true} />
        <Column
          title="Estado"
          dataIndex="estadoDetalle"
          key="estadoDetalle"
          ellipsis={true}
          render={(text) => {
            return renderEstadoPedido(text);
          }}
        />
      </Table>
    </>
  );
};
