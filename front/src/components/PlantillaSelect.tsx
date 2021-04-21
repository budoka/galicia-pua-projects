import { useState, useEffect } from 'react';
import { getPlantillas } from '../API/AbrirCajaAPI';
import { Form, Select } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/reducers';

type PlantillaProps = {
  seleccionada: undefined | string;
  setSeleccionada: (plantilla: string | undefined) => void;
  error: boolean;
  default?: string;
  setChange?: (e: boolean) => void;
  name: string;
  disabled?: boolean;
  setPlantillaID?: (e: number | undefined) => void;
};

export type Plantilla = {
  id: number;
  descripcion: string;
};

export const Plantilla: React.FC<PlantillaProps> = (props) => {

  const sesion = useSelector((state: RootState) => state.sesion);

  const [error, setError] = useState<boolean>(props.error);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]); // cambia ya no es string

  const obtenerPlantillas = async () => {
    getPlantillas(sesion.data.idSector)
      .then((plantillas) => setPlantillas(plantillas))
      .catch((e) => e);
  };

  const buscarPlantillaPorId = (plantillaDescr: string) => {
    return plantillas.find((p) => p.descripcion === plantillaDescr);
  };

  useEffect(() => {
    obtenerPlantillas();
  }, []);


  useEffect(() => {
    setError(props.error);
  }, [props.error]);

  return (
    <>
      <Form.Item
        name={props.name}
        label="Plantilla"
        hasFeedback={props.seleccionada !== undefined}
        validateStatus={error && !props.seleccionada ? 'error' : props.seleccionada ? 'success' : undefined}
        help={error && !props.seleccionada ? 'Debe seleccionar una plantilla' : undefined}
        rules={[{ required: true, message: 'Una plantilla es requerida' }]}
        initialValue={props.default}>
        <Select
          disabled={props.disabled}
          value={props.seleccionada}
          onChange={(e) => {
            props.setPlantillaID && props.setPlantillaID(buscarPlantillaPorId(e)?.id);
            props.setChange && props.setChange(true);
            props.setSeleccionada(e);
          }}>
          {plantillas &&
            plantillas.map((plantilla, key) => (
              <Select.Option value={plantilla.descripcion} key={key}>
                {plantilla.descripcion}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
    </>
  );
};
