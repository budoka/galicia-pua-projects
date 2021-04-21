import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { Button, Collapse, Modal, Space, Table, Tag } from 'antd';
import { TableRowSelection } from 'antd/lib/table/interface';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import _ from 'lodash';
import { default as Moment, default as moment } from 'moment';
import React, { ReactText, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AddToCart } from '../../components/add-to-cart-button';
import { IFilterItem, IItemValue } from '../../components/filter-input/types';
import { Loading } from '../../components/loading';
import { SearchFilter } from '../../components/search-filter';
import { ColumnTypeEx } from '../../components/table';
import { TableModal } from '../../components/table-modal';
import { ViewDetailtDocumentoProps, ViewDocumento } from '../../components/view-documento';
import { Texts } from '../../constants/texts';
import { addToCarrito, clearPreview } from '../../features/carrito/carrito.slice';
import { DocumentoCarrito } from '../../features/carrito/types';
import { RootState } from '../../reducers';
import { useAppDispatch } from '../../store';
import { IElement } from '../../types';
import { executeWS, getValuesOfFilter } from '../../utils/axiosAPI';
import { canAddToCart, renderValidation } from '../../utils/cart';
import { getURLs } from '../../utils/ConfigurationServices';
import { exportToCSV2 } from '../../utils/ExportExcel';
import { renderEstadoDocumento } from '../../utils/renderEstados';
import { compare } from '../../utils/string';
import filtersDoc from './filtersDocumento.json';
import styles from './style.module.less';
import { ExportButton } from 'src/components/export-button';
import { ActionModal } from 'src/features/acciones/modal';
import { AplicarAccionResponseBody } from 'src/features/acciones/types';
import { ActionsDropdown } from 'src/features/acciones/dropdown';
import { renderActionValidation } from 'src/utils/actions';
import { setDropdownActions } from 'src/features/acciones/acciones.slice';

const { Column } = Table;
const { Panel } = Collapse;

interface ResultadoBusquedaDocumentos {
  Numero: number;
  'Tipo de documento': string;
  Detalle: string;
  'DNI / CUIT': number;
  'Fecha documental': string;
  'Suc / CC Origen': string;
  Estado: string;
  Info: any;
}

export interface PreviewDocumentoCarrito extends IElement {
  id: number;
  tipoDocumento: string;
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
    key: 'tipoDocumento',
    dataIndex: 'tipoDocumento',
    title: Texts.DOCUMENT_TYPE,
    width: 200,
    sorter: { compare: (a, b) => compare(a.tipoDocumento, b.tipoDocumento), multiple: -1 },
  },
  {
    key: 'detalle',
    dataIndex: 'detalle',
    title: Texts.DETAIL,
    width: 200,
    sorter: { compare: (a, b) => compare(a.detalle, b.detalle), multiple: -1 },
  },
  {
    key: 'descripcion',
    dataIndex: 'descripcion',
    title: Texts.VALIDATION,
    width: 300,
    sorter: { compare: (a, b) => compare(a.descripcion, b.descripcion), multiple: -1 },
  },
] as ColumnTypeEx<PreviewDocumentoCarrito>[];

