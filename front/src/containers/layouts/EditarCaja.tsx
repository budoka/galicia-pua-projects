import React, { useEffect, useState, ReactNode, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { HeaderCaja } from '../../components/HeaderCaja';
import { InfoNoEditable } from '../../components/InfoNoEditable';
import { Form, Select, Input, Checkbox, Row, Col, Button, Spin, Modal, Result, DatePicker, Space } from 'antd';
import { TipoCaja } from '../../types/TipoCaja';
import moment, { Moment } from 'moment';
import Dayjs from 'dayjs';
import {
  getTiposDeCajas,
  getTiposDeContenido,
  getPlantillas,
  obtenerCajaById,
  buscarFechaVencimiento,
  modificarCaja,
  getPreview,
} from '../../API/AbrirCajaAPI';
import { Plantilla } from '../../components/PlantillaSelect';
import { DatePickerSelect } from '../../components/DatePickerSelect';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { Etiquetas } from '../../components/Etiquetas';
import { LoadingOutlined } from '@ant-design/icons';
import { IPDFData, createCajaPDF } from '../../helpers/pdf';
import { GridConContenido } from '../../components/GridConContenido';
import { GridConDetalle } from '../../components/GridConDetalle';
import { eliminarCaja, cerrarCaja, ActionResult, HttpStatusCode } from '../../API/CajaAPI';
import { ModalProps } from 'antd/lib/modal';
import { TablePaginationConfig } from 'antd/lib/table';
import {
  BoxDetailTemplate,
  BoxDetailTemplateAPIResponse,
  BoxDocumentColumnTemplate,
  BoxDocumentTemplate,
  BoxDocumentTemplateAPIResponse,
  BoxLabelTemplateAPIResponse,
  BoxTemplate,
  BoxTemplateAPIResponse,
} from '../../types/caja-templates';
import { excelToDatabase, previewToExcel } from '../../utils/ExportExcel';
import { message } from 'antd';
import { useAzureAuth } from '../../auth/hook/use-azure-auth';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import { Loading, LoadingContent } from 'src/components/loading';
import { Texts } from 'src/constants/texts';
import { TableModal } from 'src/components/table-modal';
import { ColumnTypeEx } from 'src/components/table';
import { useAppDispatch } from 'src/store';
import {
  saveDocumentosCodigoBarras,
  setBarcodeData,
  setCurrentDocumentType,
  setInput,
  setVisible,
} from 'src/features/cajas/cajas-codigo-barras/cajas-codigo-barras.slice';
import { columns, DocumentoCodigoBarras } from 'src/features/cajas/cajas-codigo-barras/types';
import { unwrapResult } from '@reduxjs/toolkit';
import { isDateBetween, isDateBetweenMoment, renderOptions } from 'src/utils/Common';
import _ from 'lodash';
import { LabeledValue } from 'antd/lib/select';

const { RangePicker } = DatePicker;

export const EditarCaja: React.FC = () => {
  const [numeroCaja, setNumeroCaja] = useState<string>();
  const [estadoCaja, setEstadoCaja] = useState<string>();
  const [fechaUltimoCambioEstado, setFechaUltimoCambioEstado] = useState<Date>();
  const [usuarioCreador, setUsuarioCreador] = useState<string>();
  const [legajo, setLegajo] = useState<string>();
  const [username, setUserName] = useState<string>();
  const [idUsuarioAlta, setIdUsuarioAlta] = useState<number>();
  const [sectorPropietario, setSectorPropietario] = useState<string>();
  const [idSector, setIdSector] = useState<string>();
  const [nombreSector, setNombreSector] = useState<string>();
  const [tipoCajaSeleccionada, setTipoCajaSeleccionada] = useState<string>();
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState<string>();
  const [idTipoContenido, setIdTipoContenido] = useState<number>();
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<string>();
  const [fechaDocumentacionDesde, setFechaDocumentacionDesde] = useState<Moment | null>(null);
  const [fechaDocumentacionHasta, setFechaDocumentacionHasta] = useState<Moment | null>(null);
  const [descripcion, setDescripcion] = useState<string>();
  const [restringido, setRestringido] = useState<boolean>(false);
  const [fechaVencimiento, setFechaVencimiento] = useState<Moment | null>();
  const [fechaGeneracion, setFechaGenerion] = useState<Date | undefined>();
  const [tiposDeCajas, setTiposDeCajas] = useState<TipoCaja[]>([]);
  const [tiposPlantillas, setTiposPlantillas] = useState<Plantilla[]>([]);
  const [tiposDeContenido, setTiposDeContenido] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasBeenAChange, setHasBeenAChange] = useState<boolean>(false);
  const [disabled, setDisable] = useState<boolean>(false);
  const location = useLocation();
  const [form] = Form.useForm();
  const [componentSize, setComponentSize] = useState<number | string>('middle');
  const [errorGrid, setErrorGrid] = useState<boolean>(false);
  const [idTipoDocumental, setIdTipoDocumental] = useState<number>();
  const [cajaID, setCajaID] = useState<number>();
  const [plantillaID, setPlantillaID] = useState<number>();
  const [caratula, setCaratula] = useState<IPDFData>({ destino: 'Archivo Central', filename: 'Caratula' } as IPDFData);

  const auth = useAzureAuth();

  const cajasCodigoBarras = useSelector((state: RootState) => state.cajas.codigoBarras);
  const dispatch = useAppDispatch();

  var currentAccounts = auth.authInstance?.getAllAccounts();
  var nombreUsuario = currentAccounts && currentAccounts[0] ? currentAccounts[0].name : '';
  var numeroLegajo = currentAccounts && currentAccounts[0] ? currentAccounts[0].username.split('@')[0] : '';

  const pagination: TablePaginationConfig = {
    pageSize: 5,
    defaultCurrent: 1,
    pageSizeOptions: ['10', '20', '50'],
  };

  const [editableItem, setEditableItem] = useState<DataSource>({
    // AGREGAR LAS OTRAS PROPIEDADES QUE PUEDEN LLEGAR A VENIR PARA CAJA CON DOC.
    id: 0,
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
  });

  const history = useHistory();

  const [data, setData] = useState<Data>({
    dataSource: [],
  });

  //console.log("ID USUARIO ALTA: " + idUsuarioAlta);

  const inputFile = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    document.title = 'PUA - Editar Caja';
    const searchParams = new URLSearchParams(location.search);

    const obtenerCaja = async (id: string | null) => {
      await obtenerCajaById(id)
        .then((caja) => {
          if (caja) {
            setNumeroCaja(caja.numero.toString());
            setEstadoCaja(caja.stateId);
            setCajaID(caja.numero);
            setPlantillaID(caja.idPlantilla);
            setFechaGenerion(new Date(caja.fechaGeneracion));
            setFechaUltimoCambioEstado(new Date(caja.fechaUltimaTransicion));
            setTipoCajaSeleccionada(caja.nombreTipoCaja);
            setContenidoSeleccionado(caja.descripcionContenido);
            setIdTipoContenido(caja.tipoContenido);
            setUsuarioCreador(caja.legajo + ' - ' + caja.nombre);
            setLegajo(numeroLegajo);
            setUserName(nombreUsuario);
            setIdUsuarioAlta(caja.idUsuarioAlta);
            setSectorPropietario(caja.idSectorOrigen + ' - ' + caja.nombreSector);
            setIdSector(caja.idSectorOrigen);
            setNombreSector(caja.nombreSector);
            if (caja.idPlantilla) setPlantillaSeleccionada(caja.descripcionPlantilla); // hay que poner la descrip posta
            if (caja.descripcion) setDescripcion(caja.descripcion);
            if (caja.restringida) setRestringido(caja.restringida === 1);
            if (caja.fechaVencimiento) setFechaVencimiento(moment.utc(new Date(caja.fechaVencimiento)));

            if (caja.contenido.length > 0) {
              setData({
                dataSource: buildDataSource(caja.contenido),
              });

              setDisable(true);
            }

            setCaratula({
              ...caratula,
              sector: caja.nombreSector,
              centroDeCostos: caja.idSectorOrigen,
              numeroDeCaja: caja.numero.toString(),
              descripcion: caja.descripcion,
            });

            if (caja.fechaDocumentacionDesde) setFechaDocumentacionDesde(moment.utc(new Date(caja.fechaDocumentacionDesde)));
            if (caja.fechaDocumentacionHasta) setFechaDocumentacionHasta(moment.utc(new Date(caja.fechaDocumentacionHasta)));

            setLoading(false);
          }
        })
        .catch((error) => { });
    };
    obtenerCaja(searchParams.get('id'));
    obtenerTiposDeCajas();
    obtenerPlantillas();
  }, []);

  useEffect(() => {
    if (estadoCaja === 'PendienteRecepcion') history.push('/');
  }, [estadoCaja]);

  interface CustomModalProps extends ModalProps {
    content: ReactNode;
  }

  type CajaAction = 'Cerrar' | 'Eliminar';
  type StateAction = 'idle' | 'running' | 'stopped' | 'done' | 'error';

  interface CajaState {
    action?: CajaAction;
    state?: StateAction;
    getResultAction?: () => Promise<ActionResult>;
    message?: string;
  }

  const sesion = useSelector((state: RootState) => state.sesion);

  const [modal, setModal] = useState<CustomModalProps>({
    visible: false,
    confirmLoading: false,
    content: null,
  });
  const [cajaState, setCajaState] = useState<CajaState>({});

  const showModal = (action: CajaState['action'], title: string, fn: CajaState['getResultAction']) => {
    setCajaState({
      action,
      state: 'idle',
      getResultAction: fn,
    });
    setModal({
      title,
      visible: true,
      confirmLoading: false,
      content: <Result status="info" title={title} />,
    });
  };

  const handleModalStateChange = (state: StateAction) => {
    setCajaState({
      ...cajaState,
      state: state,
    });
  };

  const handleModalCancel = () => {
    handleModalStateChange('stopped');
  };

  const handleModalOk = () => {
    handleModalStateChange('running');
  };

  useEffect(() => {
    if (cajasCodigoBarras.documentTypes && cajasCodigoBarras.documentTypes?.length > 0)
      dispatch(setCurrentDocumentType(cajasCodigoBarras.documentTypes[0]));
  }, [cajasCodigoBarras.documentTypes]);

  useEffect(() => {
    if (!cajaState.getResultAction) return;

    const resultAction = async () => {
      return await cajaState.getResultAction!()
        .then((result) => result)
        .catch((error) => error as ActionResult);
    };
    if (cajaState.state === 'idle') {
      setModal({
        ...modal,
        confirmLoading: false,
        content: <Result status="info" title={modal.title} />,
      });
    } else if (cajaState.state === 'running' && cajaState.getResultAction) {
      setModal({
        ...modal,
        confirmLoading: true,
        content: <Result status="warning" title="Procesando..." />,
      });
      setTimeout(async () => {
        resultAction().then((response) => {
          setCajaState({
            ...cajaState,
            //state: response.success ? 'done' : 'error',
            state: response.success ? 'done' : 'error',
            message: response.message,
          });
        });
      }, 1000);
    } else if (cajaState.state === 'done') {
      setModal({
        ...modal,
        confirmLoading: false,
        content: (
          <Result
            status="success"
            title={
              <>
                <span>La operación ha finalizado correctamente.</span>
                <br />
                <span>Redireccionando...</span>
              </>
            }
          />
        ),
      });
      setTimeout(() => {
        history.push('/');
      }, 3000);
    } else if (cajaState.state === 'error') {
      setModal({
        ...modal,
        confirmLoading: false,
        // content: <Result status="error" title={`No se ha podido ${cajaState.action?.toLowerCase()} la caja`} />,
        content: (
          <Result
            status="error"
            title={
              <>
                <span>{`No se ha podido ${cajaState.action?.toLowerCase()} la caja.`}</span>
                <br />
                <span>{cajaState.message}</span>
              </>
            }
          />
        ),
      });
    } else if (cajaState.state === 'stopped') {
      setModal({
        ...modal,
        visible: false,
      });
    }
  }, [cajaState.state]);

  const obtenerTiposDeCajas = async () => {
    await getTiposDeCajas()
      .then((tiposDeCajas) => setTiposDeCajas(tiposDeCajas))
      .catch((e) => e);
  };

  const obtenerTiposDeDocumentos = async () => {
    tipoCajaSeleccionada !== undefined &&
      (await getTiposDeContenido(tipoCajaSeleccionada)
        .then((tiposContenido) => setTiposDeContenido(tiposContenido))
        .catch((e) => e));
  };

  const obtenerPlantillas = async () => {
    await getPlantillas(sesion.data.idSector)
      .then((plantillas) => setTiposPlantillas(plantillas))
      .catch((e) => e);
  };

  const resetForms = () => {
    form.resetFields(['plantilla']);
    form.resetFields(['fecha']);
  };

  useEffect(() => {
    form.resetFields(['tipo Contenido']);
    resetForms();
    obtenerTiposDeDocumentos();
  }, [tipoCajaSeleccionada]);

  useEffect(() => {
    resetForms();
  }, [contenidoSeleccionado]);

  useEffect(() => { }, [editableItem]);

  const contentToDataSource = (content: Content) => {
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
    };
  };

  const buildDataSource = (contents: Content[]): DataSource[] => {
    var result = contents.map((c) => contentToDataSource(c));

    return result;
  };

  const onFormLayoutChange = (size: number) => {
    setComponentSize(size);
  };

  const buscarCajaPorId = () => {
    return tiposDeCajas.find((c) => c.descripcion === tipoCajaSeleccionada);
  };

  /*   const buscarCajaPorTipoContenido = () => {
    return tiposDeContenido.find((c) => c.descripcion === tipoCajaSeleccionada);
  };
 */
  const actualizarFechaVencimiento = async (e: Moment | null) => {
    let idCaja: any = buscarCajaPorId()?.id;
    setError(false);
    setFechaDocumentacionHasta(e);

    buscarFechaVencimiento(idCaja, contenidoSeleccionado)
      .then((anios) => {
        setFechaVencimiento(e ? e.clone().add(anios, 'year') : null);
      })
      .catch((e) => e);
  };

  const onChangeCheck = (e: CheckboxChangeEvent) => {
    setRestringido(e.target.checked);
  };

  const buscarPlantillaPorId = () => {
    return tiposPlantillas.find((p) => p.descripcion === plantillaSeleccionada);
  };

  const setPlantilla = (plantilla: string | undefined) => {
    setError(false);
    setPlantillaSeleccionada(plantilla);
  };

  const actualizarFechaDocDesde = (e: Moment | null) => {
    setError(false);
    setFechaDocumentacionDesde(e);
  };

  const modificarUnaCaja = () => {
    // ponerle un tipo a esta caja
    let caja: any = {
      idUsuario: sesion.data.idUsuario!,
      numero: numeroCaja,
      descripcion: descripcion,
      fechaDesde: fechaDocumentacionDesde ? fechaDocumentacionDesde.format('YYYY-MM-DD').toLocaleLowerCase() : null,
      fechaHasta: fechaDocumentacionHasta ? fechaDocumentacionHasta.format('YYYY-MM-DD').toLocaleLowerCase() : null,
      fechaVencimiento: fechaVencimiento ? fechaVencimiento.format('YYYY-MM-DD').toLocaleLowerCase() : null,
      idTipoCaja: buscarCajaPorId()?.id,
      tipoContenido: contenidoSeleccionado,
      idPlantilla: buscarPlantillaPorId()?.id,
      restringida: restringido ? 1 : 0,
    };

    return caja;
  };

  const modificar = async (redirect: boolean = false) => {
    let caja: CajaT | null = null;
    if (tipoCajaSeleccionada && contenidoSeleccionado) {
      if (fechaDocumentacionDesde && fechaDocumentacionHasta) {
        if (fechaDocumentacionHasta.isBefore(fechaDocumentacionDesde)) {
          setError(true);
          return;
        }
        if (plantillaSeleccionada) {
          caja = modificarUnaCaja();
        } else {
          if (contenidoSeleccionado === 'Caja con Etiqueta') {
            caja = modificarUnaCaja();
          } else {
            setError(true);
            return;
          }
        }
      } else {
        if (contenidoSeleccionado === 'Caja con Documentos') {
          caja = modificarUnaCaja();
        } else {
          // es caja con etiquetas
          setError(true);

          return;
        }
      }
    } else {
      setError(true); // acá cae cuando las fechas son vacias...

      return;
    }

    if (!caja) return;

    await modificarCaja(caja)
      .then(() => {
        setHasBeenAChange(false);
        setCaratula({
          ...caratula,
          sector: nombreSector ? nombreSector : '',
          centroDeCostos: idSector ? idSector : '',
          numeroDeCaja: numeroCaja ? numeroCaja : '',
          descripcion: descripcion ? descripcion : '',
        });
        if (redirect) history.push('/')
        else window.location.reload();
      })
      .catch((e) => e);
  };

  const openDialogImportExcel = async () => {
    inputFile.current?.click();
  };

  const importExcel = async (files: FileList | null, boxId: number) => {
    if (!files) return;

    const key = 'message';

    message.loading({ key, content: 'Importando Excel...', duration: 0 });

    const preview = await mapToPreview();
    await excelToDatabase(files[0], preview!, boxId)

      .then((res) => {
        if (HttpStatusCode.OK === res.status) {
          message.success({ key, content: 'Importado correctamente.' });
          setTimeout(() => {
            message.info({ key, content: 'Cargando...' });
            document.location.reload();
          }, 2000);
        } else {
          message.error({ key, content: 'Error al importar Excel. Valide que los datos cargados sean correctos.', duration: 5 });
        }
      })
      .catch((err) => {
        message.error({
          key,
          content: 'Error al importar Excel. ' + err.message ?? 'El servicio no está disponible.',
          duration: 5,
        });
      });
  };

  const mapToPreview = async () => {
    const boxTypeId = buscarCajaPorId()?.id;
    const templateId = buscarPlantillaPorId()?.id;
    const contentType = contenidoSeleccionado!;

    try {
      const rawPreview = (await getPreview(boxTypeId, templateId, contentType)) as BoxTemplateAPIResponse;
      let preview: BoxTemplate = [];

      if (rawPreview.length === 0) return;

      if ((rawPreview[0] as BoxDocumentTemplateAPIResponse).inclusiones) {
        const documentPreview = rawPreview as BoxDocumentTemplateAPIResponse[];
        preview = documentPreview.map((doc) => {
          return {
            id: doc.id,
            description: doc.descripcion,
            inclusions: doc.inclusiones.map((i) => {
              return {
                title: i.descripcion,
                dataType: i.tipoDato,
                required: i.requerido,
              } as BoxDocumentColumnTemplate;
            }),
          } as BoxDocumentTemplate;
        });
      } else if ((rawPreview[0] as BoxDetailTemplateAPIResponse).idPlantilla) {
        const detailPreview = rawPreview as BoxDetailTemplateAPIResponse[];
        preview = detailPreview.map((doc) => {
          return {
            id: doc.id,
            title: doc.titulo,
            dataType: doc.tipo,
            required: +!doc.opcional,
            order: doc.orden,
            length: doc.longitud,
            templateId: doc.idPlantilla,
          } as BoxDetailTemplate;
        });
      } /* else if ((rawPreview[0] as BoxLabelTemplateAPIResponse).legacy) {
      } */ else {
        return;
      }

      return preview;
    } catch (err) { }
  };

  /*   const [modalBarcodes, setModalBarcodes] = useState<{ input?: string; dataSource: DocumentByBarcode[]; visible: boolean }>({
    dataSource: [],
    visible: false,
  });
 */

  const setModalBarcodesVisible = (visible: boolean) => {
    dispatch(setVisible(visible));
    //setModalBarcodes((state) => ({ ...state, visible, input: '', dataSource: [] }));
  };

  const onBarcodeChange = (event?: React.ChangeEvent<HTMLInputElement>) => {
    const barcode = event?.currentTarget.value;

    dispatch(setInput(barcode ?? ''));

    const values = barcode?.split('-');
    // 179-01/12/2020

    if (values && values.length === 2) {
      const sucursal = values[0];
      const fecha = values[1];

      const minDate = moment(new Date(1910, 1, 1));
      const maxDate = moment(new Date(2999, 12, 31));

      const isValidSucursal = sucursal.match(/[0-9]+/);
      const isValidFecha =
        moment(fecha, ['DD/MM/YYYY', 'D/MM/YYYY'], true).isValid() &&
        isDateBetweenMoment(minDate, maxDate, fecha, ['DD/MM/YYYY', 'D/MM/YYYY']);

      if (isValidSucursal && isValidFecha) {
        const barcodeExist = cajasCodigoBarras.data.map((doc) => doc.key).includes(barcode!);

        if (barcodeExist) {
          message.error(`El código de barras ${barcode} ya fue agregado`);
          return;
        }

        const record = {
          key: barcode,
          sucursal,
          fecha,
        } as DocumentoCodigoBarras;

        dispatch(setBarcodeData(record));
      }
    }
  };

  const exportTemplate = async () => {
    try {
      const preview = await mapToPreview();
      previewToExcel(`TemplateIngresarDocumento-${numeroCaja}.xlsx`, preview!);
    } catch (err) { }
  };

  return (
    <>
      <div>
        <HeaderCaja
          titulo={'Modificar Caja'}
          showAlert={true}
          mensaje={"Ingrese contenido a la caja. Para finalizar presione 'Cerrar Caja'"}
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '0 150px' }}>
          {!loading ? (
            <>
              <Row style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                <InfoNoEditable
                  fechaGeneracion={fechaGeneracion}
                  numero={numeroCaja}
                  estado={estadoCaja}
                  fechaUltimoCambioEstado={fechaUltimoCambioEstado}
                  //usuarioCreador={usuarioCreador}
                  legajo={legajo}
                  username={username}
                  sectorPropietario={sectorPropietario}
                  fechaVencimiento={fechaVencimiento}
                  setFechaVencimiento={setFechaVencimiento}
                />

                <div className="container">
                  <Form
                    form={form}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 18 }}
                    layout="horizontal"
                    initialValues={{ size: componentSize }}
                    onValuesChange={() => onFormLayoutChange}
                    size={'middle'}>
                    <Form.Item
                      name="tipo de Caja"
                      label="Tipo de caja"
                      hasFeedback
                      validateStatus={error && !tipoCajaSeleccionada ? 'error' : 'success'}
                      help={error && !tipoCajaSeleccionada ? 'Debe seleccionar un tipo de caja' : undefined}
                      rules={[
                        {
                          required: true,
                          message: 'Un tipo de caja es requerido',
                        },
                      ]}
                      initialValue={tipoCajaSeleccionada}>
                      <Select
                        disabled={disabled}
                        value={tipoCajaSeleccionada}
                        onChange={(e) => {
                          setError(false);
                          setContenidoSeleccionado(undefined);
                          setPlantillaSeleccionada(undefined);
                          setFechaDocumentacionDesde(null);
                          setFechaDocumentacionHasta(null);
                          setFechaVencimiento(null);
                          setHasBeenAChange(true);
                          setTipoCajaSeleccionada(e);
                        }}>
                        {tiposDeCajas &&
                          tiposDeCajas.map((tipo, key) => (
                            <Select.Option value={tipo.descripcion} key={key}>
                              {tipo.descripcion}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="tipo Contenido"
                      label="Tipo de contenido"
                      validateStatus={error && tipoCajaSeleccionada && !contenidoSeleccionado ? 'error' : 'success'}
                      help={error && tipoCajaSeleccionada && !contenidoSeleccionado ? 'Debe seleccionar un tipo de contenido' : undefined}
                      hasFeedback={contenidoSeleccionado !== undefined}
                      rules={[
                        {
                          required: true,
                          message: 'Un tipo de contenido es requerido',
                        },
                      ]}
                      initialValue={contenidoSeleccionado}>
                      <Select
                        disabled={disabled}
                        value={contenidoSeleccionado}
                        onChange={(e) => {
                          setPlantillaSeleccionada(undefined);
                          setFechaDocumentacionDesde(null);
                          setFechaDocumentacionHasta(null);
                          setError(false);
                          setHasBeenAChange(true);
                          setFechaVencimiento(null);
                          setContenidoSeleccionado(e);
                        }}>
                        {tiposDeContenido &&
                          tiposDeContenido.map((c, key) => (
                            <Select.Option value={c} key={key}>
                              {c}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Item>

                    {contenidoSeleccionado && contenidoSeleccionado === 'Caja con Detalle' ? (
                      <>
                        <Plantilla
                          name={'plantilla'}
                          seleccionada={plantillaSeleccionada}
                          setSeleccionada={setPlantilla}
                          error={error}
                          setChange={setHasBeenAChange}
                          disabled={disabled}
                          default={plantillaSeleccionada}
                          setPlantillaID={setPlantillaID}
                        />

                        <Form.Item
                          name="fecha"
                          label="Fecha de documentación"
                          help={
                            error && !fechaDocumentacionDesde && !fechaDocumentacionHasta
                              ? 'Debe ingresar una fecha de documentación'
                              : undefined
                          }
                          validateStatus={error && !fechaDocumentacionDesde && !fechaDocumentacionHasta ? 'error' : 'success'}
                          hasFeedback
                          rules={[
                            {
                              required: true,
                              message: 'La fecha de documentación es requerida',
                            },
                          ]}
                          initialValue={[fechaDocumentacionDesde, fechaDocumentacionHasta]}>
                          <RangePicker
                            format={'DD/MM/YYYY'}
                            allowClear={false}
                            style={{ width: '100%' }}
                            disabled={disabled}
                            ranges={{
                              Hoy: [moment(), moment().endOf('day')],
                              [`1 ${Texts.MONTH}`]: [moment(), moment().add(1, 'month').endOf('day')],
                              [`3 ${Texts.MONTHS}`]: [moment(), moment().add(3, 'month').endOf('day')],
                              [`6 ${Texts.MONTHS}`]: [moment(), moment().add(6, 'month').endOf('day')],
                              [`1 ${Texts.YEAR}`]: [moment(), moment().add(1, 'year').endOf('day')],
                            }}
                            onChange={(values) => {
                              const fechaDesde = values && values.length > 0 && values[0];

                              actualizarFechaDocDesde(fechaDesde ? fechaDesde : null);

                              const fechaHasta = values && values.length > 1 && values[1];

                              actualizarFechaVencimiento(fechaHasta ? fechaHasta : null);
                            }}
                          />
                        </Form.Item>
                      </>
                    ) : contenidoSeleccionado && contenidoSeleccionado === 'Caja con Etiqueta' ? (
                      <Form.Item
                        name="fecha"
                        label="Fecha de documentación"
                        help={
                          error && !fechaDocumentacionDesde && !fechaDocumentacionHasta
                            ? 'Debe ingresar una fecha de documentación'
                            : undefined
                        }
                        validateStatus={error && !fechaDocumentacionDesde && !fechaDocumentacionHasta ? 'error' : 'success'}
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: 'La fecha de documentación es requerida',
                          },
                        ]}
                        initialValue={[fechaDocumentacionDesde, fechaDocumentacionHasta]}>
                        <RangePicker
                          allowClear={false}
                          style={{ width: '100%' }}
                          disabled={disabled}
                          onChange={(values) => {
                            const fechaDesde = values && values.length > 0 && values[0];

                            actualizarFechaDocDesde(fechaDesde ? fechaDesde : null);

                            const fechaHasta = values && values.length > 1 && values[1];

                            actualizarFechaVencimiento(fechaHasta ? fechaHasta : null);
                          }}
                        />
                      </Form.Item>
                    ) : (
                      <></>
                    )}

                    <Form.Item name={['user', 'introduction']} label="Descripción" initialValue={descripcion}>
                      <Input.TextArea
                        disabled={disabled}
                        allowClear
                        value={descripcion}
                        maxLength={200}
                        onChange={(e) => setDescripcion(e.currentTarget.value)}
                      />
                    </Form.Item>

                    <Form.Item label="Restringir" style={{ textAlign: 'left' }}>
                      <Checkbox disabled={disabled} value={restringido} checked={restringido} onChange={(e) => onChangeCheck(e)} />
                    </Form.Item>
                  </Form>
                </div>
              </Row>
              <Row style={{ display: 'flex', justifyContent: 'center' }}>
                {tipoCajaSeleccionada && contenidoSeleccionado && plantillaSeleccionada && contenidoSeleccionado === 'Caja con Detalle' ? (
                  <>
                    <GridConDetalle
                      cajaId={cajaID}
                      plantillaId={plantillaID}
                      setDisable={setDisable}
                      contenido={contenidoSeleccionado}
                      errorGrid={errorGrid}
                      hasBeenAChange={hasBeenAChange}
                      editableItem={editableItem}
                      plantillaActual={plantillaSeleccionada}
                      setEditableItem={setEditableItem}
                      fechaDesde={fechaDocumentacionDesde}
                      fechaHasta={fechaDocumentacionHasta}
                      //guardar={handleGuardar}
                      caja={tipoCajaSeleccionada}
                      modificarCaja={modificar}
                    />
                  </>
                ) : tipoCajaSeleccionada && contenidoSeleccionado && contenidoSeleccionado === 'Caja con Documentos' ? (
                  <>
                    <GridConContenido
                      cajaId={buscarCajaPorId()?.id}
                      plantillaId={buscarPlantillaPorId()?.id}
                      hasBeenAChange={hasBeenAChange}
                      numeroCaja={numeroCaja}
                      idTipoDocumental={idTipoDocumental}
                      setDisable={setDisable}
                      contenido={contenidoSeleccionado}
                      modificarCaja={modificar}
                      errorGrid={errorGrid}
                      setErrorGrid={setErrorGrid}
                      caja={tipoCajaSeleccionada}
                      setIdTipoDocumental={setIdTipoDocumental}
                    />
                  </>
                ) : (
                  contenidoSeleccionado &&
                  contenidoSeleccionado === 'Caja con Etiqueta' && (
                    <>
                      <Etiquetas
                        idCaja={+numeroCaja!}
                        idTipoCaja={buscarCajaPorId()?.id}
                        tipoContenido={contenidoSeleccionado}
                        etiquetasId={data.dataSource.map((d) => d.idEtiqueta!)}
                        setDisable={setDisable}
                        disable={false}
                        modificarCaja={modificar}
                        hasBeenAChange={hasBeenAChange}
                        fechaDesde={fechaDocumentacionDesde}
                        fechaHasta={fechaDocumentacionHasta}
                      />
                    </>
                  )
                )}
              </Row>
              <Row style={{ fontWeight: 'bold', marginBottom: 10 }}>
                <Col style={{ marginLeft: 'auto' }}>
                  <Space size={5}>
                    {contenidoSeleccionado &&
                      (contenidoSeleccionado === 'Caja con Documentos' || contenidoSeleccionado === 'Caja con Detalle') ? (
                      <>
                        {(tipoCajaSeleccionada === 'Caja legajos operativos' ||
                          tipoCajaSeleccionada === 'Legajos Comerciales' ||
                          tipoCajaSeleccionada === 'Caja Legajo Unif.Operativo y Comercial') && (
                            <Button onClick={() => setModalBarcodesVisible(true)}>Usar Código de Barras</Button>
                          )}
                        <Button onClick={exportTemplate}>Descargar Template Excel</Button>
                        <span></span>

                        <Button onClick={openDialogImportExcel}>Importar Excel</Button>
                        <input
                          type="file"
                          id="file"
                          //multiple
                          ref={inputFile}
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            //debugger
                            const element = e.target as HTMLInputElement;
                            //alert("Element :" + e.target.files ?? [0]);
                            //alert("Input File :" + inputFile);
                            //cons document.getElementById('fileItem').files[0];
                            importExcel(e.currentTarget.files, +numeroCaja!)

                              .then(() => {
                                //alert("Estoy en el then");
                                //element.value = '';
                              })

                              .catch(() => {
                                message.error("Hubo un error importando el Excel. Intente de nuevo")
                              });
                          }}
                        />
                        <span></span>
                      </>
                    ) : (
                      <></>
                    )}
                    {numeroCaja && (
                      <Button
                        onClick={() =>
                          showModal('Cerrar', '¿Desea cerrar la caja?', () =>
                            cerrarCaja({ idCaja: numeroCaja, idUsuario: sesion.data.idUsuario! }),
                          )
                        }>
                        Cerrar Caja
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
              <Row style={{ fontWeight: 'bold' }}>
                <Col>
                  <span>
                    <span style={{ color: 'rgb(255,0,0)' }}>{'(*) '}</span>
                    <em>Campos requeridos</em>
                  </span>
                </Col>
                <Col style={{ marginLeft: 'auto' }}>
                  <Space size={5}>
                    <Button type="primary" disabled={disabled} onClick={(e) => modificar()}>
                      Modificar Caja
                    </Button>
                    <span></span>
                    <Button type="primary" disabled={disabled} onClick={(e) => modificar(true)}>
                      Modificar y Volver
                    </Button>
                    <span></span>
                    <Button type="primary" onClick={(e) => createCajaPDF('code39', caratula, 500)}>
                      Imprimir Carátula
                    </Button>
                    <span></span>

                    <Modal
                      bodyStyle={{
                        height: cajaState.state === 'done' ? '353px' : '300px',
                      }}
                      destroyOnClose={true}
                      title={`${cajaState.action} caja`}
                      visible={modal.visible}
                      confirmLoading={modal.confirmLoading}
                      onOk={handleModalOk}
                      onCancel={handleModalCancel}
                      okText={`${cajaState.action} caja`}
                      cancelText="Cancelar"
                      cancelButtonProps={{ disabled: modal.confirmLoading }}
                      footer={cajaState.state === 'done' ? null : undefined}>
                      {modal.content}
                    </Modal>
                    {numeroCaja && (
                      <Button
                        type="primary"
                        onClick={() => showModal('Eliminar', '¿Desea eliminar la caja?', () => eliminarCaja(numeroCaja, idUsuarioAlta))}>
                        Eliminar Caja
                      </Button>
                    )}
                    <span></span>
                    <Button type="primary" onClick={() => history.push('/')}>
                      Volver
                    </Button>
                  </Space>
                </Col>
              </Row>
              <TableModal
                title={'Usar Código de Barras' ?? <br />}
                width={'50%'}
                okText={cajasCodigoBarras.loading.saving ? 'Confirmando' : 'Confirmar'}
                cancelText={'Cerrar'}
                onOk={() => {
                  const key = 'message';

                  dispatch(saveDocumentosCodigoBarras({ data: { idCaja: numeroCaja! } }))
                    .then(unwrapResult)
                    .then((status) => {
                      if (HttpStatusCode.OK === status) {
                        message.success({ key, content: 'Documentos cargados correctamente.' });
                        setTimeout(() => {
                          message.info({ key, content: 'Cargando...' });
                          document.location.reload();
                        }, 2000);
                      } else {
                        message.error({ key, content: 'Error al cargar documentos', duration: 5 });
                      }
                    })
                    .catch((err) => {
                      message.error({
                        key,
                        content: 'Error al cargar documentos.',
                        duration: 5,
                      });
                    });
                }}
                okButtonProps={{
                  loading: cajasCodigoBarras.loading.saving,
                  disabled:
                    _.isEmpty(cajasCodigoBarras.currentDocumentType) ||
                    cajasCodigoBarras.data.length === 0 ||
                    cajasCodigoBarras.loading.saving,
                  htmlType: 'submit',
                }}
                onCancel={() => setModalBarcodesVisible(false)}
                afterClose={() => setModalBarcodesVisible(false)}
                visible={cajasCodigoBarras.visible}
                table={{
                  columns,
                  dataSource: cajasCodigoBarras.data,
                  rowKey: 'key',
                  hideRowSelection: true,
                  extraColumns: { showKeyColumn: false, showActionsColumn: false },
                  extraComponents: [
                    {
                      key: 'barcodes',
                      node: (
                        <Input
                          placeholder="Ingrese un código de barras"
                          style={{ width: 200 }}
                          value={cajasCodigoBarras.input}
                          onChange={onBarcodeChange}
                        />
                      ),
                      position: 'top',
                    },
                    {
                      key: 'documentType',
                      node: (
                        <Select
                          style={{ width: 250 }}
                          labelInValue
                          value={cajasCodigoBarras.currentDocumentType as LabeledValue}
                          //optionFilterProp="children"
                          // filterOption={(input, option) => option && option.value && option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          placeholder={'Seleccione tipo documental'}
                          // loading={nuevaTransferencia.requiredData.tiposComisiones?.loading}
                          //disabled={nuevaTransferencia.requiredData.tiposComisiones?.loading}

                          onChange={(value, option: any) => {
                            const doc = {
                              value: option.value,
                              label: option.children,
                            };
                            dispatch(setCurrentDocumentType(doc));
                          }}>
                          {renderOptions(cajasCodigoBarras.documentTypes)}
                        </Select>
                      ),
                      position: 'top',
                    },
                    {
                      key: 'records-count-tag',
                      node: 'records-count-tag',
                      position: 'top',
                      style: { marginLeft: 'auto' },
                    },
                  ],
                  sortable: false,
                  pagination: { pageSize: 50 },
                  scroll: { y: 350 },
                }}
              />
            </>
          ) : (
            <Loading text={'Cargando'} size={26} style={{ marginTop: 50 }} />
          )}
        </div>
      </div>
    </>
  );
};

