import { Button, List, Pagination } from 'antd';
import Modal from 'antd/lib/modal';
import { PaginationConfig } from 'antd/lib/pagination';
import React from 'react';
import { compare } from 'src/utils/string';
import { FiltroClienteState } from '..';

const paginationConfig = { pageSize: 20, hideOnSinglePage: true, showSizeChanger: false } as PaginationConfig;

interface ListaClientesProps {
  state: FiltroClienteState;
  setState: React.Dispatch<React.SetStateAction<FiltroClienteState>>;
  setCliente: (usuario?: any) => void;
}

export const ListaClientes: React.FC<ListaClientesProps> = React.memo((props) => {
  const { state, setState, setCliente } = props;

  return (
    <Modal
      title={`Usuarios encontrados: ${state.listaUsuarios?.clientes?.length}`}
      closable
      centered
      visible={state.listaUsuarios?.visible}
      footer={null}
      destroyOnClose={true}
      width={600}
      bodyStyle={{ paddingTop: 10 }}
      onCancel={() => setState((prev) => ({ ...prev, listaUsuarios: { ...prev.listaUsuarios!, visible: false } }))}>
      <List
        id="listaUsuarios"
        itemLayout="horizontal"
        dataSource={state.listaUsuarios?.clientes}
        style={{ height: 500, overflowY: 'scroll', scrollBehavior: 'smooth' }}
        pagination={{
          ...paginationConfig,
          total: state.listaUsuarios?.clientes?.length,
          current: state.listaUsuarios?.pagination?.current,
          style: { display: 'none' },
        }}
        renderItem={(cliente) => (
          <List.Item>
            <List.Item.Meta
              title={cliente.nombre ? `${cliente.apellido}, ${cliente.nombre}` : `${cliente.razonSocial}`}
              description={`${Object.values(cliente.documento!)
                .sort((a, b) => compare(String(b), String(a)))
                .join(' ')} | ${Object.values(cliente.direccion).join(' ')}`}
            />
            <Button type="link" style={{ paddingRight: 30 }} onClick={() => setCliente(cliente)}>
              Seleccionar
            </Button>
          </List.Item>
        )}
      />

      <Pagination
        {...paginationConfig}
        total={state.listaUsuarios?.clientes?.length}
        current={state.listaUsuarios?.pagination?.current}
        showTotal={(total, range) => <span>{`${range[0]}-${range[1]} de ${total}`}</span>}
        style={{ marginTop: 10, textAlign: 'right' }}
        onChange={(page: number, pageSize?: number) => {
          setState((prev) => ({ ...prev, listaUsuarios: { ...prev.listaUsuarios!, visible: true, pagination: { current: page } } }));

          const listaUsuarios = document.getElementById('listaUsuarios');
          listaUsuarios && (listaUsuarios as HTMLDivElement).scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </Modal>
  );
});
