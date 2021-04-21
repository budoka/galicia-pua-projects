import { Tag } from 'antd';
import React from 'react';
import { Texts } from '../../../../constants/texts';
import styles from './style.module.less';

interface RecordsCounterProps {
  count: number;
}

export const RecordsCounter = React.memo((props: RecordsCounterProps) => {
  const { count } = props;
  return (
    <Tag className={styles.tag} color="volcano">
      {Texts.REGISTRIES + ' ' + count}
    </Tag>
  );
});
