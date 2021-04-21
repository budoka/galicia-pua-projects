import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { renderPerfil } from 'src/utils/renderEstados';
import { Cart } from '../../components/cart';
import { fetchCantidadCarrito } from '../../features/carrito/carrito.slice';
import { RootState } from '../../reducers';
import { useAppDispatch } from '../../store';

type NavProps = {
  collapsed: boolean;
  handle: (_: any) => void;
};

export const NavBar = (props: NavProps) => {
  const history = useHistory();

  const sesion = useSelector((state: RootState) => state.sesion);
  const carrito = useSelector((state: RootState) => state.carrito);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (sesion.data.idUsuario) dispatch(fetchCantidadCarrito({ data: { idUsuario: sesion.data.idUsuario } }));
  }, [sesion]);

  const clickCarrito = () => {
    history.push({
      pathname: '/carrito',
    });
  };

  return (
    <>
      <Row wrap={false} justify="space-between">
        <Col style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
          <Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {props.collapsed ? (
              <MenuUnfoldOutlined
                className={'trigger'}
                onClick={() => props.handle(false)}
                style={{ color: 'rgb(255, 102, 0)', fontSize: '22px' }}
              />
            ) : (
              <MenuFoldOutlined
                className={'trigger'}
                onClick={() => props.handle(true)}
                style={{ color: 'rgb(255, 102, 0)', fontSize: '22px' }}
              />
            )}
          </Col>
          <Col style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
            <span className="ellipsis" style={{ textAlign: 'right', marginRight: '10px', paddingLeft: 100 }}>
              {!sesion.loading &&
                `Usuario: ${sesion.data.nombreUsuario ? sesion.data.nombreUsuario : "-"} ${sesion.data.legajo ? "(" + sesion.data.legajo + ")" : ""} 
                | Sector: ${sesion.data.nombreSector ? sesion.data.nombreSector : "-"} | Perfil: ${sesion.data.perfil ? renderPerfil(sesion.data.perfil) : "-"}`}
            </span>
            <Cart count={carrito.data.cantidad} badge={{ size: 'small' }} onClick={clickCarrito} />
          </Col>
        </Col>
      </Row>
    </>
  );
};
