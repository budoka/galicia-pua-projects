import React, { useEffect, useState } from 'react';
import { Menu, Space, Typography } from 'antd';
import {
  InboxOutlined,
  HomeOutlined,
  FileOutlined,
  ShoppingCartOutlined,
  ScanOutlined,
  FormOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useHistory } from 'react-router';
import SubMenu from 'antd/lib/menu/SubMenu';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import { useAppDispatch } from '../../store';

// import '../../index.css';
import { useLocation } from 'react-router-dom';

const { Text } = Typography;

type SideProps = {
  collapsed: boolean;
};

const SideNav = (props: SideProps) => {
  const location = useLocation();
  const sesion = useSelector((state: RootState) => state.sesion);
  const { pathname } = location;

  const [path, setPath] = useState<string>(pathname);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    if (pathname === '/') setPath('/');
  }, [pathname]);

  const history = useHistory();


  const handleUserClick = () => {
    setPath('/');
    history.push('/');
  };

  return (
    <>
      <div className="ellipsis" style={{ height: '50px', background: '#fff' }}>
        {props.collapsed ? (
          <Space direction="vertical" style={{ marginTop: '8px' }}>
            <Text strong style={{ color: '#ff6600', fontSize: '20px', marginLeft: '15px' }}>
              PUA
            </Text>
          </Space>
        ) : (
          <Space style={{ marginTop: '12px' }}>
            <Text strong style={{ color: '#ff6600', fontSize: '13px', marginLeft: '15px' }}>
              Portal Unificado de Archivos
            </Text>
          </Space>
        )}
      </div>
      <div>
        <Menu theme="light" mode="inline" style={{ borderRight: '0px', borderTop: '1px solid #f0f2f5' }} selectedKeys={[pathname]}>
          <Menu.Item
            key="1"
            disabled={!sesion.data.perfil}
            onClick={handleUserClick}
            style={{ marginLeft: props.collapsed ? '8px' : '0px', fontWeight: pathname === '/' ? 'bold' : 'normal' }}>
            <HomeOutlined style={{ fontSize: '14px' }} />
            <span>Inicio</span>
          </Menu.Item>
          <Menu.Divider></Menu.Divider>
          <Menu.ItemGroup>
            <SubMenu key="2" icon={<FileOutlined style={{ fontSize: '14px' }} />} disabled={!sesion.data.perfil} title="Documentos">
              <Menu.Item
                key="/buscarDocumento"
                onClick={(_) => {
                  setPath('/buscarDocumento');
                  history.push('/buscarDocumento');
                }}>
                Buscar Doc. Generales
              </Menu.Item>
              <Menu.Item
                key="/busquedaDocumentosFilenet"
                onClick={(_) => {
                  var keys = openKeys;
                  keys.push('2');
                  setOpenKeys(keys);
                  setPath('/busquedaDocumentosFilenet');
                  history.push('/busquedaDocumentosFilenet');
                }}>
                Buscar Legajo Digital
              </Menu.Item>
            </SubMenu>
          </Menu.ItemGroup>
          <Menu.Divider></Menu.Divider>
          <Menu.ItemGroup>
            <SubMenu key="3" icon={<InboxOutlined style={{ fontSize: '16px' }} />} disabled={!sesion.data.perfil} title="Cajas">
              <Menu.Item
                key="/buscarCaja"
                onClick={(_) => {
                  setPath('/buscarCaja');
                  history.push('/buscarCaja');
                }}>
                Buscar Caja
              </Menu.Item>
              <Menu.Divider></Menu.Divider>
              <Menu.Item
                key="/abrirCaja"
                onClick={(_) => {
                  setPath('/abrirCaja');
                  history.push('/abrirCaja');
                }}>
                Ingresar Caja
              </Menu.Item>
            </SubMenu>
          </Menu.ItemGroup>
          <Menu.Divider></Menu.Divider>
          <Menu.ItemGroup>
            <SubMenu key="4" icon={<ShoppingCartOutlined style={{ fontSize: '16px' }} />} disabled={!sesion.data.perfil} title="Pedidos">
              <Menu.Item
                key="/buscarPedido"
                onClick={(_) => {
                  setPath('/buscarPedido');
                  history.push('/buscarPedido');
                }}>
                Buscar Pedido
              </Menu.Item>
            </SubMenu>
          </Menu.ItemGroup>
          <Menu.Divider></Menu.Divider>
          <Menu.ItemGroup>
            <SubMenu key="5" icon={<ScanOutlined style={{ fontSize: '16px' }} />} disabled={!sesion.data.perfil} title="Digitalizaciones">
              <Menu.Item
                key="/digitalizar"
                onClick={(_) => {
                  setPath('/digitalizar');
                  history.push('/digitalizar');
                }}>
                Digitalizar
              </Menu.Item>
              <Menu.Item
                key="/infraSucursales"
                onClick={(_) => {
                  setPath('/infraSucursales');
                  history.push('/infraSucursales');
                }}
                title="Infraestructua de Sucursales">
                Infr. de Sucursales
              </Menu.Item>
            </SubMenu>
          </Menu.ItemGroup>
          <Menu.Divider></Menu.Divider>

          <Menu.ItemGroup>
            <SubMenu key="6" icon={<FormOutlined style={{ fontSize: '16px' }} />} disabled={!sesion.data.perfil} title="Reportes">
              {(sesion.data.perfil === 'Administrador' ||
                sesion.data.perfil === 'SupervisorArchivo' ||
                sesion.data.perfil === 'Auditoria') && (
                  <>
                    <Menu.Item
                      key="/reportesResumenPedido"
                      onClick={(_) => {
                        setPath('/reportesResumenPedido');
                        history.push('/reportesResumenPedido');
                      }}>
                      Resúmen Pedido
                  </Menu.Item>
                    <Menu.Item
                      key="/reportesDetallePedido"
                      onClick={(_) => {
                        setPath('/reportesDetallePedido');
                        history.push('/reportesDetallePedido');
                      }}>
                      Detalle Pedido
                  </Menu.Item>
                    <Menu.Item
                      key="/reportesGuardaCaja"
                      onClick={(_) => {
                        setPath('/reportesGuardaCaja');
                        history.push('/reportesGuardaCaja');
                      }}>
                      Guarda y Destrucción
                  </Menu.Item>
                    <Menu.Item
                      key="/reportesAltaCaja"
                      onClick={(_) => {
                        setPath('/reportesAltaCaja');
                        history.push('/reportesAltaCaja');
                      }}>
                      Alta Caja
                  </Menu.Item>
                  </>
                )}
              <Menu.Item
                key="/reportesHistorialProcesos"
                onClick={(_) => {
                  setPath('/reportesHistorialProcesos');
                  history.push('/reportesHistorialProcesos');
                }}>
                Historial de Procesos
              </Menu.Item>
            </SubMenu>
          </Menu.ItemGroup>
          <Menu.Divider></Menu.Divider>
          {sesion.data.perfil === 'Administrador' && (
            <Menu.ItemGroup>
              <SubMenu key="7" icon={<SettingOutlined style={{ fontSize: '16px' }} />} title="Configuración">
                <Menu.Item
                  key="/claseDocumento"
                  onClick={(_) => {
                    setPath('/claseDocumento');
                    history.push('/claseDocumento');
                  }}>
                  Clase de Documento
                </Menu.Item>
                <Menu.Item
                  key="/etiqueta"
                  onClick={(_) => {
                    setPath('/etiqueta');
                    history.push('/etiqueta');
                  }}>
                  Etiqueta
                </Menu.Item>
                <Menu.Item
                  key="/plantilla"
                  onClick={(_) => {
                    setPath('/plantilla');
                    history.push('/plantilla');
                  }}>
                  Plantilla
                </Menu.Item>
                <Menu.Item
                  key="/sector"
                  onClick={(_) => {
                    setPath('/sector');
                    history.push('/sector');
                  }}>
                  Sectores
                </Menu.Item>
                <Menu.Item
                  key="/tipoCaja"
                  onClick={(_) => {
                    setPath('/tipoCaja');
                    history.push('/tipoCaja');
                  }}>
                  Tipo de Caja
                </Menu.Item>
                <Menu.Item
                  key="/tipoDocumento"
                  onClick={(_) => {
                    setPath('/tipoDocumento');
                    history.push('/tipoDocumento');
                  }}>
                  Tipo de Documento
                </Menu.Item>
              </SubMenu>
            </Menu.ItemGroup>
          )}
        </Menu>
      </div>
    </>
  );
};

export default SideNav;
