import { ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { TooltipPropsWithOverlay, TooltipPropsWithTitle } from 'antd/lib/tooltip';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';

interface RefreshButtonProps {
  disabled: boolean;
  running: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  task?: () => Promise<void>;
}

export const RefreshButton = React.memo((props: RefreshButtonProps) => {
  const { disabled, task, setRefresh, running } = props;

  /* const [state, setState] = useState({
    running: disabled,
    show: false,
  });*/
  /*const [running, setRefresh] = useState(disabled);*/
  const [show, setShow] = useState(false);

  const onVisibleChange = (show: boolean) => {
    setShow(show);
    //setState((prev) => ({ ...prev, show }));
  };

  const handleRefresh = () => {
    setShow(false);
    //  setState((prev) => ({ running: true, show: false }));
    const init = moment().valueOf();
    setRefresh(true);
    task &&
      task().then(() => {
        const end = moment().valueOf();
        const animationTime = Math.ceil((end - init) / 1000) * 1000;

        setTimeout(() => setRefresh(false), animationTime);
        // setTimeout(() => setState((prev) => ({ ...prev, running: false })), animationTime);
      });
  };

  return (
    <Tooltip title="Actualizar" visible={show} onVisibleChange={onVisibleChange}>
      <Button style={{ paddingTop: 0 }} disabled={disabled} type="link" icon={<ReloadOutlined spin={running} />} onClick={handleRefresh} />
    </Tooltip>
  );
});

/*
import { ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { TooltipPropsWithOverlay, TooltipPropsWithTitle } from 'antd/lib/tooltip';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';

interface RefreshButtonProps {
  disabled: boolean;
  task?: () => Promise<void>;
}

export const RefreshButton = (props: RefreshButtonProps) => {
  const { disabled, task } = props;

  const [state, setState] = useState({
    running: disabled,
    show: false,
  });


  const onVisibleChange = (show: boolean) => {
    setState((prev) => ({ ...prev, show }));
  };

  const handleRefresh = () => {
    //  setRefresh(true);
    // setShow(false);
    setState((prev) => ({ running: true, show: false }));
    const init = moment().valueOf();
    task &&
      task().then(() => {
        const end = moment().valueOf();
        const animationTime = Math.ceil((end - init) / 1000) * 1000;

        setTimeout(() => setState((prev) => ({ ...prev, running: true })), animationTime);
      });
  };

  return (
    <Tooltip title="Actualizar" visible={state.show} onVisibleChange={onVisibleChange}>
      <Button
        style={{ paddingTop: 0 }}
        disabled={disabled || state.running}
        type="link"
        icon={<ReloadOutlined spin={state.running} />}
        onClick={handleRefresh}
      />
    </Tooltip>
  );
};

export default React.memo(RefreshButton);
*/
