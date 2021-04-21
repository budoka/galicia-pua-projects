import { DownOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { Button, Dropdown } from 'antd';
import { DropDownProps } from 'antd/lib/dropdown';
import Menu, { MenuProps } from 'antd/lib/menu';
import classNames from 'classnames';
import React from 'react';
import { Texts } from 'src/constants/texts';
import { useAppDispatch } from 'src/store';
import { IElement } from 'src/types';
import { applyAction } from '../../acciones.slice';
import { ActionModal, ActionModalTableProps } from '../../modal';
import { Accion, ElementoAccion } from '../../types';
import styles from './style.module.less';

export interface ActionDropdownMenuProps extends MenuProps {
  // table: ActionModalTableProps<IElement>;
  actions: ElementoAccion[];
}

export const ActionDropdownMenu = React.memo((props: ActionDropdownMenuProps) => {
  const { actions } = props;
  const className = classNames(styles.button, props.className);

  const dispatch = useAppDispatch();

  const aplicarAccion = (accion: Accion) => {
    //source = CancelToken.source();
    dispatch(applyAction({ data: accion }))
      .then(unwrapResult)
      .then(() => {
        //uncheckedRows();
        //setModalAcciones((state) => ({ ...state, disabledOkButton: true }));
      })
      .catch((err) => {});
  };

  return (
    <Menu onClick={() => aplicarAccion}>
      {actions.map((action) => (
        <Menu.Item key={action.id}>{action.descripcion}</Menu.Item>
      ))}
    </Menu>
  );
});
