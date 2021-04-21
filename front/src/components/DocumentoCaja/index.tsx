import { Descriptions, Table, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { executeWS } from '../../utils/axiosAPI';
import { splitStringByWords, firstLetterLower } from '../../utils/string';
import { getURLs } from '../../utils/ConfigurationServices';
import _ from 'lodash';
import Column from 'antd/lib/table/Column';

// import '../../index.scss';
import Moment from 'react-moment';
import moment from 'moment';

const { Item } = Descriptions;

interface InfoColumna {
  descripcion: string;
  tipoDato: string;
}

interface DocumentoCajaProps {
  idTipoCaja: number;
  idTipoContenido: number;
  documentos: any[];
}

export const DocumentoCaja: React.FC<DocumentoCajaProps> = (props) => {
  const [infoColumna, setInfoColumna] = useState<InfoColumna[]>([]);
  const [dataSource, setDataSource] = useState<any>(undefined);

  useEffect(() => {
    const getInfoDocumentosCaja = async () => {
      // obtiene estados
      await executeWS<any>(
        {
          method: 'POST',
          url: getURLs().PreviewV2,
          data: {
            idTipoCaja: props.idTipoCaja,
            idTipoContenido: props.idTipoContenido,
          },
        },
        parseColumns,
      );
    };

    getInfoDocumentosCaja();
    setDataSource(props.documentos);
  }, []);

  const parseColumns = (columns: any) => {
    if (columns != null && columns.length > 0) {
      var cols: InfoColumna[] = columns[0].inclusiones as InfoColumna[];
      cols.unshift({ descripcion: 'InclusionTipoDocumental', tipoDato: 'texto' } as InfoColumna);
      setInfoColumna(cols);
    }
  };

  const renderColumns = () => {
    const columns = infoColumna.map((item, i) => {
      switch (item.tipoDato) {
        case 'numero':
          return (
            <Column
              key={item.descripcion}
              dataIndex={firstLetterLower(item.descripcion.replace('Inclusion', ''))}
              title={splitStringByWords(item.descripcion)?.join(' ').replace('Inclusion', '').trim()}
              align="center"></Column>
          );
        case 'fecha':
          return (
            <Column
              key={item.descripcion}
              dataIndex={firstLetterLower(item.descripcion.replace('Inclusion', ''))}
              title={splitStringByWords(item.descripcion)?.join(' ').replace('Inclusion', '').trim()}
              align="center"
              render={(text) => {
                return text != null ? moment(text).format('DD/MM/YYYY') : ' - ';
              }}></Column>
          );
        default:
          return (
            <Column
              key={item.descripcion}
              dataIndex={firstLetterLower(item.descripcion.replace('Inclusion', ''))}
              title={splitStringByWords(item.descripcion)?.join(' ').replace('Inclusion', '').trim()}></Column>
          );
      }
    });
    return <>{columns}</>;
  };

  return (
    <div className="pagination-style">
      <Table rowKey="id" dataSource={dataSource} pagination={{ pageSize: 5 }} size="small">
        {renderColumns()}
      </Table>
    </div>
  );
};
