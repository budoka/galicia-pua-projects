import { Button, Popconfirm } from 'antd';
import React, { useEffect } from 'react';
import { Texts } from '../../../../constants/texts';
import { TableAction } from '../..';

interface DeleteButtonProps {
  disabled: boolean;
  onDelete: () => void;
}

export const DeleteButton = React.memo((props: DeleteButtonProps) => {
  const { disabled, onDelete } = props;

  return (
    <Popconfirm title={Texts.DELETE_SELECTED_ROWS} onConfirm={onDelete} okText={Texts.YES} cancelText={Texts.NO} disabled={disabled}>
      <Button type="primary" danger disabled={disabled}>
        {Texts.DELETE}
      </Button>
    </Popconfirm>
  );
});
