import React from 'react';
import { Button, Result } from 'antd';
import { goHome } from 'src/utils/history';
import { ResultStatusType } from 'antd/lib/result';


interface NotFoundProps {
  status: ResultStatusType | undefined,
  title: string,
  subTitle: string

};
export const NotFound: React.FC<NotFoundProps> = (props: NotFoundProps) => {
  return (
    <Result
      status={props.status}
      title={props.title}
      subTitle={props.subTitle}
      extra={
        <Button type="primary" onClick={goHome}>
          Ir al Inicio
        </Button>
      }
    />
  );
};
