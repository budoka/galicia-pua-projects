import { Button, Card, DatePicker, Divider, Form, Input, message, PageHeader, Select } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from "react"
import { apis } from 'src/API/setup/setup-apis';
import { buildAxiosRequestConfig } from 'src/API/utils';
import { Moment } from 'moment';
import styles from './style.module.less';
import { ColProps } from 'antd/lib/col';
import { exportToCSV2 } from 'src/utils/ExportExcel';
import { DownloadOutlined } from '@ant-design/icons';
import { getValuesOfFilter } from 'src/utils/axiosAPI';
import { IFilterItem, IItemValue } from 'src/components/filter-input/types';
import { getURLs } from 'src/utils/ConfigurationServices';
import { filters } from 'src/types/filters';
import { AutocompleteSectores } from './autocomplete-sectores';

const formLayout = {

    /*
    ItemCol: {
        //span: 4,
        offset: 20,
        //xs: { span: 4 },
        //sm: { span: 4 },
        //align: 'center',  
    },
    */
    labelCol: {
        span: 8,
        offset: 2,
        //offset: 5,
        //align: 'right',
    } as ColProps,
    wrapperCol: {
        sm: { span: 10 },
        md: { span: 8 },
        lg: { span: 6 },
        xl: { span: 4 },
    } as ColProps,

};

const tailLayout = {

    wrapperCol: { offset: 10 },
};

const { Option } = Select;

type TipoCaja = {
    id: number | string,
    descripcion: string,
}

type Title = "Guarda y Destrucción" | "Resumen de Pédidos" | "Alta de Cajas" | "Detalle de Pédidos" | "Historial de Procesos";
const reporteGuardaCajas: Title = "Guarda y Destrucción";
const reporteResumenPedidos: Title = "Resumen de Pédidos";
const reporteAltaCajas: Title = "Alta de Cajas";
const reporteDetallePedidos: Title = "Detalle de Pédidos";
const reporteHistorialProcesos: Title = "Historial de Procesos";
//const tamaniosPedido: string[] = ['Todos', 'Simple', 'Masivo', 'Extraordinario'];
const tiposItem: string[] = ['Todos', 'Caja', 'Documento'];

interface ReportesProps {
    type: string;
}

// Faltaria /
//const textPattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ0-9&.,:-\s]*$/;
//const Config: Rule[] = [{ message: <small style={{ textAlignLast: "center" }}>formato incorrecto!</small>, pattern: textPattern }];

const filtersAvailable: IFilterItem[] = filters.filter((f) => f.label === 'Estado');

const mockProcesos: string[] = ["Cajas", "Documentos", "Pedidos"]; //"Todos"

