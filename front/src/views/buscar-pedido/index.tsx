import { EyeOutlined } from '@ant-design/icons';
import { Button, Collapse, Modal, Space, Table, Tag } from 'antd';
import axios, { CancelTokenSource } from 'axios';
import { default as Moment, default as moment } from 'moment';
import React, { ReactText, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IFilterItem, IItemValue } from '../../components/filter-input/types';
import { SearchFilter } from '../../components/search-filter';
import { RootState } from '../../reducers';
import { cancelRequest, executeWS, getValuesOfFilter } from '../../utils/axiosAPI';
import { getURLs } from '../../utils/ConfigurationServices';
import { exportToCSV2 } from '../../utils/ExportExcel';
import { renderEstadoPedido } from '../../utils/renderEstados';
import { TableRowSelection } from 'antd/lib/table/interface';
import { ExportButton } from 'src/components/export-button';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';
import filters from './filtersPedido.json';
import styles from './style.module.less';
import { ViewContenidoPedidoProps, ViewDetailPedidoProps, ViewPedido } from 'src/components/view-pedido';
import { ActionsDropdown } from 'src/features/acciones/dropdown';
import { useAppDispatch } from 'src/store';
import { setDropdownActions } from 'src/features/acciones/acciones.slice';
import { AplicarAccionResponseBody } from 'src/features/acciones/types';
import { ColumnTypeEx } from 'src/components/table';
import { compare } from 'src/utils/string';
import { Loading } from 'src/components/loading';
import { IElement } from 'src/types';
import _ from 'lodash';
import { renderActionValidation } from 'src/utils/actions';
import { ActionModal } from 'src/features/acciones/modal';

export interface ColumnsViewProps {
  name: string;
  type: string;
  title: string;
}

const { Column } = Table;
const { Panel } = Collapse;

export interface ResultadoBusquedaPedido extends IElement {
  Número: number;
  Observaciones: string;
  Estado: string;
  'Fecha generación': string;
  'Suc / CC Destino': string;
}

const previewColumns = [
  {
    key: 'id',
    dataIndex: 'id',
    title: 'Número',
    width: 100,
    sorter: { compare: (a, b) => compare(+a.id, +b.id), multiple: -1 },
  },
  {
    key: 'fechaAlta',
    dataIndex: 'fechaAlta',
    title: 'Fecha generación',
    width: 200,
    sorter: { compare: (a, b) => compare(a.fechaAlta, b.fechaAlta), multiple: -1 },
    render: (value) => moment(value).format('DD/MM/YYYY'),
  },
  {
    key: 'respuesta',
    dataIndex: 'respuesta',
    title: 'Descripción',
    width: 250,
    sorter: { compare: (a, b) => compare(a.respuesta, b.respuesta), multiple: -1 },
  },
] as ColumnTypeEx<any>[];

const filtersAvailable: IFilterItem[] = filters;

const CancelToken = axios.CancelToken;
let source: CancelTokenSource;

