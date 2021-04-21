import React, { ReactText, useEffect, useState } from 'react';
import { SearchFilter } from '../../components/search-filter';
import { default as Moment, default as moment } from 'moment';
import { IFilterItem, IItemValue } from '../../components/filter-input/types';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { Button, Collapse, Modal, Space, Table, Tag, Tooltip } from 'antd';
import { EyeOutlined, PlusOutlined, FileExcelOutlined } from '@ant-design/icons';
import { executeWS, getValuesOfFilter } from '../../utils/axiosAPI';
import { getURLs } from '../../utils/ConfigurationServices';
import { ViewCaja, ViewDetailtCajaProps } from '../../components/view-caja';
import { useHistory } from 'react-router';
import { exportToCSV2 } from '../../utils/ExportExcel';
import { renderEstadoCaja } from '../../utils/renderEstados';
import { useSelector } from 'react-redux';
import { TableModal } from '../../components/table-modal';
import { IElement } from '../../types';
import { Texts } from '../../constants/texts';
import { compare } from '../../utils/string';
import { ColumnTypeEx } from '../../components/table';
import { RootState } from '../../reducers';
import { useAppDispatch } from '../../store';
import { canAddToCart, renderValidation } from '../../utils/cart';
import { unwrapResult } from '@reduxjs/toolkit';
import _ from 'lodash';
import { Loading } from '../../components/loading';
import { CajaCarrito } from '../../features/carrito/types';
import { addToCarrito, clearPreview } from '../../features/carrito/carrito.slice';
import { AddToCart } from '../../components/add-to-cart-button';
import { TableRowSelection } from 'antd/lib/table/interface';

import filters from './filtersCaja.json';

import styles from './style.module.less';
// import '../../index.scss';
import { ExportButton } from 'src/components/export-button';
import { ActionsDropdown } from 'src/features/acciones/dropdown';
import { setDropdownActions } from 'src/features/acciones/acciones.slice';
import { ActionModal } from 'src/features/acciones/modal';
import { AplicarAccionResponseBody } from 'src/features/acciones/types';
import { renderActionValidation } from 'src/utils/actions';

export interface ColumnsViewProps {
  name: string;
  type: string;
  title: string;
}

const { Column } = Table;
const { Panel } = Collapse;

const columnsToCart: ColumnsViewProps[] = [
  { name: 'numero', type: 'numero', title: 'Número' },
  { name: 'descripcionTipoCaja', type: 'texto', title: 'Tipo' },
  { name: 'descripcion', type: 'texto', title: 'Descripción' },
];

export interface ResultadoBusquedaCaja {
  Número: number;
  Descripción: string;
  Estado: string;
  Tipo: string;
  'Fecha generación': string;
  'Suc / CC Alta': string;
  'Tenencia Suc / CC': string;
}

export interface PreviewCajaCarrito extends IElement {
  id: number;
  tipoCaja: string;
  detalle: string;
  estado: 'Ok' | 'Warning' | 'Error';
  descripcion: string;
}

const previewColumns = [
  {
    key: 'id',
    dataIndex: 'id',
    title: 'ID',
    width: 100,
    sorter: { compare: (a, b) => compare(+a.id, +b.id), multiple: -1 },
  },
  {
    key: 'tipoCaja',
    dataIndex: 'tipoCaja',
    title: Texts.CAJA_TYPE,
    width: 200,
    sorter: { compare: (a, b) => compare(a.tipoCaja, b.tipoCaja), multiple: -1 },
  },
  {
    key: 'detalle',
    dataIndex: 'detalle',
    title: Texts.DESCRIPTION,
    width: 300,
    sorter: { compare: (a, b) => compare(a.detalle, b.detalle), multiple: -1 },
  },
  {
    key: 'descripcion',
    dataIndex: 'descripcion',
    title: Texts.VALIDATION,
    width: 300,
    sorter: { compare: (a, b) => compare(a.descripcion, b.descripcion), multiple: -1 },
  },
] as ColumnTypeEx<PreviewCajaCarrito>[];

