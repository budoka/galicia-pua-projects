import React from 'react';
// import { Resizable } from 'react-resizable';
import styles from './style.module.less';

export const Column = (props: any) => {
  const { onResize, width, ...restProps } = props;


  // if onResize is not defined render default th
  /* 
  if (!width || !onResize) {
    return <th {...restProps} />;
  }

   return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className={styles.resizable}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}>
      <th {...restProps} />
    </Resizable>
  ); */

  return <th {...restProps} />;
};
