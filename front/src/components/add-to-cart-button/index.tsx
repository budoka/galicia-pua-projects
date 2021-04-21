import { ShoppingCartOutlined } from '@ant-design/icons';
import { Badge, Button } from 'antd';
import { BadgeProps } from 'antd/lib/badge';
import { ButtonProps } from 'antd/lib/button';
import classNames from 'classnames';
import React from 'react';
import { BasicComponentProps } from '../../types';
import { PlusOutlined } from '@ant-design/icons';
import styles from './style.module.less';

interface AddToCartProps
  extends Pick<ButtonProps, 'disabled' | 'icon' | 'loading' | 'onClick'>,
    Pick<BasicComponentProps<HTMLButtonElement>, 'className' | 'style'> {}

export const AddToCart: React.FC<AddToCartProps> = React.memo((props) => {
  const { className, children, ...restProps } = props;
  const buttonClassName = classNames(className, styles.addToCart);

  return (
    <Button type="primary" {...restProps} className={buttonClassName}>
      {children ? (
        children
      ) : (
        <>
          {restProps.loading ? (
            <span style={{ marginLeft: 8 }}>Validando</span>
          ) : (
            <span>
              <PlusOutlined style={{ fontSize: '16px', marginRight: '2px' }} /> Agregar al carrito
            </span>
          )}
        </>
      )}
    </Button>
  );
});
