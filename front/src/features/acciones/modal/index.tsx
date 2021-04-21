import { unwrapResult } from '@reduxjs/toolkit';
import { useForm } from 'antd/lib/form/Form';
import { ModalProps } from 'antd/lib/modal';
import { TableProps } from 'antd/lib/table';
import axios, { CancelTokenSource } from 'axios';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ExtraComponentTable } from 'src/components/table';
import { TableModal } from 'src/components/table-modal';
import { RootState } from 'src/reducers';
import { useAppDispatch } from 'src/store';
import { IElement } from 'src/types';
import { cancelRequest } from 'src/utils/axiosAPI';
import { applyAction, setModalActions } from '../acciones.slice';
import { Accion, AplicarAccionResponseBody, Parametro, TipoElemento } from '../types';
import { FormModal } from './form';
import styles from './style.module.less';

export interface ActionModalTableProps<Records> extends Pick<TableProps<Records>, 'columns' | 'dataSource' /* | 'rowKey' */> {
  rowKey?: string;
}

export interface ActionModalProps<Records> extends Pick<ModalProps, 'className' | 'style' | 'title' | 'width' | 'visible'> {
  type: TipoElemento;
  table: ActionModalTableProps<Records>;
  // onOk?: (accion: Accion) => void;
  onSuccess?: (response: AplicarAccionResponseBody) => void;
  onFailed?: () => void;
}

const CancelToken = axios.CancelToken;
let source: CancelTokenSource;

/* export const ActionModal = React.memo((props: ActionModalProps<any>) => { */
export function ActionModal<Records extends IElement>(props: ActionModalProps<Records>) {
  const { type, title, width, visible, table, onSuccess, onFailed } = props;
  const { columns, dataSource, rowKey } = table;
  const className = classNames(styles.button, props.className);

  const dispatch = useAppDispatch();
  const acciones = useSelector((state: RootState) => state.acciones);
  const sesion = useSelector((state: RootState) => state.sesion);

  const [form] = useForm();

  useEffect(() => {
    if (!visible) cancelRequest(source);
  }, [visible]);

  const runAction = (accion: Accion) => {
    source = CancelToken.source();
    dispatch(applyAction({ data: accion }))
      .then(unwrapResult)
      .then((response) => {
        onSuccess && onSuccess(response);
        const disabledOkButton = !response.some((res) => res.estado === 'Error');
        dispatch(setModalActions({ disabledOkButton }));
      })
      .catch((err) => onFailed);
  };

  const afterClose = () => {
    dispatch(setModalActions({ visible: false }));
    form.resetFields();
  };

  const extraComponentForm =
    acciones.data.dropdown?.acciones?.seleccionada?.parametros &&
    ({
      key: 'form',
      node: (
        <FormModal
          form={form}
          parametros={acciones.data.dropdown?.acciones?.seleccionada?.parametros}
          disabled={!!acciones.data.modal?.disabledOkButton}
        />
      ),
      position: 'bottom',
      style: { marginLeft: 'auto' },
    } as ExtraComponentTable);

  return (
    <TableModal
      title={title ?? <br />}
      width={width ?? '80%'}
      okText={acciones.loading ? 'Confirmando' : 'Confirmar'}
      cancelText={'Cerrar'}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            runAction({
              tipoElemento: type,
              idElementos: table.dataSource!.map((element) => (rowKey ? element[rowKey] : element.id)),
              idAccion: acciones.data.dropdown?.acciones?.seleccionada?.id!,
              idUsuario: sesion.data.idUsuario!,
              parametros: values,
            });
          })
          .catch((err) => {});
      }}
      okButtonProps={{ loading: acciones.loading, disabled: acciones.data.modal?.disabledOkButton, htmlType: 'submit' }}
      onCancel={() => dispatch(setModalActions({ visible: false }))}
      afterClose={afterClose}
      visible={visible}
      table={{
        columns,
        dataSource,
        rowKey: rowKey ?? 'id',
        hideRowSelection: true,
        extraColumns: { showKeyColumn: false, showActionsColumn: false },
        extraComponents: [
          extraComponentForm!,
          {
            key: 'records-count-tag',
            node: 'records-count-tag',
            position: 'top',
            style: { marginLeft: 'auto' },
          },
        ],
        sortable: true,
        pagination: { pageSize: 10 },
        scroll: { y: 350 },
      }}
    />
  );
}
