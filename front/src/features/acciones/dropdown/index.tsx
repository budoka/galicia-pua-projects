import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import { DropDownProps } from 'antd/lib/dropdown';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Texts } from 'src/constants/texts';
import { RootState } from 'src/reducers';
import { useAppDispatch } from 'src/store';
import { clearAccions, fetchActions, setDropdownActions, setModalActions } from '../acciones.slice';
import { ActionModal } from '../modal';
import { ElementoAccion, TipoElemento } from '../types';
import styles from './style.module.less';

export interface ActionsDropdownProps extends Omit<DropDownProps, 'overlay'> {
  // table: ActionModalTableProps<IElement>;
  // actions: (accion: Accion) => void;
  tipoElemento: TipoElemento;
  idUsuario: number;
  idEstadoActual: number;
  onClick?: () => void;
}

export const ActionsDropdown = React.memo((props: ActionsDropdownProps) => {
  // const { table, action } = props;
  const { tipoElemento, idUsuario, idEstadoActual, onClick } = props;

  const className = classNames(styles.button, props.className);

  const acciones = useSelector((state: RootState) => state.acciones);
  const dispatch = useAppDispatch();

  useEffect(() => {
    idEstadoActual && idUsuario && tipoElemento && dispatch(fetchActions({ data: { idEstadoActual, idUsuario, tipoElemento } }));

    return () => {
      !_.isEmpty(acciones.data.dropdown?.acciones) && dispatch(clearAccions());
    };
  }, [idEstadoActual, idUsuario, tipoElemento]);

  const handleClick = (action: ElementoAccion) => {
    onClick && onClick();
    openModal(action);
  };

  const openModal = (action: ElementoAccion) => {
    dispatch(setDropdownActions({ acciones: { seleccionada: action } }));
    dispatch(setModalActions({ visible: true, disabledOkButton: false }));
  };

  const menu = (
    <Menu>
      {acciones.data.dropdown?.acciones?.lista &&
        acciones.data.dropdown.acciones.lista.map((action) => (
          <Menu.Item onClick={() => handleClick(action)} key={action.id}>
            {action.descripcion}
          </Menu.Item>
        ))}
    </Menu>
  );

  return (
    <Dropdown trigger={['click']} overlay={menu} disabled={acciones.data.dropdown?.disabled}>
      <Button>
        {Texts.ACTION} <DownOutlined />
      </Button>
    </Dropdown>
  );
});
