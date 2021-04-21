import { AutoComplete, Form } from 'antd';
import { SelectProps } from 'antd/lib/select';
import React, { useEffect, useState } from "react"
import { Sector } from 'src/components/GridConDetalle';
import { mockSectores } from 'src/types/sectores';

const buildOptions = (sectores: Sector[]) => {
    var ret: any[] = [];
    sectores.forEach((sector) => {
        ret.push({
            'value': `(${sector.id}) ` + sector.descripcion,
            'descripcion': sector.descripcion,
            'label': (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <span>
                        (<small style={{ color: "red" }}>{sector.id}</small>) {sector.descripcion}
                    </span>
                </div>
            ),
        })
    })
    return ret;
};

interface AutocompleteSectoresProps {
    input: any;
    setInput: (e: any) => void;
    setIsValid: Function;
    submitForm: boolean;
    clickReset: boolean;
}

export const AutocompleteSectores: React.FC<AutocompleteSectoresProps> = (props) => {

    const [inputError, setInputError] = useState<boolean>(false);
    const [optionSelect, setOptionSelect] = useState<boolean>(false);
    const [sectores] = useState<SelectProps<object>['options']>(buildOptions(mockSectores));


    useEffect(() => {
        const valid = isValid();
        if (valid) props.setInput(determineIdSector());
        props.setIsValid(valid);
    }, [props.submitForm]);



    useEffect(() => {
        props.setInput(undefined);
        setOptionSelect(false);
        setInputError(false);
        props.setIsValid(false);
    }, [props.clickReset]);


    const determineIdSector = () => {
        // /^[a-zA-Z0-9.\s]*$/.test(strValue)
        if (props.input && optionSelect) { // value.match(/^\(\d+\)[a-zA-ZÀ-ÿ)(/.-\s]*$/g)
            return !isNaN(parseInt(props.input)) ? props.input : parseInt(props.input.slice(1, props.input.indexOf(')')))  // EJ: (10) BALVANERA v directamente el id
        }
        else {
            if (props.input && isNaN(parseInt(props.input))) {
                return mockSectores.find((sector) => sector.descripcion.toUpperCase() === props.input.toUpperCase())?.id;
            }
            else {
                return props.input ? parseInt(props.input) : undefined; // return value // puede ser vacio o directamente el id 
            }
        }
    };

    const isValid = () => {
        const valid = props.input && (optionSelect || mockSectores.find((sector) => {
            if (!isNaN(parseInt(props.input))) return (sector!.id + '') === (props.input as string);
            else return sector!.descripcion.toUpperCase() === ((props.input as string).toUpperCase());
        })) || !props.input
        if (!valid) setInputError(true);
        return valid;
    };

    const isValidInputSucursal = () => {
        return !inputError && props.input && (optionSelect || mockSectores.find((sector) => {
            if (!isNaN(parseInt(props.input))) return (sector!.id + '').indexOf(props.input as string) !== -1
            else return sector!.descripcion.toUpperCase().indexOf((props.input as string).toUpperCase()) !== -1
        }))
    }

    const statusSucursal = () => {
        if (props.input && !isValidInputSucursal()) {
            return 'error';
        }
        else {
            return undefined
        }
    };

    const helpSucursal = () => {
        if (props.input && !isValidInputSucursal()) {
            return <small>Sucusal inválida</small>;
        }
        else {
            return undefined;
        }
    };

    const onSelect = (_: string) => {
        setOptionSelect(true);
    };

    return (
        <Form.Item
            name="sucursal"
            label="Suc/CC Propietario"
            validateStatus={statusSucursal()}
            help={helpSucursal()}
            hasFeedback
        >
            <AutoComplete
                style={{ textAlignLast: "center" }}
                placeholder="Ingrese nombre de sucursal o código"
                allowClear
                options={sectores}
                onClear={() => props.setInput(undefined)}
                filterOption={(inputValue, option) => {
                    if (!isNaN(parseInt(inputValue))) return (option!.value + '').indexOf(inputValue) !== -1
                    else return option!.descripcion.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }}
                onSelect={onSelect}
                onChange={(e) => {
                    if (optionSelect) setOptionSelect(false); // Se ejecuta primero OnChange, luego OnSelect
                    if (inputError) setInputError(false);
                    props.setInput(e)
                }}

            />
        </Form.Item>
    )
}