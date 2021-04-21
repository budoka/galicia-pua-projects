import { getURLs } from "../utils/ConfigurationServices";


export const  obtenerSectorUsuario = async (legajo: string | number) => {
    const response = await fetch(getURLs().InfoUsuario, {
      method: 'POST',
      body: JSON.stringify({
        legajo: legajo,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  };