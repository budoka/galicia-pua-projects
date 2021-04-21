import { Descriptions, PageHeader, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { executeWS } from '../../utils/axiosAPI';
import { getURLs } from '../../utils/ConfigurationServices';
import _ from 'lodash';
import Column from 'antd/lib/table/Column';

// import '../../index.scss';
import Moment from 'react-moment';
import moment from 'moment';

const { Item } = Descriptions;

interface InfoColumna {
  id: number;
  tipo: string;
  titulo: string;
}

interface ColumnasDetalle {
  valor: string;
  idColumna: string;
}

interface DetalleFila {
  id: number;
  columnas: ColumnasDetalle[];
}

interface DetalleCajaProps {
  idTipoCaja: number;
  idTipoContenido: number;
  idPlantilla: number;
  detalle: DetalleFila[];
}

export const DetalleCaja: React.FC<DetalleCajaProps> = (props) => {
  const [infoColumna, setInfoColumna] = useState<InfoColumna[]>([]);
  const [dataSource, setDataSource] = useState<any>(undefined);

  useEffect(() => {
    const getDetalleCaja = async () => {
      // obtiene estados
      await executeWS<InfoColumna[]>(
        {
          method: 'POST',
          url: getURLs().PreviewV2,
          data: {
            idTipoCaja: props.idTipoCaja,
            idTipoContenido: props.idTipoContenido,
            idPlantilla: props.idPlantilla,
          },
        },
        setInfoColumna,
      );
    };

    getDetalleCaja();

    makeDataSource();
  }, []);

  const makeDataSource = () => {
    var json = props.detalle.map((item, i) => {
      var pos = {};
      item.columnas.forEach((c) => {
        _.assign(pos, { [c.idColumna]: c.valor });
      });
      _.assign(pos, { rowIndex: i });
      return pos;
    });

    setDataSource(json);
  };

  const renderColumns = () => {
    const columns = infoColumna.map((item, i) => {
      switch (item.tipo) {
        case 'entero':
          return <Column key={item.id} dataIndex={item.id} title={item.titulo} align="center"></Column>;
        case 'fecha':
          return (
            <Column
              key={item.id}
              dataIndex={item.id}
              title={item.titulo}
              align="center"
              render={(text) => {
                return text != null ? moment(text).format('DD/MM/YYYY') : ' - ';
              }}></Column>
          );
        default:
          return <Column key={item.id} dataIndex={item.id} title={item.titulo}></Column>;
      }
    });

    return <>{columns}</>;
  };

  return (
    <div className="pagination-style">
      <Table rowKey="rowIndex" dataSource={dataSource} pagination={{ pageSize: 5 }} size="small">
        {renderColumns()}
      </Table>
    </div>
  );
};
