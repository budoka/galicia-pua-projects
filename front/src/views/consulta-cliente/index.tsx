import { Alert, Button } from "antd"
import React, { useState } from "react"


export const ConsultaDocumentosCliente: React.FC = () => {
    const [alert, setAlert] = useState<boolean>(false);

    return <>
    

{/* style={{ backgroundColor:"orange"}} */}
<Button name="btn" className="clean" type="primary" htmlType="submit" >
    Limpiar
</Button>

<br></br>
<br></br>

<p>Búsquedas por: </p>


<div className="form-check-row">
    
    <input
        //key={'input' + etiqueta.id}
        className="form-check-input"
        type="checkbox"
        //checked={hasLabel(etiqueta.id)}
        //onChange={(e) => onChangeValue(etiqueta.id)}
        //id={etiqueta.id + ''}
        //disabled={props.disable}
    ></input>
    <label className="form-check-label" > {/* htmlFor={etiqueta.descripcion} */}
        Cliente
    </label>

    
</div>

      {alert && (
        <>
          {/* <Alert style={{ fontWeight: 'bold' }} message={props.mensaje} type="success" showIcon closable  /> {/*  onClose={(e) => setAlert(false)} */} 
          <br></br>
        </>
      )}
                
    

        
        
    </>
}



