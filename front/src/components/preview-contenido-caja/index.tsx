import { Card, message, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { palabraToUpperCase } from '../../utils/Common';

type PreviewContenidoCajaProps = {
  cajaId: number | undefined;
  plantillaId: number | undefined;
  contenido: string;
  plantillaActual?: string;
  descripcion: string;
};

export const PreviewContenidoCaja = (props: PreviewContenidoCajaProps) => {
  const [columnas, setColumnas] = useState<string[]>([]);
  const api = apis['CAJA'];
  const res = api.resources['PREVIEW'];

  const buildColumns = (collection: PreviewResponse[]): string[] => {
    return collection.map((preview) => preview.titulo);
  };

  const getInclusiones = (preview: PreviewContenidoResponse[]): string[] => {
    let result: string[] = [];
    result.push('tipoDocumental');
    result = result.concat(
      preview[0].inclusiones.map((incl) => {
        if (incl.descripcion.includes('/')) {
          return palabraToLowerCase(incl.descripcion);
        } else {
          return palabraToLowerCase(incl.descripcion.substring(9));
        }
      }),
    );
    return result;
  };

  const palabraToLowerCase = (palabra: string) => {
    return palabra.charAt(0).toLowerCase() + palabra.slice(1);
  };

  const obtenerColumnasPreview = async () => {
    var data = {
      idTipoCaja: props.cajaId,
      idPlantilla: props.plantillaId,
      idTipoContenido: props.plantillaActual ? 1 : 2,
    };
    const axiosConfig = buildAxiosRequestConfig(api, res, { data });
    const response = await axios.request<any[]>(axiosConfig);

    if (response.status === 200) {
      if (props.plantillaActual) {
        let columns = buildColumns(response.data as PreviewResponse[]);
        setColumnas(columns);
      } else if (props.contenido) {
        const inclusiones = getInclusiones(response.data as PreviewContenidoResponse[]);
        const builds = buildContenidoColumns(inclusiones);
        setColumnas(builds);
      }
    } else message.error('Ocurrió un error obteniendo la preview');
  };

  const buildContenidoColumns = (inclusiones: string[]): string[] => {
    return inclusiones.map((incl) => palabraToUpperCase(incl));
  };

  useEffect(() => {
    obtenerColumnasPreview();
  }, [props.plantillaActual]);

  return (
    <Card size="small" title={props.descripcion} bordered={false}>
      <Table size="small" dataSource={[]} locale={{ emptyText: <></> }}>
        {' '}
        {/* rowKey="key" */}
        {columnas.map((col, i) => (
          <Column title={palabraToUpperCase(col)} dataIndex={col} key={col} />
        ))}
      </Table>
    </Card>
  );
};

export interface Column {
  key: string;
  title: string; // nombre de la columbna en bd
  descr: string; // propiedad del objeto column que va a servir para matchearlo con el objeto que llena la grilla -- En la preview armar el objeto que necesite --Ejemplos, valor1, idColumna1
  requerido: number; // indica si la propiedad es requerida o no (para despues editar)
  type: string; // el tipo del objeto que se va a manipular
  long: string; // la longitud del campo editable
}

export type PreviewContenidoResponse = {
  descripcion: string; // "Legajo Operativo"
  id: number; // 1
  inclusiones: Inclusion[]; // inclusiones
};

// {"descripcion":"InclusionDniCuitTitular","tipoDato":"texto","requerido":"R"}
type Inclusion = {
  descripcion: string;
  tipoDato: string;
  requerido: string;
};

export type PreviewResponse = {
  tipo: string; // "entero"
  id: number; // 241
  opcional: number; // 0
  orden: number; // 1
  titulo: string; // "Número de Legajo"
  version: number; //0
  longitud: string | null; // null
  referencia: string | null; // null
  idPlantilla: number; // 109
};
