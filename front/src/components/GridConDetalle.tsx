import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, Popconfirm, Select, Table } from 'antd';
import { TablePaginationConfig } from 'antd/lib/table';
import Column from 'antd/lib/table/Column';
import axios from 'axios';
import moment, { Moment as Momento } from 'moment';
import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';
import { useLocation } from 'react-router-dom';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { obtenerCajaById } from '../API/AbrirCajaAPI';
import { addDetail, eliminarDetalleCajaById, updateDetail } from '../API/ContenidoAPI';
import { mockSectores } from '../types/sectores';
import { mockValores } from '../types/valores';
import { parseFechaDetalle } from '../utils/Common';
import { charcodes } from './GridConContenido';
import styles from './style.module.less';

type GridConDetalleProps = {
  cajaId: number | undefined;
  plantillaId: number | undefined;
  contenido: string;
  setDisable: (e: boolean) => void;
  caja: string;
  plantillaActual?: string;
  currentKey?: number;
  hasBeenAChange: boolean; // hubo un cambio en el editarCaja
  fechaDesde: Momento | null;
  fechaHasta: Momento | null;
  modificarCaja: (e?: boolean) => Promise<void>;
  errorGrid: boolean;
  editableItem: any;
  setEditableItem: (e: any) => void;
};

export const GridConDetalle: React.FC<GridConDetalleProps> = (props) => {
  const [columns, setColumns] = useState<ColumnConDetalle[]>([]);
  const location = useLocation();
  const [data, setData] = useState<any[]>([]); // DetailItem
  const [sectores, setSectores] = useState<Sector[]>(mockSectores);
  const [valores, setValores] = useState<Valor[]>(mockValores);
  const DEFAULT_CURRENT_PAGE = 1;
  const DEFAULT_PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [editingKey, setEditingKey] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [nextKey, setNextKey] = useState<number>(0);
  const [addingRow, setAddingRow] = useState<boolean>(false);
  const [editable, setEditable] = useState<DetailItem>({
    // PARA EDITAR TIENE QUE SER ESTE OBJETO SI O SI LAMENTEABLEMENTE
    id: 0,
    columns: [],
  });

  const [editableObj, setEditableObj] = useState<any>();
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    hideOnSinglePage: true,
  });

  // FOR EDITING ////////////
  /*
  const empty = {
    idColumna: 0,
    valor: null,
  };
  */
  /*
   var inputBox = document.getElementById("inputNumber");
  
   var invalidChars = [
     "-",
     "+",
     "e",
     "E",
     "/",
     "*",
     ",",
   ];
   
  
   inputBox && inputBox.addEventListener("keydown", function(e) {
     if (invalidChars.includes(e.key)) e.preventDefault();
   });
   */

  const determineValores = () => {
    return valores.filter((v) => {
      if (props.plantillaId === 104 && (v.id === 8 || v.id == 1)) {
        return v;
      }
      if (props.plantillaId === 105 && (v.id === 2 || v.id == 3)) {
        return v;
      }
      if (props.plantillaId === 106 && (v.id === 4 || v.id == 5 || v.id == 6 || v.id == 7)) {
        return v;
      }
    });
  };

  const isEditing = (id: number): boolean => {
    return id === editingKey;
  };
  const editing = (): boolean => {
    return editingKey !== undefined;
  };

  const cancel = (): void => {
    /*
    if (addingRow && mustGoBackPage()) {
      setCurrentPage(currentPage - 1);
    }
    */
    if (addingRow) {
      setNextKey(nextKey - 1);
      data.pop();
      setData([...data]);

      if (data.length === 0) {
        props.setDisable(false); // Es el último
      }
    }

    setEditingKey(undefined);
    setAddingRow(false);
  };

  const determineValueToDetailColumnItem = (p: ParticularConDetalleObject, column: ColumnConDetalle | undefined): any => {
    if (column && column.type === 'texto') {
      return p.valor;
    }

    if (column && column.type === 'fecha') {
      return p.valor ? moment(parseFechaDetalle(p.valor)) : null; // content.fechaDocumental ? moment.utc(new Date(content.fechaDocumental)) : null
    }

    if (column && column.type === 'entero') {
      return parseInt(p.valor);
    }
    return p.valor;
  };

  const toDetailColumnItem = (c: ColumnConDetalle, response: ConDetalleObject): DetailColumnItem => {
    // acá deberia poder modificar....issue 13230
    // el problema es que acá estan solo los que estan en los datos, y no alcanza los que estan en columnas
    const column = response.columnas.find((col) => col.idColumna === c.idColumna);
    if (column) {
      return {
        idColumna: column.idColumna,
        valor: determineValueToDetailColumnItem(column, c),
      };
    } else {
      return {
        idColumna: c.idColumna,
        valor: undefined,
      };
    }
  };

  // acá rrecorrer columns, no las columns del objeto particular
  /*
  const toDetailItemColumns = (columns: ColumnConDetalle[], response: ConDetalleObject): DetailColumnItem[] => {
    return columns.map((c) => toDetailColumnItem(c, response));
  };
  */

  const toDetailItem = (object: ConDetalleObject, columns: ColumnConDetalle[]) => {
    var retObject = {};
    Object.defineProperty(retObject, 'id', {
      value: object.id,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    /* 
    object.columnas.map((childObject) => {
    var column = columns.find((col) => col.idColumna === childObject.idColumna)
    Object.defineProperty(retObject, childObject.idColumna, 
     {
      value : column && column.type === "fecha" ? moment(parseFechaDetalle(childObject.valor)) : childObject.valor,
      writable : true,
      enumerable : true,
      configurable : true
      })
    })
    */
    object.columnas.forEach((childObject) => {
      var column = columns.find((col) => col.idColumna === childObject.idColumna);
      Object.defineProperty(retObject, childObject.idColumna, {
        value: column && column.type === 'fecha' ? moment(parseFechaDetalle(childObject.valor)) : childObject.valor,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    });
    return retObject;
  };

  const generateDetalles = (responses: ConDetalleObject[], columns: ColumnConDetalle[]) => {
    //  : DetailItem[]
    return responses.map((fatherObject) => toDetailItem(fatherObject, columns));
  };

  const obtenerDatos = async (columns: ColumnConDetalle[]) => {
    const searchParams = new URLSearchParams(location.search);
    await obtenerCajaById(searchParams.get('id'))
      .then((caja) => {
        var detalles = generateDetalles(caja.contenido, columns); // hay que modificar este metodo porque a un elemento que llena una fila le pueden faltar algunas
        setData(detalles);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false)
      })
  };

  const mkEditObject = (columns: ColumnConDetalle[]) => {
    var edit = {
      id: 0,
    };

    columns
      .map((column) => column.id)
      .forEach((idColumna) =>
        Object.defineProperty(edit, idColumna, {
          value: null,
          writable: true,
          enumerable: true,
          configurable: true,
        }),
      );
    setEditableObj(edit);
  };

  /*
  const inInColumns = (item: DetailColumnItem, columns: ColumnConDetalle[]): boolean => {
    return columns.find((c) => c.idColumna === item.idColumna) !== undefined;
  };

  const determineItem = (items: DetailColumnItem[], columns: ColumnConDetalle[]): DetailColumnItem => {
    var index = items.findIndex((i) => inInColumns(i, columns));
    return items[index];
  };
  */

  const edit = (item: any): void => {
    const edit = {
      id: item.id,
    };
    /*
    columns.map((column) => column.idColumna).map((idColumna) => Object.defineProperty(edit, idColumna, 
      {value : item[idColumna],
       writable : true,
       enumerable : true,
       configurable : true}))
    */
    columns
      .map((column) => column.idColumna)
      .forEach((idColumna) =>
        Object.defineProperty(edit, idColumna, {
          value: item[idColumna],
          writable: true,
          enumerable: true,
          configurable: true,
        }),
      );
    setEditableObj(edit);
    setEditingKey(item.id);
  };

  const calculateNextId = (): number => {
    if (data.length === 0) {
      setNextKey(nextKey + 1);
      return nextKey; // nextKey - 1
    } else {
      return data[data.length - 1].id + 1; // data.pop().id+1
    }
  };

  const addRow = (): void => {
    if (addingRow || editingKey) return;

    var newRecord = {
      id: calculateNextId(),
    };
    /*
    columns.map((column) => column.id).map((idColumna) => Object.defineProperty(newRecord, idColumna, 
      {value : null,
       writable : true,
       enumerable : true,
       configurable : true}))
    */
    columns
      .map((column) => column.id)
      .forEach((idColumna) =>
        Object.defineProperty(newRecord, idColumna, {
          value: null,
          writable: true,
          enumerable: true,
          configurable: true,
        }),
      );
    setData([...data, newRecord]);

    setAddingRow(true);
    edit(newRecord);
  };

  /*
  const onShowSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(current);
  };

  const onChangeCurrentPage = (page: number) => {
    setCurrentPage(page);
  };
  */

  const previewToColumn = (preview: PreviewResponse): ColumnConDetalle => {
    return {
      id: preview.id,
      title: preview.titulo,
      idColumna: preview.id,
      requerido: preview.opcional === 0 ? 1 : 0,
      type: preview.tipo,
    };
  };

  const buildColumns = (collection: PreviewResponse[]): ColumnConDetalle[] => {
    return collection.map((c) => previewToColumn(c));
  };

  const obtenerColumnas = async () => {
    const api = apis['CAJA'];
    const res = api.resources['PREVIEW'];
    var data = {
      idTipoCaja: props.cajaId,
      idPlantilla: props.plantillaId,
      idTipoContenido: 1,
    };
    const axiosConfig = buildAxiosRequestConfig(api, res, { data });
    const response = await axios.request<PreviewResponse[]>(axiosConfig);

    if (response.status === 200) {
      const columns = buildColumns(response.data);
      setColumns(columns);
      obtenerDatos(columns);
      mkEditObject(columns);
    }
    //else message.error('Ocurrió un error obteniendo la preview');
  };

  useEffect(() => {
    setLoading(true);
    obtenerColumnas();
  }, [props.plantillaActual]);

  // hay que que si está en la pag. 3 (por ejemplo) cuando tenga que volver atras vaya a pag. 2; actualmente va a pag. 1
  const eliminar = async (id: number) => {
    await eliminarDetalleCajaById(id)
      .then((_) => {
        /*
        if (mustGoBackPage()) {
          setCurrentPage(currentPage - 1);
        }
        */
        setData(data.filter((d) => d.id !== id));
        if (data.length === 1) {
          props.setDisable(false); // Es el último
        }
      })
      .catch((e) => { });
  };

  /*
    const buildEmptyColumns = (): DetailColumnItem[] => {
      var ret: DetailColumnItem[] = [];
      columns &&
        columns.map((c) => {
          ret.push({
            idColumna: c.idColumna,
            valor: null,
          });
        });
      return ret;
    };
  */
  function foundError() {
    var ret = false;
    columns.forEach((c) => {
      //var item = editableObj;
      ret = ret || (c.requerido === 1 && !editableObj[c.idColumna]);
    });
    return ret;
  }
  /*
  const allFieldsAreEmpty = () => {
    const ret = Object.keys(editableObj).filter((key) => key !== 'id').length === 0;
    return ret;
  };
  */

  // Busca el id para el sector
  const findIdForASector = (sectorDescription: string) => {
    return sectores.find((s) => s.descripcion === sectorDescription)?.id;
  };
  // busca el id para un valor
  const findIdForAValor = (valorDescription: string) => {
    return valores.find((v) => v.descripcion === valorDescription)?.id;
  };

  /*
  const determineColumnsResponse = (details: DetailColumnItem[]): DetailColumnItem[] => {
    return details.map((d) => determineValue(d));
  };
  
  const determineValue = (detail: any): DetailColumnItem => {
    var copy = Object.assign({}, detail);
    columns.forEach((c) => {
      if (c.idColumna === copy.idColumna && c.type === 'lista') {
        copy.valor = findIdForASector(copy.valor);
      }
      if (c.idColumna === copy.idColumna && c.type === 'valores') {
        copy.valor = findIdForAValor(copy.valor);
      }
    });
    return copy;
  };
  */

  const determineValue = (value: any, idColumna: number): number => {
    var ret = value;
    columns.forEach((c) => {
      if (c.idColumna === idColumna && c.type === 'lista') {
        ret = findIdForASector(value);
      }
      if (c.idColumna === idColumna && c.type === 'valores') {
        ret = findIdForAValor(value);
      }
    });
    return ret;
  };

  const determineColumnsResponse = (edit: any): DetailColumnItem[] => {
    /*
    Object.keys(edit).filter((p1) => p1 !== 'id').map((p2) => (
      ret.push({
        idColumna: parseInt(p2),
        valor: determineValue(edit[p2], parseInt(p2)) 
      })
    ))
    */
    var ret: DetailColumnItem[] = [];
    Object.keys(edit)
      .filter((p1) => p1 !== 'id')
      .forEach((p2) =>
        ret.push({
          idColumna: parseInt(p2),
          valor: determineValue(edit[p2], parseInt(p2)),
        }),
      );

    return ret;
  };
  //.map((detail) => determineValue(detail))

  // Se fija para caja con detalle si alguna fecha es null
  const anyEmptyDates = (): boolean => {
    return !props.fechaDesde || !props.fechaHasta;
  };

  const save = async (id: number) => {
    if (foundError()) {
      // || allFieldsAreEmpty()
      return;
    }

    var index = data.findIndex((data) => data.id === id);
    //updateEditableItem();
    if (editableObj) {
      if (addingRow) {
        if (props.hasBeenAChange) {
          // si hubo un cambio actualizo la caja
          props.modificarCaja();
        }

        await addDetail({
          idCaja: props.cajaId, // NECESARIOS
          idPlantilla: props.plantillaId, // NECESARIOS
          columnas: determineColumnsResponse(editableObj), // NECESARIO
        })
          .then((res) => {
            editableObj.id = res[0].id;
            data.splice(index, 1, editableObj);
            setData([...data]);
            props.setDisable(true);
          })
          .catch((e) => e);
      } else {
        await updateDetail({
          id: editableObj.id,
          columnas: determineColumnsResponse(editableObj),
        })
          .then((_) => {
            data.splice(index, 1, editableObj);
            setData([...data]);
            props.setDisable(true);
          })
          .catch((e) => e);
      }
    }
    setEditingKey(undefined);
    setAddingRow(false);
    setEditableObj({});
  };

  const findListaDescription = (id: any): string | undefined => {
    var res = sectores.find((s) => s.id === parseInt(id));
    if (res) {
      return res.descripcion;
    } else {
      return id;
    }
  };

  const findValorDescription = (id: any): string | undefined => {
    var res = valores.find((s) => s.id === parseInt(id));
    if (res) {
      return res.descripcion;
    } else {
      return id;
    }
  };

  const buildOnChange = (value: any, col: any, item: any) => {
    //props.editableItem[col] = value;
    item[col.idColumna] = value;
    setEditableObj({
      ...item,
    });
  };

  const handleTableChange = (pagin: TablePaginationConfig, filters: any, sorter: any) => {
    setPagination(pagin);
  };

  const help = (col: any) => {
    if (col.requerido === 1 && !editableObj[col.idColumna]) {
      return <p style={{ fontSize: 10 }}>Obligatorio</p>
    }
    return undefined;
  };

  const validateStatus = (col: any) => {
    if (col.requerido === 1 && !editableObj[col.idColumna]) {
      return 'error';
    }
    return 'success';
  };

  return !loading ? (
    <Card size="small" title="Plantilla" bordered={false}>
      <Table size="small" dataSource={data} pagination={pagination} onChange={handleTableChange} locale={{ emptyText: <></> }} className={styles.table}>
        {columns.map((col, i) => (
          <Column
            title={col.title}
            dataIndex={col.idColumna}
            key={col.id}
            render={(value: any, record: any, index: number) => {
              if (isEditing(record.id)) {
                if (col.type === 'texto') {
                  return (
                    <Form.Item validateStatus={validateStatus(col)} help={help(col)}>
                      <Input
                        maxLength={255}
                        type="text"
                        style={{ minWidth: '140px' }}
                        value={editableObj[col.idColumna]}
                        onKeyDown={(e) => {
                          return !/^[a-zA-Z0-9.\s]*$/.test(e.key) && e.preventDefault();
                        }}
                        onChange={(e) => {
                          e.preventDefault();
                          buildOnChange(e.currentTarget.value, col, editableObj);
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
                        value={editableObj[col.idColumna]}
                        placeholder="dd/mm/aaaa"
                        format={'DD/MM/YYYY'}
                        onChange={(e) => {
                          buildOnChange(e, col, editableObj);
                        }}
                      />
                    </Form.Item>
                  );
                }
                if (col.type === 'entero' || col.type === 'decimal') {
                  return (
                    <Form.Item validateStatus={validateStatus(col)} help={help(col)}>
                      <Input
                        type="number"
                        id="inputNumber"
                        style={{ minWidth: '120px' }}
                        value={editableObj[col.idColumna]}
                        min={1}
                        max={99999999}
                        onKeyDown={(e) => {
                          // restrict e,+,-,E, etc characters in  input type number
                          const charCode = e.which ? e.which : e.keyCode;
                          return charcodes.includes(charCode) && e.preventDefault();
                        }}
                        onChange={(e) => {
                          e.preventDefault();
                          buildOnChange(e.currentTarget.value, col, editableObj);
                        }}
                      />
                    </Form.Item>
                  );
                }
                if (col.type === 'lista') {
                  return (
                    <Form.Item validateStatus={validateStatus(col)} help={help(col)}>
                      <Select
                        value={findListaDescription(editableObj[col.idColumna])}
                        style={{ minWidth: '200px' }}
                        onChange={(e) => {
                          buildOnChange(e, col, editableObj);
                        }}>
                        {sectores &&
                          sectores.map((s, key) => (
                            <Select.Option value={s.descripcion} key={key}>
                              {s.descripcion}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Item>
                  );
                }
                if (col.type === 'valores') {
                  return (
                    <Form.Item validateStatus={validateStatus(col)} help={help(col)}>
                      <Select
                        value={findValorDescription(editableObj[col.idColumna])}
                        style={{ minWidth: '220px' }}
                        onChange={(e) => {
                          buildOnChange(e, col, editableObj);
                        }}>
                        {valores &&
                          valores.map((v, key) => (
                            <Select.Option value={v.descripcion} key={key}>
                              {v.descripcion}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Item>
                  );
                }
              } else {
                if (col.type === 'texto') {
                  return record[col.idColumna] ? record[col.idColumna] : '-';
                }
                if (col.type === 'decimal') {
                  return record[col.idColumna] ? record[col.idColumna] : '-';
                }
                if (col.type === 'entero') {
                  return record[col.idColumna] ? record[col.idColumna] : '-';
                }
                if (col.type === 'valores') {
                  return findValorDescription(value);
                }
                if (col.type === 'lista') {
                  return findListaDescription(value);
                }
                if (col.type === 'fecha') {
                  return record[col.idColumna] ? (
                    <Moment utc format="DD/MM/YYYY">
                      {record[col.idColumna]}
                    </Moment>
                  ) : (
                    '-'
                  );
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
                <Button type="link" onClick={(_) => save(record.id)} style={{ marginRight: 8 }}>
                  Guardar
                </Button>
                <Popconfirm title="Está seguro?" onConfirm={(e) => cancel()}>
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
        type="primary"
        disabled={addingRow || editingKey || anyEmptyDates() ? true : undefined} // || props.hasBeenAChange ? true : undefined
        onClick={(e) => {
          addRow();
          setPagination({
            ...pagination,
            current: pagination.pageSize ? Math.ceil((data.length + 1) / pagination.pageSize) : 1,
          });
          props.setDisable(true);
        }}
      //style={{ background: '#FFA233', borderColor: '#FFA233' }}
      >
        <PlusCircleOutlined style={{ fontSize: '15px' }} />
        Agregar
      </Button>
    </Card>
  ) : (
    <></>
  );
};

export interface ColumnConDetalle {
  id: number;
  title: string; // nombre de la columbna en bd
  idColumna: number; // propiedad del objeto column que va a servir para matchearlo con el objeto que llena la grilla -- En la preview armar el objeto que necesite --Ejemplos, valor1, idColumna1
  requerido: number; // indica si la propiedad es requerida o no (para despues editar)
  type: string; // el tipo del objeto que se va a manipular
  long?: string; // la longitud del campo editable
}

interface PreviewResponse {
  id: number; // 241
  idPlantilla: number; // 109
  longitud: string | null; // null
  opcional: number; // 0
  orden: number; // 1
  tipo: string; // "entero"
  referencia: string | null; // null
  titulo: string; // "Número de Legajo"
  version: number; //0
}

export interface ConDetalleObject {
  id: number; // identificador del objeto
  columnas: ParticularConDetalleObject[];
}

export interface ParticularConDetalleObject {
  idColumna: number; // identificador de la columna
  valor: string;
}

export type DetailItem = {
  id: number;
  columns: DetailColumnItem[];
};

export type Sector = {
  id: number;
  descripcion: string;
};

export type Valor = {
  id: number;
  descripcion: string;
};

export type DetailColumnItem = {
  idColumna: number; // Hay que buscar en las columnas del preview el que coincide con el tipo de dato para esta columna, y dependiendo el valor poner ese dato en valor
  valor: Momento | null | any;
};
