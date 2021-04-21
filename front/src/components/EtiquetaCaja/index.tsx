import { Descriptions, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { executeWS } from '../../utils/axiosAPI';
import { getURLs } from '../../utils/ConfigurationServices';

const { Item } = Descriptions;

interface EtiquetasContenido {
  id: number;
  idEtiqueta: number;
}

interface EtiquetaDetalle {
  id: number;
  descripcion: string;
}

interface EtiquetaCajaProps {
  idTipoCaja: number;
  idTipoContenido: number;
  etiquetas: EtiquetasContenido[];
}

export const EtiquetaCaja: React.FC<EtiquetaCajaProps> = (props) => {
  const [etiquetasDetalle, setEtiquetasDetalle] = useState<EtiquetaDetalle[]>([]);

  useEffect(() => {
    const getDetalleEtiquetas = async () => {
      // obtiene estados
      await executeWS<EtiquetaDetalle[]>(
        {
          method: 'POST',
          url: getURLs().PreviewV2,
          data: {
            idTipoCaja: props.idTipoCaja,
            idTipoContenido: props.idTipoContenido,
          },
        },
        setEtiquetasDetalle,
      );
    };

    getDetalleEtiquetas();
  }, []);

  const renderEtiquetas = () => {
    return props.etiquetas.map((item, i) => {
      return (
        <Tag key={item.idEtiqueta} color="processing">
          {etiquetasDetalle.find((e) => e.id == item.idEtiqueta)?.descripcion}
        </Tag>
      );
    });
  };

  return (
    <Descriptions title="Detalle Caja" size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
      <Item label="Etiquetas">{renderEtiquetas()}</Item>
    </Descriptions>
  );
};
