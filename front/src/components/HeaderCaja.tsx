import React, { useState } from 'react';
import { Alert, Divider } from 'antd';

type HeaderProps = {
  titulo: string;
  mensaje: string;
  showAlert: boolean;
};

export const HeaderCaja = (props: HeaderProps) => {
  const [alert, setAlert] = useState<boolean>(props.showAlert);

  return (
    <>
      <h3 style={{ color: '#FFA233' }}>
        <strong>{props.titulo}</strong>
      </h3>

      <Divider></Divider>
      {alert && (
        <>
          <Alert style={{ fontWeight: 'bold' }} message={props.mensaje} type="warning" showIcon closable onClose={(e) => setAlert(false)} />
          <br></br>
        </>
      )}
    </>
  );
};