const previewColumnsAction = [
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

const filtersAvailable: IFilterItem[] = filtersDoc;

const config = {
  method: 'POST',
  url: getURLs().BuscarDocumento,
} as AxiosRequestConfig;

const CancelToken = axios.CancelToken;
let source: CancelTokenSource;

export const SearchDocumento: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [panelActive, setPanelActive] = useState<string | string[]>('1');
  const [detailDocumento, setDetailDocumento] = useState<ViewDetailtDocumentoProps | undefined>(undefined);
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleModalCart, setVisibleModalCart] = useState(false);
  const [selectedRows, setSelectedRows] = useState<ReactText[]>([]);
  const [selectedData, setSelectedData] = useState<PreviewDocumentoCarrito[]>([]);
  const [selectedDataAction, setSelectedDataAction] = useState<any[]>([]);
  const [disabledOkButton, setDisabledOkButton] = useState(false);
  const [stateList, setStateList] = useState<IItemValue[]>([]);
  const [currentState, setCurrentState] = useState<{ stateIdFiltro?: string; stateId?: string; codigo?: number }>({});


  const carritoInvalidStates = ["PendienteDevolverRecepcion", "Prestado", "PrestadoParcialmente", "Destruido", "PendienteDestruccion", "PendienteRecepcion"];

  const acciones = useSelector((state: RootState) => state.acciones);
  const sesion = useSelector((state: RootState) => state.sesion);
  const carrito = useSelector((state: RootState) => state.carrito);
  const dispatch = useAppDispatch();


  const mergedPreviewColumns = previewColumns.map((column) => {
    if (column.key === 'descripcion') {
      return {
        ...column,
        render: (value: React.ReactNode, record: PreviewDocumentoCarrito) => (carrito.loading ? <Loading /> : renderValidation(record)),
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
  }, [documents]);

  useEffect(() => {
    const codigo = stateList.find((state) => state.id === currentState.stateId)?.codigo;
    if (codigo === currentState.codigo) return;
    setCurrentState({ ...currentState, codigo });
  }, [currentState]);

  useEffect(() => {
    const disabled = !(
      currentState.stateIdFiltro === 'igual' &&
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
        { method: 'POST', url: getURLs().ObtenerEstados, data: { tipoContenido: 'documento' } },
        setListValueEstado,
        'Estado',
      );

      // obtiene sectores
      await getValuesOfFilter<IItemValue[]>({ method: 'POST', url: getURLs().ObtenerSectores }, setListValue, [
        'Suc/CC Origen',
        'Suc/CC Propietario',
        'Tenencia Suc/CC',
      ]);
    };
    getData();

    setPanelActive('1');
  }, []);

  useEffect(() => {
    setVisibleModal(detailDocumento !== undefined);
  }, [detailDocumento]);

  useEffect(() => {
    const previewPedidos = carrito.data.preview?.pedidos;
    if (previewPedidos) {
      const pedidos: PreviewDocumentoCarrito[] = _(selectedData).keyBy('id').merge(_.keyBy(previewPedidos, 'id')).values().value();

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
    const previewResultados = acciones.data.resultados?.map((r) => ({ ...r, id: r.idElemento, estadoRespuesta: r.estado }));

    if (previewResultados) {
      const merged = _.merge(_.keyBy(selectedDataAction, 'id'), _.keyBy(previewResultados, 'id'));
      const values = _.values(merged);

      setSelectedDataAction(values);
    }
  }, [acciones.data.resultados]);

  const updateResult = (values: any, openResult: boolean, searchParams: any) => {
    setCurrentState({ ...searchParams });
    setDocuments(values);
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

  /* DETALLE DE DOCUMENTO */
  const openDetailModal = (numero: number) => {
    executeWS<ViewDetailtDocumentoProps>(
      {
        method: 'POST',
        url: getURLs().InfoDocumento,
        data: { id: numero },
      },
      setDetailDocumento,
    );
  };

  /* MANEJO DE CHECKBOX DE TABLE */
  const onSelectChange = (selectedRowKeys: ReactText[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: onSelectChange,
  } as TableRowSelection<any>;

  /* EXPORTAR A EXCEL */
  const exportToExcel = () => {
    const data = documents.map((d) => {
      return {
        Numero: d.id,
        'Tipo de documento': d.tipoDocumentoDesc,
        Detalle: d.detalle,
        'DNI / CUIT': d.dniCuitTitular,
        'Fecha documental': d.fechaDocumental ? moment(d.fechaDocumental).format('DD/MM/YYYY') : '',
        'Suc / CC Origen': d.sectorOrigenDesc,
        Estado: d.stateId,
      } as ResultadoBusquedaDocumentos;
    });
    exportToCSV2(`Documentos - ${moment().format('DD-MM-YYYY HH.mm [hs]')}`, data);
  };

  const addToCartPreview = () => {
    let rows = new Array();
    selectedRows.forEach((r) => {
      rows.push(
        documents.find((d) => {
          return d.id == r;
        }),
      );
    });

    const data = rows.map((r) => {
      return { id: r.id, tipoDocumento: r.tipoDocumentoDesc, detalle: r.detalle } as PreviewDocumentoCarrito;
    });

    setSelectedData(data);
    setVisibleModalCart(true);
  };

  const addToCart = (documento?: DocumentoCarrito) => {
    const documentos: DocumentoCarrito[] = selectedData.map((data) => ({ id: data.id }));
    source = CancelToken.source();
    dispatch(
      addToCarrito({
        data: { idUsuario: sesion.data.idUsuario!, documentos: documento ? [documento] : documentos },
        cancelToken: source.token,
      }),
    )
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
        documents.find((documento) => {
          return documento.id === rowId;
        }),
      );
    });
    setSelectedDataAction(rows);
  };

  const updateDocumentos = (response: AplicarAccionResponseBody) => {
    let documentosOk = response.filter((res) => res.estado === 'Ok').map((res) => res.idElemento);
    const documentosFiltrados = documents.filter((documento) => !documentosOk?.includes(documento.id));
    setDocuments(documentosFiltrados);
    uncheckedRows();
  };

  const uncheckedRows = () => {
    setSelectedRows([]);
  };

  const clearDetailModal = () => {
    setDetailDocumento(undefined);
    dispatch(clearPreview());
  };

  const containsCarritoInvalidState = (selectedRows: ReactText[]) => {

    let docs: any[] = [];
    selectedRows.forEach((rowId) => {
      docs.push(
        documents.find((doc) => {
          return doc.id === rowId;
        }),
      );
    });
    return docs.map(d => d?.stateId).some(stateId => carritoInvalidStates.includes(stateId))
  };

  // Internet Explorer 6-11
  //const isIE = /*@cc_on!@*/false || !!document.documentMode;

  return (
    <div className={`wrapper unselectable ${styles.content}`}>
      <Collapse accordion activeKey={panelActive} style={{ width: '100%' }} onChange={(key) => setPanelActive(key)}>
        <Panel header="Filtros de Búsqueda de Documento" key="1">
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
            {documents.length > 0 && (
              <>
                <ExportButton onClick={() => exportToExcel()} />
                <ActionsDropdown
                  tipoElemento="DO"
                  idEstadoActual={currentState.codigo!}
                  idUsuario={sesion.data.idUsuario!}
                  onClick={addToPreview}
                />
              </>
            )}
          </Space>
          <div className="table-style">
            <span style={{ marginBottom: 4, float: 'right', visibility: documents.length > 0 ? 'visible' : 'hidden' }}>
              <Tag color="orange">Cantidad de registros: {documents.length}</Tag>
            </span>
            <Table
              dataSource={documents}
              rowKey="id"
              rowSelection={rowSelection}
              pagination={{ current: currentPage, onChange: (page) => setCurrentPage(page) }}>
              <Column title="Número" dataIndex="id" key="numero" align="center" />
              <Column title="Tipo de documento" dataIndex="tipoDocumentoDesc" key="tipoDocumento" />
              <Column title="Detalle" dataIndex="detalle" key="detalle" ellipsis={true} />
              <Column title="DNI / CUIT" dataIndex="dniCuitTitular" key="dniCUIT" ellipsis={true} />

              <Column
                title="Fecha documental"
                dataIndex="fechaDocumental"
                key="fechaDocumental"
                render={(date) => {
                  return date ? Moment(date).format('DD/MM/YYYY') : "-";
                }}
              />
              <Column
                title="Suc / CC Origen"
                dataIndex="sectorOrigenDesc"
                key="sucOrigen"
                render={(text, record: any) => {
                  return `${record.idSectorOrigen} - ${record.sectorOrigenDesc}`;
                }}
              />
              <Column
                title="Estado"
                dataIndex="stateId"
                key="estado"
                ellipsis={true}
                render={(text) => {
                  return renderEstadoDocumento(text);
                }}
              />
              <Column
                title="Detalle"
                key="detalle"
                dataIndex="id"
                render={(text: number) => {
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
        type="DO"
        title={acciones.data.dropdown?.acciones?.seleccionada?.descripcion}
        visible={acciones.data.modal?.visible}
        table={{ rowKey: 'id', columns: mergedPreviewColumnsAction, dataSource: selectedDataAction }}
        onSuccess={updateDocumentos}
      />
      <Modal
        title="Ver Documento"
        centered
        visible={visibleModal}
        footer={null}
        width="80%"
        onCancel={() => setVisibleModal(false)}
        afterClose={clearDetailModal}>
        <span className={styles.addToCart}>
          {detailDocumento &&
            carrito.data.preview?.pedidos &&
            carrito.data.preview.pedidos.length === 1 &&
            detailDocumento.id === carrito.data.preview.pedidos[0].id ? (
            renderValidation(carrito.data.preview.pedidos[0])
          ) : (
            <AddToCart
              loading={carrito.loading}
              disabled={detailDocumento && !canAddToCart(detailDocumento)}
              onClick={() => addToCart(detailDocumento ? ({ id: detailDocumento.id } as DocumentoCarrito) : undefined)}
            />
          )}
        </span>
        <span>
        </span>
        <ViewDocumento data={detailDocumento}></ViewDocumento>
      </Modal>
    </div>
  );
};
