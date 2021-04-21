import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, Popconfirm, Select } from 'antd';
import Table, { TablePaginationConfig } from 'antd/lib/table';
import Column from 'antd/lib/table/Column';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { setCurrentDocumentType, setDocumentTypes } from 'src/features/cajas/cajas-codigo-barras/cajas-codigo-barras.slice';
import { RootState } from 'src/reducers';
import { useAppDispatch } from 'src/store';
import { obtenerCajaById } from '../API/AbrirCajaAPI';
import { actualizarContenido, eliminarContenidoById, guardarContenido } from '../API/ContenidoAPI';
import { formatDate, palabraToLowerCase } from '../utils/Common';

type GridConContenidoProps = {
  cajaId: number | undefined;
  plantillaId: number | undefined;
  contenido: string;
  caja: string;
  plantillaActual?: string;
  currentKey?: number;
  numeroCaja?: string;
  idTipoDocumental?: number;
  setDisable: (e: boolean) => void;
  errorGrid: boolean;
  setErrorGrid: (e: boolean) => void;
  setIdTipoDocumental: (e: number | undefined) => void;
  hasBeenAChange: boolean; // hubo un cambio en el editarCaja
  modificarCaja: (e?: boolean) => Promise<void>;
};
export const charcodes: number[] = [69, 188, 190, 186, 187, 189, 106, 107, 109, 110, 111, 144];

