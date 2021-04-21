import { Button, Col, Divider, message, Row, Space, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/reducers';
//import { obtenerSectorUsuario } from '../../API/InfoUsuarioAPI';
import { useAzureAuth } from '../../auth/hook/use-azure-auth';
import { getURLs } from '../../utils/ConfigurationServices';

export const InfraSucursales: React.FC = () => {
  const auth = useAzureAuth();
  const currentAccounts = auth.authInstance?.getAllAccounts();
  //const legajo = currentAccounts && currentAccounts[0] ? currentAccounts[0].username.split('@')[0] : '';
  const sesion = useSelector((state: RootState) => state.sesion);

  const [sector, setSector] = useState<number | undefined>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [URL, setURL] = useState<string>('');

  useEffect(() => {
    setSector(sesion.data.idSector);
  }, [sesion.data.idSector]);

  const loadedIframe = () => {
    setLoading(false);
  };

  const loadIframe = (option: string) => {
    setLoading(true);
    var url = '';
    switch (option) {
      case 'BCRA':
        url = getURLs()
          .DigitalizacionesFilenet.replace('%OPTION_SHORT_PUA%', 'bcra')
          .replace('%OPTION_PUA%', 'BCRA')
          .replace('%SECTOR_PUA%', String(sector));
        break;

      case 'MUNICIPALES':
        url = getURLs()
          .DigitalizacionesFilenet.replace('%OPTION_SHORT_PUA%', 'municipales')
          .replace('%OPTION_PUA%', 'Municipales')
          .replace('%SECTOR_PUA%', String(sector));
        break;

      case 'SEGEHIG':
        url = getURLs()
          .DigitalizacionesFilenet.replace('%OPTION_SHORT_PUA%', 'seghig')
          .replace('%OPTION_PUA%', 'SeguridadHigiene')
          .replace('%SECTOR_PUA%', String(sector));
        break;
    }
    setURL(url);
  };

  return (
    <div>
      <Space size="middle">
        <Button type="primary" onClick={(event) => loadIframe('BCRA')} disabled={sector == -1}>
          BCRA
        </Button>
        <Button type="primary" onClick={(event) => loadIframe('MUNICIPALES')} disabled={sector == -1}>
          Gestiones Municipales
        </Button>
        <Button type="primary" onClick={(event) => loadIframe('SEGEHIG')} disabled={sector == -1}>
          Seguridad e Higiene
        </Button>
      </Space>
      <Divider />
      <Spin tip="Cargando..." spinning={loading}>
        <Row>
          <Col span={24}>
            <iframe
              src={URL}
              frameBorder="0"
              style={{ width: '100%', height: '70vh', display: URL !== '' ? 'block' : 'none' }}
              onLoad={loadedIframe}>
            </iframe>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};