type CajaT = {
  fechaGeneracion: string;
  numero: number;
  stateId: string;
  fechaUltimaTransicion: string;
  idUsuarioAlta: number;
  legajo: string;
  nombre: string;
  idSectorOrigen: string;
  nombreSector: string;
  fechaVencimiento: string;
  idTipoCaja: number;
  tipoContenido: number;
  descripcionContenido: string;
  idPlantilla: number;
  fechaDocumentacionDesde: string;
  fechaDocumentacionHasta: string;
  nombreTipoCaja: string;
  descripcion: string;
  restringida: number;
  contenido: any[];
  descripcionPlantilla: string;
};

export interface Data {
  dataSource: DataSource[];
}

export type DataSource = {
  id: number | undefined;
  detalle?: string;
  idCaja?: string;
  fechaDocumental?: Moment | null;
  fechaDesde?: Moment | null;
  fechaHasta?: Moment | null;
  tipoDocumental?: string;
  idTipoDocumento?: number;
  dniCuitTitular?: number;
  nombreTitular?: string;
  numeroProducto?: string;
  fechaCierre?: Moment | null;
  idSectorOrigen?: number;
  idSectorTenedor?: number;
  idUsuarioAlta?: number;
  idEtiqueta?: number;
};

type Content = {
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
};