export const SearchPedido: React.FC = () => {
  const sesion = useSelector((state: RootState) => state.sesion);
  const api = apis['CONSULTA_PEDIDOS'];
  const resource = api.resources['BUSCAR_PEDIDOS'];
  const config = buildAxiosRequestConfig(api, resource, { data: { idUsuario: sesion.data.idUsuario } });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [panelActive, setPanelActive] = useState<string | string[]>('1');
  const [detailPedido, setDetailPedido] = useState<ViewDetailPedidoProps | undefined>(undefined);
  const [detailContenidoPedido, setDetailContenidoPedido] = useState<ViewContenidoPedidoProps[] | undefined>(undefined);
  const [visibleModal, setVisibleModal] = useState(false);
  const [selectedRowsId, setSelectedRows] = useState<ReactText[]>([]); // guarda estado de los check de la tabla
  const [stateList, setStateList] = useState<IItemValue[]>([]);
  const [currentState, setCurrentState] = useState<{ estadoFiltro?: string; estado?: string; codigo?: number }>({});
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const acciones = useSelector((state: RootState) => state.acciones);

  const mergedPreviewColumns = previewColumns.map((column) => {
    if (column.key === 'respuesta') {
      return {
        ...column,
        render: (value: React.ReactNode, record: any) => (acciones.loading ? <Loading /> : renderActionValidation(record)),
      };
    } else return column;
  });

  useEffect(() => {
    uncheckedRows();
    setCurrentPage(1);
  }, [pedidos]);

  useEffect(() => {
    const codigo = stateList.find((state) => state.id === currentState.estado)?.codigo;
    if (codigo === currentState.codigo) return;
    setCurrentState({ ...currentState, codigo });
  }, [currentState]);

  useEffect(() => {
    const disabled = !(
      currentState.estadoFiltro === 'igual' &&
      selectedRowsId.length > 0 &&
      acciones.data.dropdown?.acciones?.lista &&
      acciones.data.dropdown.acciones.lista.length > 0
    );
    acciones.data.dropdown?.disabled !== disabled && dispatch(setDropdownActions({ disabled }));
  }, [selectedRowsId, acciones.data.dropdown?.acciones]);

  useEffect(() => {
    const getData = async () => {
      // obtiene estados
      await getValuesOfFilter<IItemValue[]>(
        { method: 'POST', url: getURLs().ObtenerEstados, data: { tipoContenido: 'pedido' } },
        setListValueEstado,
        'Estado',
      );
      // obtiene sectores
      await getValuesOfFilter<IItemValue[]>({ method: 'POST', url: getURLs().ObtenerSectores }, setListValue, ['Suc/CC Destino']);
    };
    getData();
    setPanelActive('1');
  }, []);

  useEffect(() => {
    setVisibleModal(detailPedido != undefined);
  }, [detailPedido]);

  useEffect(() => {
    if (!visibleModal) cancelRequest(source);
  }, [visibleModal]);

  useEffect(() => {
    const previewResultados = acciones.data.resultados?.map((r) => ({ ...r, id: r.idElemento, estadoRespuesta: r.estado }));

    if (previewResultados) {
      const merged = _.merge(_.keyBy(previewResultados, 'id'), _.keyBy(selectedData, 'id'));
      const values = _.values(merged);

      setSelectedData(values);
    }
  }, [acciones.data.resultados]);

  const updateResult = (values: any, openResult: boolean, searchParams: any) => {
    setCurrentState({ ...searchParams });

    setPedidos(values);
    if (openResult) setPanelActive('2');
  };

  const setListValue = (label: string, values: IItemValue[]) => {
    const i = filtersAvailable.find((i) => i.label === label);
    if (i) i.listValues = values;
  };

  const setListValueEstado = (label: string, values: IItemValue[]) => {
    const i = filtersAvailable.find((i) => i.label === label);
    values.forEach((v) => {
      v.codigo = +v.id;
      v.id = v.descripcion;
    });
    setStateList(values);
    if (i) i.listValues = values;
  };

  /* MANEJO DE CHECKBOX DE TABLE */
  const onSelectChange = (selectedRowKeys: ReactText[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: selectedRowsId,
    //onSelectAll: onSelectAllDocuments,
    onChange: onSelectChange,
  } as TableRowSelection<any>;

  /* DETALLE DE PEDIDO */
  const openDetailModal = (numero: number) => {
    // obtiene detalle de pedido
    var api = apis['INFO_PEDIDO'];
    var res = api.resources['INFO_PEDIDO'];
    const confDetalle = buildAxiosRequestConfig(api, res, { data: { id: numero } });

    executeWS<ViewDetailPedidoProps>(confDetalle, setDetailPedido);

    // obtiene contenido de pedido
    res = api.resources['OBTENER_CONTENIDO'];
    const confContenido = buildAxiosRequestConfig(api, res, { data: { id: numero } });
    executeWS<ViewContenidoPedidoProps[]>(confContenido, setDetailContenidoPedido);
  };

  /* EXPORTAR A EXCEL */
  const exportToExcel = () => {
    const data = pedidos.map((d) => {
      return {
        Número: d.id,
        Observaciones: d.observaciones,
        Estado: renderEstadoPedido(d.estado),
        'Fecha generación': d.fechaAlta ? moment(d.fechaAlta).format('DD/MM/YYYY') : '',
        'Suc / CC Destino': d.idSectorDestino + ' - ' + d.sectorDestino,
      } as ResultadoBusquedaPedido;
    });
    exportToCSV2(`Pedidos - ${moment().format('DD-MM-YYYY HH.mm [hs]')}`, data);
  };

  const clearDetailModal = () => {
    setDetailPedido(undefined);
  };

  const addToPreview = () => {
    let rows: any[] = [];
    selectedRowsId.forEach((rowId) => {
      rows.push(
        pedidos.find((pedido) => {
          return pedido.id === rowId;
        }),
      );
    });
    setSelectedData(rows);
  };

  const uncheckedRows = () => {
    setSelectedRows([]);
  };

  const updatePedidos = (response: AplicarAccionResponseBody) => {
    let pedidosOk = response.filter((res) => res.estado === 'Ok').map((res) => res.idElemento);
    const pedidosFiltrados = pedidos.filter((pedido) => !pedidosOk?.includes(pedido.id));
    setPedidos(pedidosFiltrados);
    uncheckedRows();
  };

  return (
    <div className={`wrapper unselectable ${styles.content}`}>
      <Collapse accordion activeKey={panelActive} style={{ width: '100%' }} onChange={(key) => setPanelActive(key)}>
        <Panel header="Filtros de Búsqueda de Pedido" key="1">
          <SearchFilter didSearched={updateResult} wsConfig={config} className={styles.filters} filters={filtersAvailable}></SearchFilter>
        </Panel>
        <Panel header="Resultados" key="2">
          <Space>
            {pedidos.length > 0 && (
              <>
                <ExportButton onClick={() => exportToExcel()} />
                <ActionsDropdown
                  tipoElemento="PE"
                  idEstadoActual={currentState.codigo!}
                  idUsuario={sesion.data.idUsuario!}
                  onClick={addToPreview}
                />
              </>
            )}
          </Space>
          <div className="table-style">
            <span style={{ marginBottom: 4, float: 'right', visibility: pedidos.length > 0 ? 'visible' : 'hidden' }}>
              <Tag color="orange">Cantidad de registros: {pedidos.length}</Tag>
            </span>
            <Table
              dataSource={pedidos}
              rowKey="id"
              rowSelection={rowSelection}
              pagination={{ pageSize: 5, current: currentPage, onChange: (page) => setCurrentPage(page) }}>
              <Column title="Número" dataIndex="id" key="id" align="center" />
              <Column title="Observaciones" dataIndex="observaciones" key="observaciones" ellipsis={true} />
              <Column
                title="Estado"
                dataIndex="estado"
                key="estado"
                ellipsis={true}
                render={(text) => {
                  return renderEstadoPedido(text);
                }}
              />
              <Column
                title="Fecha generación"
                dataIndex="fechaAlta"
                key="fechaAlta"
                render={(text) => {
                  return Moment(text).format('DD/MM/YYYY');
                }}
              />
              <Column
                title="Suc / CC Destino"
                dataIndex="sectorOrigen"
                key="sectorOrigen"
                render={(text, record: any) => {
                  return `${record.idSectorDestino} - ${record.sectorDestino}`;
                }}
              />
              <Column
                title="Detalle"
                key="detalle"
                dataIndex="id"
                ellipsis={true}
                render={(text: number, record: any) => {
                  return (
                    <Button
                      type="primary"
                      shape="circle"
                      onClick={() => openDetailModal(text)}
                      style={{ color: '#fa7923', backgroundColor: 'transparent', border: 'none' }}
                      icon={<EyeOutlined />}></Button>
                  );
                }}
              />
            </Table>
          </div>
        </Panel>
      </Collapse>
      <ActionModal
        type="PE"
        title={acciones.data.dropdown?.acciones?.seleccionada?.descripcion}
        visible={acciones.data.modal?.visible}
        table={{ columns: mergedPreviewColumns, dataSource: selectedData }}
        onSuccess={updatePedidos}
      />
      <Modal
        title="Ver Pedido"
        centered
        visible={visibleModal}
        footer={null}
        //destroyOnClose={true}
        width="80%"
        onCancel={() => setVisibleModal(false)}
        afterClose={clearDetailModal}>
        <ViewPedido data={detailPedido} detail={detailContenidoPedido}></ViewPedido>
      </Modal>
    </div>
  );
};
