import { DownloadOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Texts } from '../../../../constants/texts';
import { BasicComponentProps } from '../../../../types';
import styles from './style.module.less';

interface ExportButtonProps extends Pick<BasicComponentProps<HTMLButtonElement>, 'className' | 'style'> {
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const ExportButton = React.memo((props: ExportButtonProps) => {
  const { style, disabled, loading, onClick } = props;
  const className = classNames(styles.button, props.className);

  return (
    <Button className={className} style={style} icon={<DownloadOutlined />} disabled={disabled} loading={loading} onClick={onClick}>
      {loading ? Texts.EXPORTING : Texts.EXPORT}
    </Button>
  );
});
