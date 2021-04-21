import { Button, message } from 'antd';
import axios from 'axios';
import { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { actualizarEtiquetas } from '../API/CajaAPI';

type EtiquetasProps = {
  idCaja: number;
  idTipoCaja: number | undefined;
  tipoContenido: string;
  disable: boolean;
  etiquetasId?: number[];
  setDisable?: (e: boolean) => void; // deshabilita el select del tipo de caja y contenido, si ya agrego documentos
  modificarCaja?: (e?: boolean) => Promise<void>;
  hasBeenAChange?: boolean; // hubo un cambio en el editarCaja
  fechaDesde?: Moment | null;
  fechaHasta?: Moment | null;
};

export const Etiquetas = (props: EtiquetasProps) => {
  const [etiquetasPreview, setEtiquetasPreview] = useState<PreviewResponse[]>([]);
  const [etiquetasData, setEtiquetasData] = useState<number[]>(props.etiquetasId ?? []);
  const [enabledButton, setEnabledButton] = useState<boolean>(false);
  const api = apis['CAJA'];

  const obtenerColumnasTablaPreview = async () => {
    const res = api.resources['PREVIEW'];
    var data = {
      idTipoCaja: props.idTipoCaja,
      idPlantilla: undefined,
      idTipoContenido: 0,
    };
    const axiosConfig = buildAxiosRequestConfig(api, res, { data });
    const response = await axios.request<PreviewResponse[]>(axiosConfig);

    if (response.status === 200) setEtiquetasPreview(response.data);
    else message.error('Ocurrió un error obteniendo la preview');
  };

  useEffect(() => {
    obtenerColumnasTablaPreview();
    props.setDisable && props.setDisable(etiquetasData.length > 0);
  }, []);

  const onChangeValue = (id: number) => {
    let etiquetas: number[] = etiquetasData;

    if (hasLabel(id)) etiquetas = etiquetas.filter((etiqueta) => etiqueta !== id);
    else etiquetas = [...etiquetas, id];

    setEtiquetasData(etiquetas); // etiquetas.sort()
    setEnabledButton(true);
  };

  const hasLabel = (id: number) => {
    return etiquetasData && etiquetasData.indexOf(id) > -1;
  };

  const saveLabels = () => {
    if (!enabledButton) return;
    if (props.hasBeenAChange) {
      // si hubo un cambio actualizo la caja
      props.modificarCaja && props.modificarCaja();
    }
    actualizarEtiquetas(props.idCaja, etiquetasData);
    props.setDisable && props.setDisable(etiquetasData.length > 0); //  deshabilitamos el control del select cuando hay etiquetas
    setEnabledButton(false);
  };

  const anyEmptyDates = (): boolean => {
    return !props.fechaDesde || !props.fechaHasta;
  };

  return (
    <>
      <br></br>

      <div className="card border-warning  mb-4" style={{ borderColor: '#FFA233', maxWidth: '400px' }}>
        <div className="card-body" style={{ backgroundColor: '#F5F5F5' }}>
          <h6 className="card-header" style={{ backgroundColor: '#FFA233' }}>
            <strong style={{ color: '#F5F5F5' }}>Etiquetas</strong>
          </h6>
          <br></br>

          <div className="form-check" style={{ marginLeft: '8px' }}>
            {etiquetasPreview &&
              etiquetasPreview.map((etiqueta) => {
                return (
                  <div key={'etiqueta' + etiqueta.id}>
                    <input
                      key={'input' + etiqueta.id}
                      className="form-check-input"
                      type="checkbox"
                      checked={hasLabel(etiqueta.id)}
                      onChange={(e) => onChangeValue(etiqueta.id)}
                      id={etiqueta.id + ''}
                      disabled={props.disable}></input>
                    <label key={'label' + etiqueta.id} className="form-check-label" htmlFor={etiqueta.descripcion}>
                      {etiqueta.descripcion}
                    </label>
                    <br></br>
                  </div>
                );
              })}
          </div>
          <Button
            type="primary"
            style={{
              color: '#fff',
              cursor: enabledButton && !anyEmptyDates() ? 'pointer' : 'not-allowed',
              background: enabledButton && !anyEmptyDates() ? '#FFA233' : '#888A8C',
              borderColor: '#FFA233',
              marginTop: '20px',
              marginLeft: '-20px',
              left: '50%',
              transform: 'translate(-50px, 0px)',
            }}
            disabled={!enabledButton || anyEmptyDates()}
            onClick={saveLabels}>
            Guardar Etiquetas
          </Button>
        </div>
      </div>
    </>
  );
};

export type PreviewResponse = {
  descripcion: string;
  id: number;
  legacy: number;
  version: number;
};

export type EtiquetaData = {
  // id: number;
  idEtiqueta: number;
};