const previewColumnsAction = [
  {
    key: 'numero',
    dataIndex: 'numero',
    title: 'Número',
    width: 100,
    sorter: { compare: (a, b) => compare(+a.id, +b.id), multiple: -1 },
  },
  {
    key: 'fechaGeneracion',
    dataIndex: 'fechaGeneracion',
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

export const SearchCaja: React.FC = () => {
  const history = useHistory();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cajas, setCajas] = useState<any[]>([]);
  const [panelActive, setPanelActive] = useState<string | string[]>('1');
  const [detailCaja, setDetailCaja] = useState<ViewDetailtCajaProps | undefined>(undefined);
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleModalCart, setVisibleModalCart] = useState(false);
  const [selectedRows, setSelectedRows] = useState<ReactText[]>([]); // guarda estado de los check de la tabla
  const [selectedData, setSelectedData] = useState<PreviewCajaCarrito[]>([]); // guarda estado de los check de la tabla
  const [selectedDataAction, setSelectedDataAction] = useState<any[]>([]); // guarda estado de los check de la tabla
  const [disabledOkButton, setDisabledOkButton] = useState(false);

  const carritoInvalidStates = ["Destruida", "PendienteRetiro", "DevueltaARetirar", "PendienteCierre", "NotificadoRetiro"];

  const [stateList, setStateList] = useState<IItemValue[]>([]);
  const [currentState, setCurrentState] = useState<{ idEstadoFiltro?: string; idEstado?: string; codigo?: number }>({}); // Usar esto

  const acciones = useSelector((state: RootState) => state.acciones);
  const sesion = useSelector((state: RootState) => state.sesion);
  const carrito = useSelector((state: RootState) => state.carrito);

  const config = {
    method: 'POST',
    url: getURLs().BuscarCajas,
  } as AxiosRequestConfig;

  const dispatch = useAppDispatch();

  const mergedPreviewColumns = previewColumns.map((column) => {
    if (column.key === 'descripcion') {
      return {
        ...column,
        render: (value: React.ReactNode, record: PreviewCajaCarrito) => (carrito.loading ? <Loading /> : renderValidation(record)),
      };
    } else return column;
  });

  const mergedPreviewColumnsAction = previewColumnsAction.map((column) => {
    if (column.key === 'respuesta') {
      return {
        ...column,
        render: (value: React.ReactNode, record: any) => {
          return acciones.loading ? <Loading /> : renderActionValidation(record);
        },
      };
    } else return column;
  });

  useEffect(() => {
    setSelectedRows([]);
    setCurrentPage(1);
  }, [cajas]);

  useEffect(() => {
    const codigo = stateList.find((state) => state.id === currentState.idEstado)?.codigo;
    if (codigo === currentState.codigo) return;
    setCurrentState({ ...currentState, codigo });
  }, [currentState]);

  useEffect(() => {
    const disabled = !(
      currentState.idEstadoFiltro === 'igual' &&
      selectedRows.length > 0 &&
      acciones.data.dropdown?.acciones?.lista &&
      acciones.data.dropdown.acciones.lista.length > 0
    );

    acciones.data.dropdown?.disabled !== disabled && dispatch(setDropdownActions({ disabled }));
  }, [selectedRows, acciones.data.dropdown?.acciones]);

  useEffect(() => {
    const getData = async () => {
      // obtiene estados
      await getValuesOfFilter<IItemValue[]>(
        { method: 'POST', url: getURLs().ObtenerEstados, data: { tipoContenido: 'caja' } },
        setListValueEstado,
        'Estado',
      );

      // obtiene sectores
      await getValuesOfFilter<IItemValue[]>({ method: 'POST', url: getURLs().ObtenerSectores }, setListValue, [
        'Suc/CC Propietario',
        'Tenencia Suc/CC',
      ]);

      // obtiene tipos de caja
      await getValuesOfFilter<IItemValue[]>({ method: 'POST', url: getURLs().TiposDeCajas }, setListValue, ['Tipo de caja']);
    };

    getData();
    setPanelActive('1');
  }, []);

  useEffect(() => {
    if (
      detailCaja !== undefined &&
      detailCaja.legajo.toLowerCase() == sesion.data.legajo?.toLowerCase() &&
      detailCaja.stateId == 'PendienteCierre'
    )
      jumpToEditCaja(detailCaja.numero);
    else setVisibleModal(detailCaja !== undefined);
  }, [detailCaja]);

  useEffect(() => {
    const previewPedidos = carrito.data.preview?.pedidos;
    if (previewPedidos) {
      const pedidos: PreviewCajaCarrito[] = _(selectedData).keyBy('id').merge(_.keyBy(previewPedidos, 'id')).values().value();

      setSelectedData(pedidos);
    }
  }, [carrito.data.preview?.pedidos]);

  useEffect(() => {
    if (!visibleModalCart) cancelRequest();
  }, [visibleModalCart]);

  useEffect(() => {
    if (!visibleModal) cancelRequest();
  }, [visibleModal]);

  useEffect(() => {
    const previewResultados = acciones.data.resultados?.map((r) => ({ ...r, numero: r.idElemento, estadoRespuesta: r.estado }));

    if (previewResultados) {
      const merged = _.merge(_.keyBy(selectedDataAction, 'numero'), _.keyBy(previewResultados, 'numero'));
      const values = _.values(merged);

      setSelectedDataAction(values);
    }
  }, [acciones.data.resultados]);

  const updateResult = (values: any, openResult: boolean, searchParams: any) => {
    setCurrentState({ ...searchParams });
    setCajas(values);
    if (openResult) setPanelActive('2');
  };

  const cancelRequest = () => {
    if (source) source.cancel();
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
    selectedRowKeys: selectedRows,
    onChange: onSelectChange,
  } as TableRowSelection<any>;

  /* DETALLE DE CAJA */
  const openDetailModal = (numero: number) => {
    executeWS<ViewDetailtCajaProps>(
      {
        method: 'POST',
        url: getURLs().BuscarCaja,
        data: { idCaja: numero },
      },
      setDetailCaja,
    );
  };

  const jumpToEditCaja = (id: number) => {
    history.push({
      pathname: '/editarCaja',
      search: '?id=' + id,
    });
  };

  /* EXPORTAR A EXCEL */
  const exportToExcel = () => {
    const data = cajas.map((d) => {
      return {
        Número: d.numero,
        Tipo: d.descripcionTipoCaja,
        Descripción: d.descripcion,
        Estado: d.stateId,
        'Fecha generación': d.fechaGeneracion ? moment(d.fechaGeneracion).format('DD/MM/YYYY HH:mm') : '',
        'Suc / CC Alta': `${d.idSectorOrigen} - ${d.sectorOrigen}`,
        'Tenencia Suc / CC': `${d.idSectorTenedor} - ${d.sectorTenedor}`,
      } as ResultadoBusquedaCaja;
    });
    exportToCSV2(`Cajas - ${moment().format('DD-MM-YYYY HH.mm [hs]')}`, data);
  };

  /* AGREGAR A CARRITO */
  const addToCartPreview = () => {
    let rows = new Array();
    selectedRows.forEach((r) => {
      rows.push(
        cajas.find((d) => {
          return d.numero == r;
        }),
      );
    });

    const data = rows.map((r) => {
      return { id: r.numero, tipoCaja: r.descripcionTipoCaja, detalle: r.descripcion } as PreviewCajaCarrito;
    });

    setSelectedData(data);
    setVisibleModalCart(true);
  };

  const addToCart = (caja?: CajaCarrito) => {
    const cajas: CajaCarrito[] = selectedData.map((data) => ({ id: data.id }));
    source = CancelToken.source();
    dispatch(addToCarrito({ data: { idUsuario: sesion.data.idUsuario!, cajas: caja ? [caja] : cajas }, cancelToken: source.token }))
      .then(unwrapResult)
      .then(() => {
        uncheckedRows();
        setDisabledOkButton(true);
      })
      .catch((err) => { });
  };

  const addToPreview = () => {
    let rows: any[] = [];
    selectedRows.forEach((rowId) => {
      rows.push(
        cajas.find((caja) => {
          return caja.numero === rowId;
        }),
      );
    });
    setSelectedDataAction(rows);
  };

  const updateCajas = (response: AplicarAccionResponseBody) => {
    let cajasOk = response.filter((res) => res.estado === 'Ok').map((res) => res.idElemento);
    const cajasFiltradas = cajas.filter((caja) => !cajasOk?.includes(caja.numero));
    setCajas(cajasFiltradas);
    uncheckedRows();
  };

  const uncheckedRows = () => {
    setSelectedRows([]);
  };

  const clearDetailModal = () => {
    setDetailCaja(undefined);
    dispatch(clearPreview());
  };

  const renderColumnValue = (key: string, text: any, record?: any) => {
    var ret: any;
    if (key === 'stateId') {
      ret = renderEstadoCaja(text);
    } else {
      if (key === 'fechaGeneracion') {
        ret = Moment(text).format('DD/MM/YYYY HH:mm');
      } else {
        if (key === 'sectorOrigen') {
          ret = `${record.idSectorOrigen} - ${record.sectorOrigen}`;
        } else {
          if (key === 'sectorTenedor') {
            ret = `${record.idSectorTenedor} - ${record.sectorTenedor}`;
          } else {
            // key === number
            ret = (
              <Button
                type="primary"
                shape="circle"
                onClick={() => openDetailModal(text)}
                style={{ color: '#fa7923', backgroundColor: 'transparent', border: 'none' }}
                icon={<EyeOutlined />}></Button>
            );
          }
        }
      }
    }
    return ret;
  };

  const containsCarritoInvalidState = (selectedRows: ReactText[]) => {

    let boxes: any[] = [];
    selectedRows.forEach((rowId) => {
      boxes.push(
        cajas.find((caja) => {
          return caja.numero === rowId;
        }),
      );
    });
    return boxes.map(b => b?.stateId).some(stateId => carritoInvalidStates.includes(stateId))
  };

  return (
    <div className={`wrapper unselectable ${styles.content}`}>
      <Collapse accordion activeKey={panelActive} style={{ width: '100%' }} onChange={(key) => setPanelActive(key)}>
        <Panel header="Filtros de Búsqueda de Caja" key="1">
          <SearchFilter didSearched={updateResult} wsConfig={config} className={styles.filters} filters={filtersAvailable}></SearchFilter>
        </Panel>
        <Panel header="Resultados" key="2">
          <Space>
            <Button
              type="primary"
              title="Agregar al carrito"
              key="btnCarrito"
              disabled={selectedRows.length == 0 || containsCarritoInvalidState(selectedRows)}
              onClick={(_: any) => {
                addToCartPreview();
              }}>
              <PlusOutlined style={{ fontSize: '16px', marginRight: '2px' }} /> Agregar al carrito
            </Button>
            {cajas.length > 0 && (
              <>
                <ExportButton onClick={() => exportToExcel()} />
                <ActionsDropdown
                  tipoElemento="CA"
                  idEstadoActual={currentState.codigo!}
                  idUsuario={sesion.data.idUsuario!}
                  onClick={addToPreview}
                />
              </>
            )}
          </Space>
          <div className="table-style">
            <span style={{ marginBottom: 4, float: 'right', visibility: cajas.length > 0 ? 'visible' : 'hidden' }}>
              <Tag color="orange">Cantidad de registros: {cajas.length}</Tag>
            </span>
            <Table
              dataSource={cajas}
              rowKey="numero"
              rowSelection={rowSelection}
              pagination={{ current: currentPage, onChange: (page) => setCurrentPage(page) }}>
              <Column title="Número" dataIndex="numero" key="numero" align="center" />
              <Column title="Tipo" dataIndex="descripcionTipoCaja" key="descripcionTipoCaja" />
              <Column title="Descripción" dataIndex="descripcion" key="descripcion" ellipsis={true} />
              <Column
                title="Estado"
                dataIndex="stateId"
                key="stateId"
                ellipsis={true}
                render={(text) => renderColumnValue('stateId', text)}
              />
              <Column
                title="Fecha generación"
                dataIndex="fechaGeneracion"
                key="fechaGeneracion"
                render={(text) => renderColumnValue('fechaGeneracion', text)}
              />
              <Column
                title="Suc / CC Alta"
                dataIndex="sectorOrigen"
                key="sectorOrigen"
                render={(text, record: any) => renderColumnValue('sectorOrigen', text, record)}
              />
              <Column
                title="Tenencia SUC / CC"
                dataIndex="sectorTenedor"
                key="sectorTenedor"
                render={(text, record: any) => renderColumnValue('sectorTenedor', text, record)}
              />
              <Column
                title="Detalle"
                key="detalle"
                dataIndex="numero"
                ellipsis={true}
                render={(text: number, record: any) => renderColumnValue('numero', text, record)}
              />
            </Table>
          </div>
        </Panel>
      </Collapse>
      <TableModal
        title="Pedido"
        width={'80%'}
        okText={'Confirmar'}
        cancelText={'Cerrar'}
        onOk={() => addToCart()}
        okButtonProps={{ loading: carrito.loading, disabled: disabledOkButton }}
        onCancel={() => setVisibleModalCart(false)}
        visible={visibleModalCart}
        afterClose={() => setDisabledOkButton(false)}
        table={{
          columns: mergedPreviewColumns,
          dataSource: selectedData,
          rowKey: 'id',
          hideRowSelection: true,
          extraColumns: { showKeyColumn: false, showActionsColumn: false },
          extraComponents: [
            {
              key: 'records-count-tag',
              node: 'records-count-tag',
              position: 'top',
              style: { marginLeft: 'auto' },
            },
          ],
          sortable: true,
          pagination: { pageSize: 10 },
          scroll: { y: 350 },
        }}
      />
      <ActionModal
        type="CA"
        title={acciones.data.dropdown?.acciones?.seleccionada?.descripcion}
        visible={acciones.data.modal?.visible}
        table={{ rowKey: 'numero', columns: mergedPreviewColumnsAction, dataSource: selectedDataAction }}
        onSuccess={updateCajas}
      />
      <Modal
        title="Ver Caja"
        centered
        visible={visibleModal}
        footer={null}
        //destroyOnClose={true}
        width="80%"
        onCancel={() => setVisibleModal(false)}
        afterClose={clearDetailModal}>
        <span className={styles.addToCart}>
          {detailCaja &&
            carrito.data.preview?.pedidos &&
            carrito.data.preview.pedidos.length === 1 &&
            detailCaja.numero === carrito.data.preview.pedidos[0].id ? (
            renderValidation(carrito.data.preview.pedidos[0])
          ) : (
            <AddToCart
              loading={carrito.loading}
              disabled={detailCaja && !canAddToCart(detailCaja)}
              onClick={() => addToCart(detailCaja ? ({ id: detailCaja.numero } as CajaCarrito) : undefined)}
            />
          )}
        </span>
        <ViewCaja data={detailCaja}></ViewCaja>
      </Modal>
    </div>
  );
};
