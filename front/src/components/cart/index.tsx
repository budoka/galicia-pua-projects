import { ShoppingCartOutlined } from '@ant-design/icons';
import { Badge, Button } from 'antd';
import { BadgeProps } from 'antd/lib/badge';
import classNames from 'classnames';
import React from 'react';
import { BasicComponentProps } from '../../types';
import styles from './style.module.less';

interface CartProps extends Pick<BasicComponentProps<HTMLButtonElement>, 'className' | 'style' | 'onClick'> {
  count?: number;
  badge?: Pick<BadgeProps, 'size'>;
}

export const Cart: React.FC<CartProps> = React.memo((props) => {
  const { count, badge, onClick } = props;
  const className = classNames(props.className, styles.cart);

  return (
    <Badge className={styles.badge} count={count} size={badge?.size}>
      <Button className={className} icon={<ShoppingCartOutlined />} disabled={!count} onClick={onClick} />
    </Badge>
  );
});