export const GridConContenido: React.FC<GridConContenidoProps> = (props) => {
  const sesion = useSelector((state: RootState) => state.sesion);
  const [columns, setColumns] = useState<Column[]>([]); // conservamos el estado de las columnas de la tabla
  const [tiposDocumentos, setTiposDocumentos] = useState<TipoDocumento[]>([]); // Conservamos el estado del select para la columna 1
  const [data, setData] = useState<DocumentItem[]>([]);
  const location = useLocation();
  const [editingKey, setEditingKey] = useState<number>();
  const [nextKey, setNextKey] = useState<number>(0);
  const [addingRow, setAddingRow] = useState<boolean>(false);
  const [documentEditCopy, setDocumentEditCopy] = useState<DocumentItem>();
  const [loading, setLoading] = useState<boolean>(false);
  const [editable, setEditable] = useState<any>({
    // AGREGAR LAS OTRAS PROPIEDADES QUE PUEDEN LLEGAR A VENIR PARA CAJA CON DOC.
    id: 0,
    tipoDocumental: '',
    idTipoDocumento: undefined,
    dniCuitTitular: undefined,
    nombreTitular: '',
    numeroProducto: undefined,
    detalle: 'un detalle',
    fechaDocumental: null,
    fechaCierre: null,
    fechaDesde: null,
    fechaHasta: null,
    sucCCPropietario: undefined,
  });

  const dispatch = useAppDispatch();

  //const DEFAULT_CURRENT_PAGE = 1;
  //const DEFAULT_PAGE_SIZE = 5;
  //const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  //const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    hideOnSinglePage: true,
  });

  var inputBox = document.getElementById('inputNumber');

  var invalidChars = ['-', '+', 'e', 'E', '/', '*', ','];

  inputBox &&
    inputBox.addEventListener('keydown', function (e) {
      if (invalidChars.includes(e.key)) e.preventDefault();
    });

  const buildSelectTiposDocumentos = (preview: PreviewContenidoResponse[]): TipoDocumento[] => {
    let result: TipoDocumento[] = [];
    result = preview.map((p) => previewToTipoDocumento(p)); // toLowerCase()
    return result;
  };

  const previewToTipoDocumento = (preview: PreviewContenidoResponse): TipoDocumento => {
    return {
      descripcion: preview.descripcion,
      id: preview.id,
    };
  };

  const inclusionToColumn = (inclusion: Inclusion, index: number): Column => {
    var descr;
    var title;
    if (inclusion.descripcion.includes('/')) {
      descr = palabraToLowerCase(inclusion.descripcion).replace('/', '');
      title = inclusion.descripcion;
    } else {
      descr = palabraToLowerCase(inclusion.descripcion.substring(9));
      title = inclusion.descripcion.substring(9);
    }
    return {
      key: index.toString(),
      title: title,
      descr: descr, // Esta es la descrip que uso para matchear el otro objeto
      requerido: inclusion.requerido,
      type: inclusion.tipoDato,
    };
  };

  const buildColumns = (preview: PreviewContenidoResponse[]): Column[] => {
    let result: Column[] = [];
    result.push({
      key: '1000',
      title: 'Tipo Documental',
      descr: 'tipoDocumental',
      requerido: 'R',
      type: 'select',
    });
    return result.concat(preview[0].inclusiones.map((inclusion, index) => inclusionToColumn(inclusion, index + 1)));
  };

  const toDocumentItem = (content: apiResponse, columns: Column[]) => {
    return {
      ...content,
      id: content.id,
      tipoDocumental: content.tipoDocumental,
      dniCuitTitular: content.dniCuitTitular ? parseInt(content.dniCuitTitular) : undefined,
      nombreTitular: content.nombreTitular ? content.nombreTitular : '',
      numeroProducto: content.numeroProducto,
      detalle: content.detalle,
      fechaDocumental: content.fechaDocumental ? moment.utc(new Date(content.fechaDocumental)) : null,
      fechaCierre: content.fechaCierre ? moment.utc(new Date(content.fechaCierre)) : null,
      fechaDesde: content.fechaDesde ? moment.utc(new Date(content.fechaDesde)) : null,
      fechaHasta: content.fechaHasta ? moment.utc(new Date(content.fechaHasta)) : null,
      sucCCPropietario: content.idSectorPropietario,
    };
  };

  const generateDocuments = (contents: apiResponse[], columns: Column[]): DocumentItem[] => {
    var result = contents.map((c) => toDocumentItem(c, columns));
    return result;
  };

  const getData = async (columns: Column[]) => {
    const searchParams = new URLSearchParams(location.search);
    await obtenerCajaById(searchParams.get('id'))
      .then((caja) => {
        var documents = generateDocuments(caja.contenido, columns);
        setData(documents);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false)
      });
  };

  const obtenerColumnas = async () => {
    const api = apis['CAJA'];
    const res = api.resources['PREVIEW'];
    var data = {
      idTipoCaja: props.cajaId,
      idPlantilla: props.plantillaId,
      idTipoContenido: 2,
    };
    const axiosConfig = buildAxiosRequestConfig(api, res, { data });
    const response = await axios.request<PreviewContenidoResponse[]>(axiosConfig);

    dispatch(setDocumentTypes(response.data.map((d) => ({ value: d.id, label: d.descripcion }))));
    if (response.status === 200) {
      const tiposDocumentos = buildSelectTiposDocumentos(response.data); // genera el select que se va a utlizar para el tipo documento
      setTiposDocumentos(tiposDocumentos);
      const columns = buildColumns(response.data);
      setColumns(columns);
      getData(columns);
    }
  };

  useEffect(() => {
    setLoading(true);
    obtenerColumnas();
  }, []);

  const isEditing = (id: number): boolean => {
    return id === editingKey;
  };

  const editing = (): boolean => {
    return editingKey !== undefined;
  };

  const getNextKey = (): number => {
    setNextKey(nextKey + 1);
    return nextKey; // nextKey - 1
  };

  const calculateNextId = () => {
    if (data.length > 0) {
      // esta demás...
      var oldKey = data[data.length - 1].id;
      return oldKey ? oldKey + 1 : getNextKey();
    } else {
      return getNextKey();
    }
  };

  const clickAdd = () => {
    if (editingKey) return; // addingRow ||

    const newRow: DocumentItem = {
      id: calculateNextId(),
      tipoDocumental: '',
      idTipoDocumento: undefined,
      dniCuitTitular: undefined,
      nombreTitular: '',
      numeroProducto: undefined,
      detalle: '',
      fechaDocumental: null,
      fechaCierre: null,
      fechaDesde: null,
      fechaHasta: null,
      sucCCPropietario: undefined,
    };

    setData([...data, newRow]);

    setAddingRow(true);
    edit(newRow);
  };

  const edit = (item: DocumentItem): void => {
    const editable = {
      id: item.id,
      tipoDocumental: item.tipoDocumental,
      idCaja: props.numeroCaja,
      dniCuitTitular: item.dniCuitTitular,
      idTipoDocumento: props.idTipoDocumental,
      nombreTitular: item.nombreTitular,
      numeroProducto: item.numeroProducto,
      detalle: item.detalle,
      fechaDocumental: item.fechaDocumental,
      fechaCierre: item.fechaCierre,
      fechaDesde: item.fechaDesde,
      fechaHasta: item.fechaHasta,
      sucCCPropietario: item.sucCCPropietario,
    };

    setEditable(editable);
    setDocumentEditCopy(editable);
    setEditingKey(item.id);
  };

  const cancel = (id: number): void => {
    setEditable({
      id: 0, // si no ponemos undefined
      tipoDocumental: '',
      idTipoDocumento: undefined,
      dniCuitTitular: undefined,
      nombreTitular: '',
      numeroProducto: undefined,
      detalle: '',
      fechaDocumental: null,
      fechaCierre: null,
      fechaDesde: null,
      fechaHasta: null,
      sucCCPropietario: undefined,
    });

    /* // En teoria deberia funcionar solo
    if(addingRow && mustGoBackPage()) {
      //setCurrentPage(currentPage-1);
      setPagination({
        ...pagination,
        current: pagination.current ? pagination.current-1 : 0
      })
    }
    */

    if (addingRow) {
      setNextKey(nextKey - 1);
      //data.pop();
      //setData(data);
      //setData(data.filter((d) => d.id !== id)); // nuevo
      data.pop();
      setData([...data]);
      if (data.length === 0) {
        props.setDisable(false); // Es el último
      }
    } else {
      var index = data.findIndex((data) => data.id === id);
      data.splice(index, 1, documentEditCopy as DocumentItem);
      setData([...data]);
    }

    setEditingKey(undefined);
    setAddingRow(false);
  };

  const eliminar = async (id: number) => {
    await eliminarContenidoById(id, sesion.data.idUsuario!)
      .then((_) => {
        /*
        if(mustGoBackPage()) {
          setCurrentPage(currentPage-1);
        }
        */
        setData(data.filter((d) => d.id !== id));
        if (data.length === 1) {
          props.setDisable(false); // Es el último
        }
      })
      .catch((e) => e);
  };

  const foundError = (): boolean => {
    var ret = false;
    columns.forEach((c) => {
      var item = editable as any;
      ret = ret || (c.requerido === 'R' && !item[c.descr]);
    });
    return ret;
  };

  const mkContentForSave = (): DocumentRequest => {
    return {
      id: editable.id ? editable.id : undefined,
      idUsuario: sesion.data.idUsuario!,
      idCaja: props.numeroCaja,
      tipoDocumento: editable.tipoDocumental,
      detalle: editable.detalle,
      idTipoDocumento: props.idTipoDocumental,
      numeroProducto: editable.numeroProducto,
      dniCuitTitular: editable.dniCuitTitular,
      nombreTitular: editable.nombreTitular,
      fechaCierre: editable.fechaCierre ? formatDate(editable.fechaCierre.toDate()) : undefined,
      fechaDocumental: editable.fechaDocumental ? formatDate(editable.fechaDocumental.toDate()) : undefined,
      fechaDesde: editable.fechaDesde ? formatDate(editable.fechaDesde.toDate()) : undefined,
      fechaHasta: editable.fechaHasta ? formatDate(editable.fechaHasta.toDate()) : undefined,
      idSectorPropietario: parseInt(editable.sucCCPropietario),
      idUsuarioAlta: sesion.data.idUsuario,
      idSectorOrigen: sesion.data.idSector
    };
  };

  const mkContentForEdith = () => {
    return {
      id: editable.id ? editable.id : undefined,
      //idUsuario: sesion.data.idUsuario!,
      idCaja: props.numeroCaja,
      tipoDocumento: editable.tipoDocumental,
      detalle: editable.detalle,
      idTipoDocumento: props.idTipoDocumental,
      numeroProducto: editable.numeroProducto,
      dniCuitTitular: editable.dniCuitTitular,
      nombreTitular: editable.nombreTitular,
      fechaCierre: editable.fechaCierre ? formatDate(editable.fechaCierre.toDate()) : undefined,
      fechaDocumental: editable.fechaDocumental ? formatDate(editable.fechaDocumental.toDate()) : undefined,
      fechaDesde: editable.fechaDesde ? formatDate(editable.fechaDesde.toDate()) : undefined,
      fechaHasta: editable.fechaHasta ? formatDate(editable.fechaHasta.toDate()) : undefined,
      idSectorPropietario: parseInt(editable.sucCCPropietario),
      idSectorTenedor: sesion.data.idSector,
      idUsuarioAlta: sesion.data.idUsuario,
      idSectorOrigen: sesion.data.idSector
    };
  }

  const guardar = async (id: number) => {
    if (foundError()) {
      return;
    }
    var index = data.findIndex((data) => data.id === id);
    if (editable) {
      if (addingRow) {
        if (props.hasBeenAChange) {
          props.modificarCaja();
        }

        await guardarContenido(mkContentForSave())
          .then((e) => {
            //data.dataSource.pop(); // Quito el ultimo elemento porque ya no lo necesito,
            editable.id = e[0].id; // el id del response del create; esta demás....
            //var index = data.findIndex((data) => data.id === id);
            data.splice(index, 1, editable);
            setData([...data]);
            props.setDisable(true);
          })
          .catch((e) => {
            data.pop();
            setData([...data]);
          });
      } else {
        await actualizarContenido(mkContentForEdith(), sesion.data.idUsuario!)
          .then((_) => {
            data.splice(index, 1, editable);
            setData([...data]);
            props.setDisable(true);
          })
          .catch((e) => e);
      }
    }

    setEditingKey(undefined);
    setAddingRow(false);

    setEditable({
      id: undefined,
      tipoDocumental: '',
      idTipoDocumento: undefined,
      dniCuitTitular: undefined,
      nombreTitular: '',
      numeroProducto: undefined,
      detalle: '',
      fechaDocumental: null,
      fechaCierre: null,
      fechaDesde: null,
      fechaHasta: null,
      sucCCPropietario: undefined,
    });
  };

  const buildOnChange = (value: any, col: any, item: any) => {
    //props.editableItem[col] = value;
    item[col.descr] = value;
    setEditable({
      ...item,
    });
  };

  const searchIdTipoDocumental = (descr: string, tiposDocs: TipoDocumento[]) => {
    return tiposDocs.find((t) => t.descripcion === descr)?.id;
  };

  const handleTableChange = (pagin: TablePaginationConfig, filters: any, sorter: any) => {
    setPagination(pagin);
  };

  const help = (col: any) => {
    if (col.requerido === 'R' && !editable[col.descr]) {
      return <p style={{ fontSize: 10 }}>Obligatorio</p>;
    }
    return undefined;
  };

  const validateStatus = (col: any) => {
    if (col.requerido === 'R' && !editable[col.descr]) {
      return 'error';
    }
    return 'success';
  };

  return !loading ? (
    <Card size="small" title="Documentos" bordered={false}>
      <Table size="small" dataSource={data} pagination={pagination} onChange={handleTableChange} locale={{ emptyText: <></> }}>
        {columns.map((col, i) => (
          <Column
            title={col.title}
            dataIndex={col.descr}
            key={col.descr}
            render={(value: any, record: any, index: number) => {
              if (isEditing(record.id)) {
                if (col.type === 'texto') {
                  return (
                    <Form.Item validateStatus={validateStatus(col)} help={help(col)}>
                      <Input
                        maxLength={20}
                        type="text"
                        style={{ minWidth: '140px' }}
                        value={editable[col.descr]}
                        onKeyDown={(e) => {
                          //const keyCode = (e.which) ? e.which : e.keyCode;
                          //const keyPressed = e.currentTarget.value;
                          return !/^[a-zA-Z0-9.\s]*$/.test(e.key) && e.preventDefault();
                        }}
                        onChange={(e) => {
                          e.preventDefault();
                          buildOnChange(e.currentTarget.value, col, record);
                        }}
                      />
                    </Form.Item>
                  );
                }

                if (col.type === 'numero') {
                  return (
                    <Form.Item validateStatus={validateStatus(col)} help={help(col)}>
                      <Input
                        type="number"
                        id="inputNumber"
                        style={{ minWidth: '120px' }}
                        value={editable[col.descr]}
                        min={1}
                        max={99999999}
                        onKeyDown={(e) => {
                          const charCode = e.which ? e.which : e.keyCode;
                          return charcodes.includes(charCode) && e.preventDefault();
                        }}
                        onChange={(e) => {
                          e.preventDefault();
                          buildOnChange(e.currentTarget.value, col, record);
                        }}
                      />
                    </Form.Item>
                  );
                }
                if (col.type === 'fecha') {
                  return (
                    <Form.Item validateStatus={validateStatus(col)} help={help(col)}>
                      <DatePicker
                        style={{ minWidth: '100px' }}
                        disabledDate={(d) => !d || !(d.year() > 1900)}
                        value={editable[col.descr]}
                        placeholder="dd/mm/aaaa"
                        format={'DD/MM/YYYY'}
                        onChange={(e) => {
                          buildOnChange(e, col, record);
                        }}
                      />
                    </Form.Item>
                  );
                }
                if (col.type === 'select') {
                  return (
                    <Form.Item validateStatus={validateStatus(col)} help={help(col)}>
                      <Select
                        value={editable[col.descr]}
                        style={{ minWidth: '220px' }}
                        onChange={(e) => {
                          props.setIdTipoDocumental(searchIdTipoDocumental(e, tiposDocumentos));
                          buildOnChange(e, col, record);
                        }}>
                        {tiposDocumentos &&
                          tiposDocumentos.map((t, key) => (
                            <Select.Option value={t.descripcion} key={key}>
                              {t.descripcion}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Item>
                  );
                }
              } else {
                if (col.type === 'select') {
                  return record[col.descr];
                }
                if (col.type === 'texto') {
                  return record[col.descr] ? record[col.descr] : '-';
                }
                if (col.type === 'numero') {
                  return record[col.descr] ? record[col.descr] : 0;
                }
                if (col.type === 'fecha') {
                  return record[col.descr] ? (
                    <Moment utc format="DD/MM/YYYY">
                      {record[col.descr]}
                    </Moment>
                  ) : (
                    '-'
                  );
                } else {
                  return record[col.descr];
                }
              }
            }}
          />
        ))}
        <Column
          title="Eliminar"
          key="eliminar"
          render={(value: any, record: any, index: number) => (
            <Popconfirm title="Está seguro?" disabled={editing() ? true : undefined} onConfirm={(_) => eliminar(record.id)}>
              <Button disabled={editing() ? true : undefined} type="link">
                Eliminar
              </Button>
            </Popconfirm>
          )}
        />
        <Column
          title="Editar"
          key="editar"
          render={(value: any, record: any, index: number) =>
            isEditing(record.id) ? (
              <span>
                <Button type="link" onClick={(_) => guardar(record.id)} style={{ marginRight: 8 }}>
                  Guardar
                </Button>
                <Popconfirm title="Está seguro?" onConfirm={(_) => cancel(record.id)}>
                  <Button type="link">Cancelar</Button>
                </Popconfirm>
              </span>
            ) : (
              <Button type="link" disabled={editing() ? true : undefined} onClick={(_) => edit(record)}>
                Editar
              </Button>
            )
          }
        />
      </Table>
      <br></br>
      <Button
        title="Agregar Fila"
        disabled={addingRow || editingKey ? true : undefined} // || props.hasBeenAChange
        type="primary"
        onClick={(e) => {
          clickAdd();
          setPagination({
            ...pagination,
            current: pagination.pageSize ? Math.ceil((data.length + 1) / pagination.pageSize) : 1,
          });
          props.setDisable(true);
        }}>
        <PlusCircleOutlined style={{ fontSize: '15px' }} />
        Agregar
      </Button>
    </Card>
  ) : (
    <></>
  );
};

export interface Column {
  key: string;
  title: string;
  descr: string; // Este es el key para matchear con el objeto que llena la grilla...
  requerido: string;
  type: string;
  long?: string;
}

export type apiResponse = {
  id: number;
  detalle?: string;
  fechaDocumental?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  fechaCierre?: string;
  numeroProducto?: string;
  dniCuitTitular?: string;
  nombreTitular?: string;
  tipoDocumental?: string;
  idEtiqueta?: number;
  idSectorPropietario: number;
};

export type DocumentItem = {
  id: number | undefined;
  detalle?: string;
  idCaja?: string;
  fechaDocumental?: moment.Moment | null;
  fechaDesde?: moment.Moment | null;
  fechaHasta?: moment.Moment | null;
  tipoDocumental?: string;
  idTipoDocumento?: number;
  dniCuitTitular?: number;
  nombreTitular?: string;
  numeroProducto?: string;
  fechaCierre?: moment.Moment | null;
  idSectorOrigen?: number;
  idSectorTenedor?: number;
  idUsuarioAlta?: number;
  idEtiqueta?: number;
  sucCCPropietario?: number;
};

export type DocumentRequest = {
  id?: number;
  idUsuario?: number;
  detalle?: string;
  idCaja?: string;
  fechaDocumental?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  idTipoDocumento?: number;
  dniCuitTitular?: number;
  nombreTitular?: string;
  numeroProducto?: string;
  fechaCierre?: string;
  tipoDocumento?: string;
  idTipoDocumental?: number;
  claveExterna?: number;
  idSectorPropietario?: number;
  idUsuarioAlta: number | undefined,
  idSectorOrigen: number | undefined
};

// Response de la llamada al servicio
export type Inclusion = {
  descripcion: string;
  tipoDato: string;
  requerido: string;
};

// Response de la llamada al servicio
export type PreviewContenidoResponse = {
  descripcion: string;
  id: number;
  inclusiones: Inclusion[];
};

export type TipoDocumento = {
  descripcion: string;
  id: number;
};
