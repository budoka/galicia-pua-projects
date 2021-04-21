import { Button, DatePicker, Divider, Form, Input, message, PageHeader, Pagination, Select, Table, Tag } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import 'moment-timezone';
import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';
import { useHistory } from 'react-router-dom';
import { ExportButton } from 'src/components/export-button';
import { formatDate } from 'src/utils/Common';
import { FilterRequest } from '../../../types/FilterRequest';
import { PendienteDetalle } from '../../../types/PendienteDetalle';
import { exportToCSV } from '../../../utils/ExportExcel';
import styles from './style.module.less';

const { Column } = Table;

const { Option } = Select;

const rowSelection = {
  onChange: (selectedRowKeys: any, selectedRows: any) => { },
};

interface PendientesProps {
  buscarEnApi: (type: string, page?: number, pageSize?: number | undefined, filter?: FilterRequest) => Promise<any>;
  title: string;
  type: string;
}

export const Pendientes: React.FC<PendientesProps> = (props: PendientesProps) => {
  const [pendientesPaginado, setPendientesPaginado] = useState<PendienteDetalle[]>([]);
  const [pendientesTotales, setPendientesTotales] = useState<PendienteDetalle[]>([]);
  const [form] = useForm<any>();
  const [itemsPerPage] = useState<number>(8);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sectores, setSectores] = useState<string[]>([]);
  //const [fechaDesde, setFechaDesde] = useState<string>();
  //const [fechaHasta, setFechaHasta] = useState<string>();
  const [fechaDocumentacionDesde, setFechaDocumentacionDesde] = useState<moment.Moment | null>(null);
  const [fechaDocumentacionHasta, setFechaDocumentacionHasta] = useState<moment.Moment | null>(null);
  const [centroCosto, setCentroCosto] = useState<string>();
  const [nombre, setNombre] = useState<string>();
  const [searching, setSearching] = useState<boolean>(false);
  const history = useHistory();

  const obtenerSectores = (pendientes: PendienteDetalle[]): string[] => {
    let sectores: string[] = ['Todos'];
    let i: number;
    pendientes.forEach((p) => {
      if (!sectores.includes(p.sector)) sectores.push(p.sector);
    });
    return sectores;
  };

  useEffect(() => {
    document.title = 'PUA - Tareas Pendientes';
    setSearching(true);
    props
      .buscarEnApi(props.type, 1, itemsPerPage)
      .then((pend) => {
        setPendientesPaginado(pend);
        props.buscarEnApi(props.type)
          .then((pend) => {
            setPendientesTotales(pend);
            setSectores(obtenerSectores(pend));
            setSearching(false);
          })
      })
      .catch(() => {
        message.error("Hubo un error buscando los resultados. Intente de nuevo")
        setSearching(false)
      })
  }, []);

  const filter = (): FilterRequest => {
    return {
      fechaDesde: fechaDocumentacionDesde ? formatDate(fechaDocumentacionDesde.toDate()) : undefined,
      fechaHasta: fechaDocumentacionHasta ? formatDate(fechaDocumentacionHasta.toDate()) : undefined,
      nombre: nombre,
      ccFiltro: centroCosto === 'Todos' ? undefined : centroCosto, // === 'Todos' ? undefined : centroCosto
    };
  };

  const onFinish = async (values: any) => {
    if (fechaDocumentacionDesde && fechaDocumentacionHasta && fechaDocumentacionDesde > fechaDocumentacionHasta) return;
    setSearching(true);
    props
      .buscarEnApi(props.type, 1, itemsPerPage, filter())
      .then((pend) => {
        setCurrentPage(1);
        setPendientesPaginado(pend);
        props.buscarEnApi(props.type, undefined, undefined, filter()).then((pend) => {
          setPendientesTotales(pend);
          setSearching(false);
        })
          .catch(() => {
            message.error("Hubo un error buscando los resultados. Intente de nuevo")
            setSearching(false);
          })
      })
  };

  const estadoRender = (codigo: string) => {
    switch (codigo) {
      case 'PendienteEnvio':
        return <Tag color="blue">Pendiente Envio</Tag>;
      case 'PendienteCierre':
        return <Tag color="geekblue">Pendiente Cierre</Tag>;
      default:
        return <Tag color="gold">{codigo}</Tag>;
    }
  };

  const jumpToPath = (id: number) => {
    history.push({
      pathname: '/editarCaja',
      search: '?id=' + id,
    });
  };

  // select the row
  const onClickRow = (record: any) => {
    return {
      onClick: () => {
        if (props.type === 'PendienteCierre') jumpToPath(parseInt(record.numero));
      },
    };

  };

  const buildExportTemplate = (pendientes: PendienteDetalle[]) => {
    let ret: any[] = [];
    pendientes.forEach((p) => {
      ret.push({
        descripcion: p.descripcion,
        elemento: p.elemento,
        estado: p.estado,
        fechaEmision: p.fechaEmision,
        sector: p.sector,
        usuario: p.usuario,
      });
    });
    return ret;
  };

  const initialState = () => {
    setCentroCosto(undefined);
    setFechaDocumentacionDesde(null);
    setFechaDocumentacionHasta(null);
    setNombre(undefined);
  };

  const handleReset = () => {
    initialState();
    form.resetFields();
  };

  const formItemLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 20 },
  };

  const invalidFechaDesde = () => {
    return fechaDocumentacionDesde && fechaDocumentacionHasta && fechaDocumentacionDesde > fechaDocumentacionHasta;
  };

  const invalidFechaHasta = () => {
    return fechaDocumentacionDesde && fechaDocumentacionHasta && fechaDocumentacionHasta < fechaDocumentacionDesde;
  };

  const helpFechaDesde = () => {
    if (fechaDocumentacionDesde && fechaDocumentacionHasta && fechaDocumentacionDesde > fechaDocumentacionHasta) {
      return 'FechaDesde';
    } else {
      return undefined;
    }
  };

  const helpFechaHasta = () => {
    if (fechaDocumentacionDesde && fechaDocumentacionHasta && fechaDocumentacionHasta < fechaDocumentacionDesde) {
      return 'FechaHasta ';
    } else {
      return undefined;
    }
  };

  const applyMayus = (palabra: string): string => {
    let original = palabra.charAt(0);
    let mayus = palabra.charAt(0).toUpperCase();
    return palabra.replace(original, mayus);
  };

  const slices = (text: string): string => {
    if (text?.length > 50) {
      return text.slice(0, 51) + ' ...';
    } else {
      return text;
    }
  };

  return (
    <div className={`wrapper unselectable ${styles.content}`}>
      <PageHeader
        className="site-page-header"
        title={props.title}
        extra={[
          <ExportButton
            disabled={pendientesTotales.length === 0}
            onClick={() => exportToCSV(props.title + ' Grilla', buildExportTemplate(pendientesTotales))}
          />,
        ]}
      />
      <Divider />
      <div className={styles.form}>
        <Form form={form} {...formItemLayout} layout={'inline'} name="parametros" onFinish={onFinish}>
          <Form.Item name="sector" label="Sector" initialValue={'Todos'} onReset={() => setCentroCosto('Todos')}>
            <Select
              value={centroCosto}
              onChange={(e) => {
                setCentroCosto(e as string);
              }}>
              {sectores.map((sector, index) => {
                return (
                  <Option key={index} value={sector}>
                    {sector}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            label="Fecha Desde"
            name="FechaDesde"
            hasFeedback={!!fechaDocumentacionDesde}
            help={helpFechaDesde()}
            validateStatus={invalidFechaDesde() ? 'error' : fechaDocumentacionDesde ? 'success' : undefined}
            onReset={() => setFechaDocumentacionDesde(null)}>
            <DatePicker
              value={fechaDocumentacionDesde}
              onChange={(e) => setFechaDocumentacionDesde(e)}
              placeholder="dd/mm/aaaa"
              format={'DD/MM/YYYY'}
            />
          </Form.Item>

          <Form.Item
            label="Fecha Hasta"
            name="FechaHasta"
            hasFeedback={!!fechaDocumentacionHasta}
            help={helpFechaHasta()}
            validateStatus={invalidFechaHasta() ? 'error' : fechaDocumentacionHasta ? 'success' : undefined}
            onReset={() => setFechaDocumentacionHasta(null)}>
            <DatePicker
              value={fechaDocumentacionHasta}
              onChange={(e) => setFechaDocumentacionHasta(e)}
              placeholder="dd/mm/aaaa"
              format={'DD/MM/YYYY'}
            />
          </Form.Item>

          <Form.Item name="usuario" label="Usuario" style={{ minWidth: '280px' }}>
            <Input
              type="text"
              maxLength={40}
              placeholder="Ingrese un nombre de usuario"
              value={nombre}
              onChange={(e) => setNombre(e.currentTarget.value)}
              allowClear
              onReset={() => setNombre(undefined)}
            />
          </Form.Item>

          <Form.Item noStyle>
            <Button type="primary" htmlType="submit" loading={searching}>
              Buscar
            </Button>
          </Form.Item>
          <Form.Item noStyle>
            <Button type="link" htmlType="button" onClick={handleReset} disabled={searching}>
              Limpiar
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="table-style">
        <Table
          dataSource={pendientesPaginado}
          pagination={false}
          rowSelection={rowSelection}
          rowKey="numero"
          style={{ cursor: props.type === 'PendienteCierre' ? 'pointer' : undefined }}
          onRow={onClickRow}
          loading={searching}>
          <Column title="Descripción" width={'25%'} dataIndex="descripcion" key="descripcion" render={(text: string) => slices(text)} />
          <Column title="Elemento" width={'10%'} dataIndex="elemento" key="elemento" render={(text: string) => applyMayus(text)} />
          <Column title="Estado" width={'15%'} dataIndex="estado" key="estado" render={(text: string) => estadoRender(text)} />
          <Column
            title="Fecha de Emisión"
            width={'10%'}
            dataIndex="fechaEmision"
            key="fechaEmision"
            render={(text) => (
              <Moment utc format="DD/MM/YYYY">
                {text}
              </Moment>
            )}
          />
          <Column title="Sector" width={'10%'} dataIndex="sector" key="sector" />
          <Column title="Usuario" dataIndex="usuario" key="usuario" />
        </Table>

        <Pagination
          style={{ marginTop: '10px', float: 'right' }}
          total={pendientesTotales.length}
          defaultPageSize={itemsPerPage}
          defaultCurrent={1}
          current={currentPage}
          disabled={pendientesTotales.length === 0}
          showSizeChanger={false}
          onChange={(page: number, pageSize: number | undefined) => {
            setSearching(true);
            props.buscarEnApi(props.type, page, pageSize, filter())
              .then((pend) => {
                setCurrentPage(page);
                setPendientesPaginado(pend);
                setSearching(false);
              })
              .catch(() => {
                message.error("Hubo un error buscando los resultados. Intente de nuevo")
                setSearching(false);
              })
          }}
        />
        <p className={styles.total}>Total: {pendientesTotales.length}</p>
      </div>
    </div>
  );
};
