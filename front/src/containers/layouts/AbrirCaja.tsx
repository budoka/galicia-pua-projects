import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Space, Form, message } from 'antd';
import { useHistory } from 'react-router-dom';
import { Moment } from 'moment';
import { InfoNoEditable } from '../../components/InfoNoEditable';
import { HeaderCaja } from '../../components/HeaderCaja';
import { SelectGroup } from '../../components/SelectGroup';
import { getTiposDeCajas, getTiposDeContenido, getPlantillas, guardarCaja } from '../../API/AbrirCajaAPI';
import { TipoCaja } from '../../types/TipoCaja';
import { Etiquetas } from '../../components/Etiquetas';
import { CajaForm, CajaToDTO } from '../../types/CajaForm';
import { Plantilla } from '../../components/PlantillaSelect';
import { PreviewContenidoCaja } from '../../components/preview-contenido-caja';
import { useAzureAuth } from '../../auth/hook/use-azure-auth';
import { obtenerSectorUsuario } from '../../API/InfoUsuarioAPI';
import { useSelector } from 'react-redux';
import { RootState } from 'src/reducers';

export const AbrirCaja: React.FC = () => {
  const [idCaja, setIdCaja] = useState<number>(0);
  const [tiposDeCajas, setTiposDeCajas] = useState<TipoCaja[]>([]);
  const [tipoCajaSeleccionada, setTipoCajaSeleccionada] = useState<string>();
  const [tiposPlantillas, setTiposPlantillas] = useState<Plantilla[]>([]);
  const [tiposDeContenido, setTiposDeContenido] = useState<string[]>([]);
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState<string>();
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<string>();
  const [fechaDocumentacionDesde, setFechaDocumentacionDesde] = useState<Moment | null>(null);
  const [fechaDocumentacionHasta, setFechaDocumentacionHasta] = useState<Moment | null>(null);
  const [restringido, setRestringido] = useState<boolean>(false);
  const [descripcion, setDescripcion] = useState<string>('');
  const [codigoSectorPropietario, setCodigoSectorPropietario] = useState<number | undefined>();
  const [sectorPropietario, setSectorPropietario] = useState<string | undefined>('');
  const [idUsuario, setIdUsuario] = useState<number>();

  const [fechaVencimiento, setFechaVencimiento] = useState<Moment | null>();

  const [error, setError] = useState<boolean>(false);

  const auth = useAzureAuth();

  var currentAccounts = auth.authInstance?.getAllAccounts();
  var username = currentAccounts && currentAccounts[0] ? currentAccounts[0].name : '';
  var legajo = currentAccounts && currentAccounts[0] ? currentAccounts[0].username.split('@')[0] : '';
  const sesion = useSelector((state: RootState) => state.sesion);

  const history = useHistory();

  document.title = 'PUA - Abrir Caja';

  const [form] = Form.useForm();

  const obtenerTiposDeCajas = async () => {
    getTiposDeCajas()
      .then((tiposDeCajas) => {
        setTiposDeCajas(tiposDeCajas);
      })
      .catch((e) => message.error("Hubo un error obteniendo los tipos de cajas. Intente de nuevo"));
  };

  const obtenerTiposDeDocumentos = async () => {
    tipoCajaSeleccionada !== undefined &&
      getTiposDeContenido(tipoCajaSeleccionada)
        .then((tiposContenido) => setTiposDeContenido(tiposContenido))
        .catch((e) => message.error("Hubo un error obteniendo los tipos de documentos. Intente de nuevo"));
  };

  const obtenerPlantillas = async () => {
    getPlantillas(sesion.data.idSector)
      .then((plantillas) => setTiposPlantillas(plantillas))
      .catch((e) => message.error("Hubo un error obteniendo los tipos de plantillas. Intente de nuevo"));
  };

  const obtenerInfoUsuario = () => {
    setIdUsuario(sesion.data.idUsuario);
    setCodigoSectorPropietario(sesion.data.idSector);
    setSectorPropietario(sesion.data.nombreSector);
  };

  useEffect(() => {
    obtenerInfoUsuario();
    obtenerTiposDeCajas();
    obtenerPlantillas();
  }, []);

  useEffect(() => {
    obtenerTiposDeDocumentos();
  }, [tipoCajaSeleccionada]);

  const volver = () => {
    history.push('/');
    //history.goBack();
  };

  const jumpToPath = (id: number) => {
    history.push({
      pathname: '/editarCaja',
      search: '?id=' + id,
    });
  };

  const buscarCajaPorId = () => {
    return tiposDeCajas.find((c) => c.descripcion === tipoCajaSeleccionada);
  };

  const buscarPlantillaPorId = () => {
    return tiposPlantillas.find((p) => p.descripcion === plantillaSeleccionada);
  };

  const determineContenidoId = () => {
    if (contenidoSeleccionado && contenidoSeleccionado === 'Caja con Documentos') return 2;
    else {
      if (contenidoSeleccionado && contenidoSeleccionado === 'Caja con Detalle') return 1;
      else {
        if (contenidoSeleccionado && contenidoSeleccionado === 'Caja con Etiqueta') return 0;
        else {
          return undefined;
        }
      }
    }
  };

  const saveAndBack = async (caja: CajaForm, back?: boolean) => {
    await guardarCaja(caja)
      .then((response) => {
        setIdCaja(response.numero);
        back ? history.push('/') : jumpToPath(response.numero);
      })
      .catch((e) => message.error("Hubo un error intentando guardar la caja. Intente de nuevo"));
  }

  // mostrar un msj caja generada correctamente
  const guardarUnaCaja = () => {
    let caja: CajaForm = CajaToDTO(
      sesion.data.idUsuario!,
      descripcion,
      fechaDocumentacionDesde,
      fechaDocumentacionHasta,
      fechaVencimiento,
      codigoSectorPropietario,
      buscarCajaPorId()?.id,
      determineContenidoId(),
      idUsuario,
      buscarPlantillaPorId(),
      restringido,
      username,
      legajo,
    );
    saveAndBack(caja);
  };

  // mostrar un msj caja generada correctamente
  const guardarYVolver = async () => {
    let caja: CajaForm = CajaToDTO(
      sesion.data.idUsuario!,
      descripcion,
      fechaDocumentacionDesde,
      fechaDocumentacionHasta,
      fechaVencimiento,
      codigoSectorPropietario,
      buscarCajaPorId()?.id,
      determineContenidoId(),
      idUsuario,
      buscarPlantillaPorId(),
      restringido,
      username,
      legajo,
    );
    saveAndBack(caja, true);
  };

  const guardar = async () => {
    if (tipoCajaSeleccionada && contenidoSeleccionado) {
      if (fechaDocumentacionDesde && fechaDocumentacionHasta) {
        if (fechaDocumentacionHasta.isBefore(fechaDocumentacionDesde)) {
          setError(true);
          return;
        }
        if (plantillaSeleccionada) {
          guardarUnaCaja();
        } else {
          if (contenidoSeleccionado === 'Caja con Etiqueta') {
            guardarUnaCaja();
          } else {
            setError(true);
          }
        }
      } else {
        if (contenidoSeleccionado === 'Caja con Documentos') {
          guardarUnaCaja();
        } else {
          setError(true);
        }
      }
    } else {
      setError(true);
    }
  };

  return (
    <>
      <div>
        <HeaderCaja
          titulo={'Nueva Caja'}
          showAlert={true}
          mensaje={"Ingrese los datos de la nueva caja. Para agregar detalles o documentos, debe pulsar el botón 'Guardar' "}
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '0 150px' }}>
          <Row style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <InfoNoEditable
              legajo={legajo}
              sectorPropietario={codigoSectorPropietario + ' - ' + sectorPropietario}
              username={username}
              fechaVencimiento={fechaVencimiento}
            />

            <SelectGroup
              currentCaja={tipoCajaSeleccionada}
              setCurrentCaja={setTipoCajaSeleccionada}
              tiposCajas={tiposDeCajas}
              currentContenido={contenidoSeleccionado}
              setCurrentContenido={setContenidoSeleccionado}
              tiposContenido={tiposDeContenido}
              currentPlantilla={plantillaSeleccionada}
              setCurrentPlantilla={setPlantillaSeleccionada}
              currentFechaDocDesde={fechaDocumentacionDesde}
              currentFechaDocHasta={fechaDocumentacionHasta}
              setCurrentFechaDocDesde={setFechaDocumentacionDesde}
              setCurrentFechaDocHasta={setFechaDocumentacionHasta}
              currentRestringido={restringido}
              setCurrentRestringido={setRestringido}
              currentDescripcion={descripcion}
              setCurrentDescripion={setDescripcion}
              setCurrentFechaVencimiento={setFechaVencimiento}
              buscarIdCaja={buscarCajaPorId}
              error={error}
              setError={setError}
            />
          </Row>

          <Row style={{ display: 'flex', justifyContent: 'center' }}>
            {tipoCajaSeleccionada && contenidoSeleccionado && plantillaSeleccionada && contenidoSeleccionado === 'Caja con Detalle' ? (
              <PreviewContenidoCaja
                cajaId={buscarCajaPorId()?.id}
                plantillaId={buscarPlantillaPorId()?.id}
                contenido={contenidoSeleccionado}
                plantillaActual={plantillaSeleccionada}
                descripcion={'Plantilla'}
              />
            ) : tipoCajaSeleccionada && contenidoSeleccionado && contenidoSeleccionado === 'Caja con Documentos' ? (
              <PreviewContenidoCaja
                cajaId={buscarCajaPorId()?.id}
                plantillaId={buscarPlantillaPorId()?.id}
                contenido={contenidoSeleccionado}
                plantillaActual={plantillaSeleccionada}
                descripcion={'Documentos'}
              />
            ) : (
              contenidoSeleccionado &&
              contenidoSeleccionado === 'Caja con Etiqueta' && (
                <Etiquetas idCaja={idCaja} idTipoCaja={buscarCajaPorId()?.id} tipoContenido={contenidoSeleccionado} disable={true} />
              )
            )}
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
                <Button type="primary" onClick={guardar}>
                  Crear Caja
                </Button>
                <span></span>
                <Button type="primary" onClick={guardarYVolver}>
                  Crear Caja y Volver
                </Button>
                <span></span>
                <Button type="primary" onClick={volver}>
                  Volver
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};
