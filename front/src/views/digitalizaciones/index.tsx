import { EyeOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Collapse,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  PageHeader,
  Row,
  Select,
  Tag,
  Timeline,
} from 'antd';
import locale from 'antd/es/date-picker/locale/es_ES';
import { useForm } from 'antd/lib/form/Form';
import axios, { AxiosRequestConfig } from 'axios';
import _ from 'lodash';
import { default as moment, default as Moment } from 'moment';
import 'moment/locale/es';
import { ColumnsType } from 'rc-table/lib/interface';
import React, { CSSProperties, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { SolicitudesRequestBody } from 'src/API/PendientesAPI';
import { ExportButton } from 'src/components/export-button';
import { RootState } from 'src/reducers';
import { ColumnTypeEx, Table } from '../../components/table';
import { Wrapper } from '../../components/wrapper';
import { Solicitud } from '../../types/Solicitud';
import { getURLs } from '../../utils/ConfigurationServices';
import { exportToCSV2 } from '../../utils/ExportExcel';

const { Panel } = Collapse;
const { Option } = Select;

interface HistorialProps {
  historial: Historial[];
}

interface HistorialBodyRequest {
  id: number;
}

interface HistorialBodyResponse {
  estado: string;
  fecha: string;
  usuario: string;
}

interface Historial {
  estado: string;
  fecha: string;
  usuario: string;
}

type FilterType = 'text' | 'number' | 'date' | 'date-range' | 'list';

/*TODO: Llamar al WS de Pablo de Procesos y Subprocesos */
const listProcesos = [
  { value: 'PROCRED', label: 'PROCRED' },
  { value: 'UAL', label: 'UAL' },
  { value: 'Oficios', label: 'Oficios' },
  { value: 'Amparos', label: 'Amparos' },
  { value: 'Originacion Mayorista', label: 'Originacion Mayorista' },
  { value: 'SIO Digitalizacion', label: 'SIO Digitalizacion' },
  { value: 'Originacion Minorista', label: 'Originacion Minorista' },
  { value: 'Banca Financiera', label: 'Banca Financiera' },
  { value: 'Originacion', label: 'Originacion' },
  { value: 'Comercio Exterior', label: 'Comercio Exterior' },
  { value: 'Perfil Inversor', label: 'Perfil Inversor' },
  { value: 'Empresas', label: 'Empresas' },
  { value: 'Legajo Digital', label: 'Legajo Digital' },
  { value: 'Normativas Gestion Regulatoria', label: 'Normativas Gestion Regulatoria' },
];

const listSubProcesos = [
  { value: 'Prestamos Sola Firma', parent: 'PROCRED', label: 'Prestamos Sola Firma' },
  { value: 'Prestamos Comex en pesos', parent: 'PROCRED', label: 'Prestamos Comex en pesos' },
  { value: 'Préstamo Financiero', parent: 'PROCRED', label: 'Préstamo Financiero' },
  { value: 'Prendarios', parent: 'PROCRED', label: 'Prendarios' },
  { value: 'Operativo UIF - 2da Etapa', parent: 'UAL', label: 'Operativo UIF - 2da Etapa' },
  { value: 'Actualización legajos - asignación de perfil', parent: 'UAL', label: 'Actualización legajos - asignación de perfil' },
  { value: 'Embargos', parent: 'Oficios', label: 'Embargos' },
  { value: 'Pedido de Informe', parent: 'Oficios', label: 'Pedido de Informe' },
  { value: 'Pedido de Informe Cédula', parent: 'Oficios', label: 'Pedido de Informe Cédula' },
  { value: 'Pedido de Informe Datos Personales', parent: 'Oficios', label: 'Pedido de Informe Datos Personales' },
  { value: 'Ordenes de No Pagar', parent: 'Oficios', label: 'Ordenes de No Pagar' },
  { value: 'Amparos', parent: 'Amparos', label: 'Amparos' },
  { value: 'Contratos y Poderes: Clientes a vincular', parent: 'Originacion Mayorista', label: 'Contratos y Poderes: Clientes a vincular' },
  { value: 'Balance SAAR', parent: 'Originacion Mayorista', label: 'Balance SAAR' },
  { value: 'Contratos y Poderes: Modificaciones', parent: 'Originacion Mayorista', label: 'Contratos y Poderes: Modificaciones' },
  { value: 'Balances SOAM', parent: 'Originacion Mayorista', label: 'Balances SOAM' },
  { value: 'Formulario Agropecuario (ex 825)', parent: 'Originacion Mayorista', label: 'Formulario Agropecuario (ex 825)' },
  { value: 'Envio Documentacion', parent: 'Originacion Mayorista', label: 'Envio Documentacion' },
  { value: 'Estatutos', parent: 'Originacion Mayorista', label: 'Estatutos' },
  { value: 'Alta Convenios', parent: 'Originacion Mayorista', label: 'Alta Convenios' },
  { value: 'Auditoria', parent: 'Originacion Mayorista', label: 'Auditoria' },
  { value: 'Apertura', parent: 'SIO Digitalizacion', label: 'Apertura' },
  { value: 'Calificacion', parent: 'SIO Digitalizacion', label: 'Calificacion' },
  { value: 'Apertura con Calificacion', parent: 'SIO Digitalizacion', label: 'Apertura con Calificacion' },
  { value: 'Calificacion Extraordinaria', parent: 'SIO Digitalizacion', label: 'Calificacion Extraordinaria' },
  { value: 'Revision de riesgo', parent: 'SIO Digitalizacion', label: 'Revision de riesgo' },
  { value: 'Calificacion SIC', parent: 'SIO Digitalizacion', label: 'Calificacion SIC' },
  { value: 'Comercio', parent: 'Originacion Minorista', label: 'Comercio' },
  { value: 'Carpeta Digital', parent: 'Banca Financiera', label: 'Carpeta Digital' },
  { value: 'Carta ANSES', parent: 'Banca Financiera', label: 'Carta ANSES' },
  { value: 'Transferencia de titulos', parent: 'Banca Financiera', label: 'Transferencia de titulos' },
  { value: 'Compra - Venta de titulos', parent: 'Banca Financiera', label: 'Compra - Venta de titulos' },
  { value: 'Desembolso de Fideicomisos', parent: 'Banca Financiera', label: 'Desembolso de Fideicomisos' },
  { value: 'Carta de ADRs', parent: 'Banca Financiera', label: 'Carta de ADRs' },
  { value: 'Transferencia monetaria por compensaciones', parent: 'Banca Financiera', label: 'Transferencia monetaria por compensaciones' },
  { value: 'Orden de compra por licitaciones primarias', parent: 'Banca Financiera', label: 'Orden de compra por licitaciones primarias' },
  {
    value: 'Notas operaciones de licitaciones primarias',
    parent: 'Banca Financiera',
    label: 'Notas operaciones de licitaciones primarias',
  },
  { value: 'FIMA', parent: 'Banca Financiera', label: 'FIMA' },
  { value: 'Movimiento cuentas monetarias', parent: 'Banca Financiera', label: 'Movimiento cuentas monetarias' },
  { value: 'Cambios', parent: 'Banca Financiera', label: 'Cambios' },
  { value: 'Carta de aceptacion de forward', parent: 'Banca Financiera', label: 'Carta de aceptacion de forward' },
  { value: 'Instrucciones permanentes', parent: 'Banca Financiera', label: 'Instrucciones permanentes' },
  { value: 'Otros BOI', parent: 'Banca Financiera', label: 'Otros BOI' },
  { value: 'Cuenta Corriente', parent: 'Banca Financiera', label: 'Cuenta Corriente' },
  { value: 'Plazo Fijo', parent: 'Banca Financiera', label: 'Plazo Fijo' },
  { value: 'Plazo Fijo Titulo De Valores', parent: 'Banca Financiera', label: 'Plazo Fijo Titulo De Valores' },
  { value: 'Transferencia Cuota Parte', parent: 'Banca Financiera', label: 'Transferencia Cuota Parte' },
  { value: 'Empresa SAS', parent: 'Originacion', label: 'Empresa SAS' },
  { value: 'Prestamos Hipotecarios', parent: 'Originacion', label: 'Prestamos Hipotecarios' },
  { value: 'Venta Digitales Paquetes', parent: 'Originacion', label: 'Venta Digitales Paquetes' },
  { value: 'Prestamos Personales', parent: 'Originacion', label: 'Prestamos Personales' },
  { value: 'Prestamos Financieros', parent: 'Originacion', label: 'Prestamos Financieros' },
  { value: 'Galicia Convenios', parent: 'Originacion', label: 'Galicia Convenios' },
  { value: 'Cartas de crédito de Exportación', parent: 'Comercio Exterior', label: 'Cartas de crédito de Exportación' },
  { value: 'Cartas de crédito de Importación', parent: 'Comercio Exterior', label: 'Cartas de crédito de Importación' },
  { value: 'Cobranzas de Exportación', parent: 'Comercio Exterior', label: 'Cobranzas de Exportación' },
  { value: 'Cobranzas de Importación', parent: 'Comercio Exterior', label: 'Cobranzas de Importación' },
  { value: 'Ordenes de Pago/Transferencias', parent: 'Comercio Exterior', label: 'Ordenes de Pago/Transferencias' },
  { value: 'Leasing', parent: 'Comercio Exterior', label: 'Leasing' },
  { value: 'Préstamos/Financiaciones', parent: 'Comercio Exterior', label: 'Préstamos/Financiaciones' },
  { value: 'Stand by/Garantía', parent: 'Comercio Exterior', label: 'Stand by/Garantía' },
  { value: 'DDJJ/Notas/Seguimientos', parent: 'Comercio Exterior', label: 'DDJJ/Notas/Seguimientos' },
  { value: 'Ordenes de pago', parent: 'Comercio Exterior', label: 'Ordenes de pago' },
  { value: 'Transferencias', parent: 'Comercio Exterior', label: 'Transferencias' },
  { value: 'Perfil Inversor', parent: 'Perfil Inversor', label: 'Perfil Inversor' },
  { value: 'Estatutos', parent: 'Empresas', label: 'Estatutos' },
  { value: 'Legajo Digital', parent: 'Legajo Digital', label: 'Legajo Digital' },
  { value: 'Leasing', parent: 'Legajo Digital', label: 'Leasing' },
  { value: 'Recupero Legajos Fisicos', parent: 'Legajo Digital', label: 'Recupero Legajos Fisicos' },
  { value: 'Normativas Gestion Regulatoria', parent: 'Normativas Gestion Regulatoria', label: 'Normativas Gestion Regulatoria' },
];

interface Item {
  label: string;
  value: string;
  parent?: string;
}

interface TableFilter {
  key: string;
  title: string;
  type: FilterType;
  items?: Item[];
  value?: string | number;
  onChange?: Function;
}

function renderEstado(estado: string) {
  let color;

  switch (estado) {
    case 'ENVIADO':
      color = 'green';
      break;
    case 'DISPONIBLE':
      color = 'blue';
      break;
    case 'RECIBIDO':
      color = 'purple';
      break;
    case 'ERROR':
      color = 'red';
      break;
    default:
      color = 'gold';
      break;
  }

  return (
    <Tag style={{ margin: 0 }} color={color}>
      {estado}
    </Tag>
  );
}

const columns = [
  {
    key: 'proceso',
    dataIndex: 'proceso',
    title: 'Proceso',
    //  width: 200,
  },
  {
    key: 'subproceso',
    dataIndex: 'subproceso',
    title: 'Subproceso',
    // width: 200,
  },
  {
    key: 'idOperacion',
    dataIndex: 'idOperacion',
    title: 'ID Operación',
    //   width: 300,
  },
  {
    key: 'solicitud',
    dataIndex: 'solicitud',
    title: 'Solicitud',
    //  width: 300,
  },
  {
    key: 'documentoCliente',
    dataIndex: 'documentoCliente',
    title: 'Documento Cliente',
    //  width: 300,
  },
  {
    key: 'nombreCliente',
    dataIndex: 'nombreCliente',
    title: 'Cliente',
    //  width: 300,
  },
  {
    key: 'fecha',
    dataIndex: 'fecha',
    title: 'Fecha',
    //   width: 300,
    render: (value, record, index) => Moment(value).format('DD/MM/YYYY HH:mm'),
  },
  {
    key: 'estado',
    dataIndex: 'estado',
    title: 'Estado',
    ellipsis: false,
    //   width: 300,
    render: (value, record, index) => renderEstado(value),
  },
  {
    key: 'historial',
    dataIndex: 'historial',
    title: 'Historial',
    //   width: 300,
  },
] as ColumnTypeEx<Solicitud>[];

const _filtros: TableFilter[] = [
  {
    key: 'estado',
    title: 'Estado',
    type: 'list',
    items: [
      { label: 'Envíado', value: 'ENVIADO' },
      { label: 'Disponible', value: 'DISPONIBLE' },
      { label: 'Indexado', value: 'INDEXADO' },
      { label: 'Recibido', value: 'RECIBIDO' },
      { label: 'Error', value: 'ERROR' },
    ],
  },
  {
    key: 'fecha',
    title: 'Fecha',
    type: 'date-range',
  },
  {
    key: 'proceso',
    title: 'Proceso',
    type: 'list',
    items: [...listProcesos],
  },
  {
    key: 'subproceso',
    title: 'Subproceso',
    type: 'list',
    items: [...listSubProcesos],
  },
  {
    key: 'solicitud',
    title: 'Solicitud',
    type: 'number',
  },
  {
    key: 'documentoCliente',
    title: 'Documento Cliente',
    type: 'text',
  },
];

interface DigitalizacionProps {
  buscarEnApi?: (solicitud: SolicitudesRequestBody) => Promise<any>;
  title: string;
}

export const Digitalizaciones: React.FC<DigitalizacionProps> = (props) => {
  const [form] = useForm();
  const [filtros, setFiltros] = useState(_filtros);
  const [dataSource, setDataSource] = useState<Solicitud[]>([]);
  const sesion = useSelector((state: RootState) => state.sesion);
  const [dataSourceComplete, setDataSourceComplete] = useState<Solicitud[]>([]);
  const [procesoSelected, setProcesosSelected] = useState<string>('');
  const [idSolicitud, setIdSolicitud] = useState<number>();
  const [historial, setHistorial] = useState<Historial[]>();

  const mergedColumns = columns.map((column) => {
    if (column.key === 'historial') {
      return {
        ...column,
        render: (value: any, record: Solicitud) => (
          <Button
            type="primary"
            shape="circle"
            style={{ color: '#fa7923', backgroundColor: 'transparent', border: 'none' }}
            onClick={() => mostrarHistorial(record)}
            icon={<EyeOutlined />}></Button>
        ),
      };
    } else {
      return column;
    }
  });

  const mostrarHistorial = (record: Solicitud) => {
    setIdSolicitud(record.solicitud);
  };

  const ocultarHistorial = () => {
    setIdSolicitud(undefined);
    setHistorial(undefined);
  };

  useEffect(() => {
    document.title = 'PUA - Digitalizaciones';
    const getData = async () => {
      props.buscarEnApi &&
        (await props.buscarEnApi({ legajo: sesion.data.legajo! }).then((data) => {
          buildDataSource(data);
        }));
    };
    getData();

    const i = _filtros.find((f) => f.key === 'proceso');
    if (i !== undefined) i.onChange = setProcesosSelected;
  }, []);

  useEffect(() => {
    const i = _filtros.findIndex((f) => f.key === 'subproceso');

    if (procesoSelected !== undefined && procesoSelected !== '') {
      _filtros[i].items = listSubProcesos.filter(function (v: Item) {
        if (v.parent === procesoSelected) return true;
        return false;
      });
    } else {
      _filtros[i].items = [...listSubProcesos];
    }
    setFiltros([..._filtros]);
  }, [procesoSelected]);

  useEffect(() => {
    if (!idSolicitud) return;
    (async () => getHistorial({ id: idSolicitud }))();
  }, [idSolicitud]);

  const buildDataSource = (data: any) => {
    const dataSource = (data as Solicitud[]).map((d, index) => {
      return { ...d, key: d.solicitud, historial: true };
    }) as Solicitud[];
    setDataSource(dataSource);
    setDataSourceComplete(dataSource);
  };

  const handleFilter = async (filters: any) => {
    const dataFilter = dataSourceComplete.filter(function (item: Solicitud) {
      if (
        (filters.Estado === undefined || item.estado === filters.Estado) &&
        (filters['Documento Cliente'] === undefined || item.documentoCliente.includes(filters['Documento Cliente'])) &&
        (filters.Proceso === undefined || item.proceso.includes(filters.Proceso)) &&
        (filters.Subproceso === undefined || item.subproceso.includes(filters.Subproceso)) &&
        (filters.Solicitud === undefined || item.solicitud === filters.Solicitud) &&
        (filters.Fecha === undefined ||
          filters.Fecha === null ||
          (filters.Fecha &&
            filters.Fecha.length > 1 &&
            Moment(item.fecha).isBetween(
              (filters.Fecha[0] as moment.Moment).startOf('day'),
              (filters.Fecha[1] as moment.Moment).endOf('day'),
              undefined,
              '[]',
            )))
      )
        return true;
      return false;
    });
    setDataSource(dataFilter);
  };

  const getHistorial = async (data: HistorialBodyRequest) => {
    const endpoint = getURLs().HistorialSolicitud;

    const config: AxiosRequestConfig = {
      method: 'POST',
      url: endpoint,
      data,
    };
    // Consultar servicio.
    return await axios
      .request<Historial[]>(config)
      .then((response) => {
        if (response.data.length > 0) setHistorial(response.data);
        else message.info('La solicitud no tiene historial para mostrar.');
      })
      .catch((error) => {
        message.error('Error al cargar historial. Por favor intente nuevamente.');
      });
  };

  const renderListFilter = (filter: TableFilter, style?: CSSProperties, mode?: 'multiple' | 'tags') => {
    const { key, title, items, onChange } = filter;

    const list = (
      <Select
        size="small"
        mode={mode}
        allowClear
        onChange={(value, option) => (onChange !== undefined ? onChange(value) : null)}
        onDeselect={(value) => (onChange !== undefined ? onChange(value) : null)}>
        {items!.map((item, index) => (
          <Option key={index} value={item.value}>
            {item.label}
          </Option>
        ))}
      </Select>
    );

    return (
      <Form.Item key={key} name={title} label={title} style={style}>
        {list}
      </Form.Item>
    );
  };

  const renderDateFilter = (filter: TableFilter, style?: CSSProperties) => {
    const { key, title } = filter;

    return (
      <Form.Item key={key} name={title} label={title} style={style}>
        <DatePicker size="small" format="DD/MM/YYYY" locale={locale} style={{ width: '100%' }} />
      </Form.Item>
    );
  };

  const renderDateRangeFilter = (filter: TableFilter, style?: CSSProperties) => {
    const { key, title } = filter;

    return (
      <Form.Item key={key} name={title} label={title} style={style}>
        <DatePicker.RangePicker
          size="small"
          format="DD/MM/YYYY"
          locale={locale}
          ranges={{
            Hoy: [moment().startOf('day'), moment().endOf('day')],
            'Este Mes': [moment().startOf('month'), moment().endOf('month')],
          }}
          style={{ width: '100%' }}
        />
      </Form.Item>
    );
  };

  const renderInputTextFilter = (filter: TableFilter, style?: CSSProperties) => {
    const { key, title } = filter;

    return (
      <Form.Item key={key} name={title} label={title} style={style}>
        <Input size="small" style={{ width: '100%' }} />
      </Form.Item>
    );
  };

  const renderInputNumberFilter = (filter: TableFilter, style?: CSSProperties) => {
    const { key, title } = filter;

    return (
      <Form.Item key={key} name={title} label={title} style={style}>
        <InputNumber size="small" style={{ width: '100%' }} min={0} />
      </Form.Item>
    );
  };

  const renderFilter = (filter: TableFilter) => {
    const type = filter.type;
    const style: CSSProperties = { marginRight: 10, marginBottom: 0, width: 'auto' };

    switch (type) {
      case 'text':
        return renderInputTextFilter(filter, style);
      case 'number':
        return renderInputNumberFilter(filter, style);
      case 'date':
        return renderDateFilter(filter, style);
      case 'date-range':
        return renderDateRangeFilter(filter, style);
      case 'list':
        return renderListFilter(filter, { ...style /*width: '260px'*/ });
      default:
        break;
    }
  };

  const renderFilters = () => {
    const chunks = _.chunk(filtros, 2);
    return (
      <Collapse defaultActiveKey="Filtros" accordion style={{ width: '100%' }}>
        <Panel key="Filtros" header="Filtros" style={{ paddingBottom: 0 }}>
          <Form form={form} onFinish={handleFilter}>
            <Row style={{ alignItems: 'flex-end' }}>
              {chunks.map((filtros, index) => {
                return (
                  <Col
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      width: `calc(100%/${chunks.length})`,
                      minWidth: 300,
                    }}>
                    {filtros.map((filtro) => renderFilter(filtro))}
                  </Col>
                );
              })}
            </Row>
            <Row style={{ alignItems: 'flex-end', marginTop: 10, marginRight: 10 }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: '#fa7923', border: 'none', marginLeft: 'auto', marginRight: 10 }}>
                Filtrar
              </Button>
              <Button
                style={{ color: '#fa7923', borderColor: '#fa7923' }}
                onClick={() => {
                  form.resetFields();
                  form.submit();
                }}>
                Limpiar
              </Button>
            </Row>
          </Form>
        </Panel>
      </Collapse>
    );
  };

  const Tabla = () => {
    return (
      <Table
        // header={{ noAdd: true, noRemove: true, noReflesh: true, moreActions: () => renderFilters() }}
        size={'large'}
        /*  scroll={{ y: 'auto' }} */
        columns={mergedColumns as ColumnsType<any>}
        dataSource={dataSource}
        sortable
        pagination={{ pageSize: 10 }}
        extraColumns={{ showKeyColumn: false, showActionsColumn: false }}
        extraComponents={[
          {
            key: 'filters',
            node: renderFilters(),
            position: 'top',
            style: { width: '100%' },
          },
          {
            key: 'records-count-tag',
            node: 'records-count-tag',
            position: 'top',
            style: { marginLeft: 'auto', display: 'table' },
          },
        ]}
      //   pagination={{ pageSize: 10, position: ['bottomRight'] }}
      // setData={setDataSource}
      />
    );
  };

  const exportToExcel = (nombre: string) => {
    const data = dataSource.map((d) => {
      return {
        Proceso: d.proceso,
        Subproceso: d.subproceso,
        'ID Operación': d.idOperacion,
        Solicitud: d.solicitud,
        'Documento Cliente': d.documentoCliente,
        Cliente: d.nombreCliente,
        Fecha: d.fecha ? moment(d.fecha).format('DD/MM/YYYY HH:mm') : '',
        Estado: d.estado.toUpperCase(),
      };
    });
    exportToCSV2(nombre, data);
  };

  return (
    <Wrapper contentWrapper unselectable direction="column" horizontal="center" style={{ padding: 0 }}>
      <PageHeader
        className="site-page-header"
        title={props.title}
        extra={[
          <ExportButton disabled={dataSource == null || dataSource.length == 0} onClick={() => exportToExcel(props.title + ' Grilla')} />,
        ]}
        style={{ width: '100%' }}
      />
      <Tabla />
      {historial && (
        <Modal
          title={`Historial - Solicitud: ${idSolicitud}`}
          centered
          visible={!!historial}
          footer={null}
          destroyOnClose={true}
          //width="30%"
          onCancel={() => ocultarHistorial()}>
          <Historial historial={historial}></Historial>
        </Modal>
      )}
    </Wrapper>
  );
};

export const Historial: React.FC<HistorialProps> = (props) => {
  const { historial } = props;

  return (
    <Timeline mode={'left'}>
      {historial?.map((h, index) => (
        <Timeline.Item key={index} label={<p style={{ fontWeight: 'bold' }}>{h.estado}</p>}>
          <p>{h.usuario}</p>
          <p>{moment(h.fecha).format('DD/MM/YYYY HH:mm')}</p>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};