export const Reportes: React.FC<ReportesProps> = (props: ReportesProps) => {
    const [form] = Form.useForm();
    const [title, setTitle] = useState<Title>();
    const [option, setOption] = useState<string>();
    const [tiposCaja, setTiposCaja] = useState<TipoCaja[]>([]);
    const [tiposProcesos, setTiposProcesos] = useState<string[]>(mockProcesos);
    const [fechaDesde, setFechaDesde] = useState<Moment | null>(null);
    const [fechaHasta, setFechaHasta] = useState<Moment | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const initialValue: TipoCaja = ({
        id: "Todos",
        descripcion: "Todos"
    });

    // compartidos con componente autocomplete sucusales
    const [input, setInput] = useState<any>();
    const [isValid, setIsValid] = useState<boolean>(false);
    const [clickSubmitForm, setClickSubmitForm] = useState<boolean>(false);
    const [clickReset, setClickReset] = useState<boolean>(false);
    // compartidos con componente autocomplete sucusales
    const [stateList, setStateList] = useState<IItemValue[]>([]);

    const getCajas = async () => {
        const data = {};
        const api = apis['TIPOS_CAJA'];
        const resource = api.resources['TIPO_CAJA'];
        const axiosConfig = buildAxiosRequestConfig(api, resource, { data });

        const response = await axios.request<TipoCaja[]>(axiosConfig);
        setTiposCaja([initialValue, ...response.data]);
    };
    const getProcesos = () => {
        //setTiposProcesos([...mockProcesos]);
    };
    const getEstados = async () => {
        // obtiene estados
        await getValuesOfFilter<IItemValue[]>(
            { method: 'POST', url: getURLs().ObtenerEstados, data: { tipoContenido: 'pedido' } },
            setListValueEstado,
            'Estado',
        );
    };

    const setListValueEstado = (label: string, values: IItemValue[]) => {
        const todosItem: IItemValue = {
            'id': 'Todos',
            'descripcion': 'Todos'
        }
        const i = filtersAvailable.find((i) => i.label === label);

        setStateList([todosItem, ...values]);
        if (i) i.listValues = values;
    };

    const determineTitle = (option: any) => {
        if (option === 'CajaGuarda') setTitle(reporteGuardaCajas);
        if (option === 'CajaAlta') setTitle(reporteAltaCajas);
        if (option === 'ResumenPedido') setTitle(reporteResumenPedidos); // PedidoResumen 
        if (option === 'PedidoDetalle') setTitle(reporteDetallePedidos);
        if (option === 'HistorialProcesos') setTitle(reporteHistorialProcesos);
    };

    useEffect(() => {
        onReset();
        if (props.type === 'CajaGuarda' || props.type === 'CajaAlta') {
            getCajas();
        }
        if (props.type === 'PedidoDetalle') {
            getEstados();
        }
        if (props.type === 'HistorialProcesos') {
            getProcesos();
        }
        setOption(props.type);
        determineTitle(props.type);
    }, [props.type]);



    const determineParametros = (values: any[]) => {
        var retObject = {};
        Object.keys(values).forEach((property, index) => {
            if (property !== 'tipo') {
                Object.defineProperty(retObject, property, {
                    value: property === 'sucursal' ? (input ? input : "") : Object.values(values)[index],
                    writable: true,
                    enumerable: true,
                    configurable: true
                })
            }

        })
        return retObject;
    }

    const validateResponse = (data: any[]) => {
        if (data.length === 1 && data[0].CodigoRespuesta) {
            message.error("imposible generar reporte. " + data[0].CodigoRespuesta);
        }
        else {
            message.success("Reporte generado exitosamente. ")
            exportToCSV2('Reporte ' + option + ' ' + new Date().toLocaleString(), data);
        }
    }



    const onFinish = async (values: any[]) => {
        if ((fechaDesde && fechaHasta && fechaDesde > fechaHasta) || (option === 'CajaAlta' && !isValid)) return
        setLoading(true);
        const data = { 'nombre': option, 'parametros': determineParametros(values) };
        const api = apis['REPORTE'];
        const resource = api.resources['CREAR'];
        const axiosConfig = buildAxiosRequestConfig(api, resource, { data });
        const response = await axios.request<any[]>(axiosConfig);
        if (response.status === 200) {
            validateResponse(response.data);
            setLoading(false);
        } else {
            setLoading(false);
            message.error('Ocurrió un error al generar el reporte, vuelva a intentarlo mas tarde');
        }
    };

    const onReset = () => {
        setFechaDesde(null);
        setFechaHasta(null);
        form.resetFields();
    };

    const validateFecha = () => {
        if (fechaDesde && fechaHasta &&
            fechaDesde > fechaHasta) {
            return 'error';
        }
        else {
            return undefined
        }
    };

    const helpFecha = (name: string) => {
        if (fechaDesde && fechaHasta &&
            fechaDesde > fechaHasta && name === 'fechaDesde') {
            return <small>Fecha Desde debe ser menor que Fecha Hasta</small>;
        }
        if (fechaDesde && fechaHasta &&
            fechaDesde > fechaHasta && name === 'fechaHasta') {
            return <small>Fecha Hasta debe ser mayor que Fecha Desde</small>
        }
        else {
            return undefined
        }
    };

    const RenderCajaGuarda = (): JSX.Element => {
        return (
            <Form.Item name="tipoCaja" label="Tipo de Caja" initialValue={'Todos'}>
                <Select className={styles.select}>
                    {tiposCaja.map((caja) => {
                        return (
                            <Option key={caja.id} value={caja.id}>
                                {
                                    caja.descripcion
                                }
                            </Option>
                        );
                    })}
                </Select>
            </Form.Item>
        )
    }

    const RenderHistorialProcesos = (): JSX.Element => {
        return (
            <>
                <Form.Item
                    name="proceso"
                    label="Procesos"
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: <small>Un proceso es requerido</small>,
                        },
                    ]}

                >
                    <Select className={styles.select} allowClear>
                        {tiposProcesos.map((tipoProceso, index) => {
                            return (
                                <Option key={index} value={tipoProceso}>
                                    {tipoProceso}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>
                <Form.Item name="numero" label="Número" hasFeedback //hasFeedback
                    rules={[
                        {
                            //type: 'integer',
                            required: true,
                            pattern: /^[0-9]*$/,
                            message: <small>"Debe ingresar un número"</small>  //'formato no permitido'
                        },
                    ]}
                >
                    <Input
                        type="number"
                        allowClear
                        min={1}

                    />
                </Form.Item>
            </>
        )
    }

    const RenderDetallePedido = (): JSX.Element => {
        return (
            <>
                <Form.Item name="tipoItem" label="Tipo de Item" initialValue={'Todos'}>
                    <Select className={styles.select}>
                        {tiposItem.map((tipoItem, index) => {
                            return (
                                <Option key={index} value={tipoItem}>
                                    {tipoItem}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>
                <Form.Item name="estado" label="Estado" initialValue={'Todos'}>
                    <Select className={styles.select}>
                        {stateList.map((state, index) => {
                            return (
                                <Option key={index} value={state.id}>
                                    {state.descripcion}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>
            </>
        )
    }


    return (
        <Card className={`wrapper unselectable${styles.content}`} bordered={false}>
            <Form {...formLayout} className={styles.form} form={form} name="reportes" onFinish={onFinish}>
                <PageHeader style={{ alignSelf: 'flex-start' }} title={"Reportes"} subTitle={title} />
                <Divider />
                {
                    option === 'HistorialProcesos' ?
                        <RenderHistorialProcesos />
                        :
                        (<>
                            <Form.Item
                                name="fechaDesde"
                                label="Fecha Desde"
                                validateStatus={validateFecha()}
                                help={helpFecha("fechaDesde")}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'La fecha Desde es requerida',
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    placeholder="dd/mm/aaaa"
                                    format={'DD/MM/YYYY'}
                                    onChange={(e) => setFechaDesde(e)}
                                />
                            </Form.Item>
                            <Form.Item
                                name="fechaHasta"
                                label="Fecha Hasta"
                                validateStatus={validateFecha()}
                                help={helpFecha("fechaHasta")}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'La fecha Hasta es requerida',
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    placeholder="dd/mm/aaaa"
                                    format={'DD/MM/YYYY'}
                                    onChange={(e) => setFechaHasta(e)}
                                />
                            </Form.Item>
                            {
                                option === 'PedidoDetalle' ?
                                    (
                                        <RenderDetallePedido />
                                    )
                                    : option === 'CajaAlta' ? (
                                        <>
                                            <RenderCajaGuarda />
                                            <AutocompleteSectores input={input} setInput={setInput} setIsValid={setIsValid}
                                                submitForm={clickSubmitForm} clickReset={clickReset}
                                            />
                                        </>
                                    )
                                        : option === 'CajaGuarda' ? (
                                            <RenderCajaGuarda />
                                        ) : <></>
                            }
                        </>)
                }
                <Form.Item {...tailLayout}>
                    <Button className={styles.buttonExcel} icon={<DownloadOutlined />} onClick={(e) => setClickSubmitForm(!clickSubmitForm)} htmlType="submit" loading={loading} >
                        Generar Reporte
                    </Button>

                    <Button
                        type="link"
                        htmlType="button"
                        onClick={(e) => {
                            setClickReset(!clickReset);
                            onReset();
                        }}
                        disabled={loading}>
                        Limpiar
                    </Button>
                </Form.Item>
            </Form>
        </Card>

    );

}

