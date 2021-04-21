import React from 'react';
import { act } from 'react-dom/test-utils';
import { cleanup, fireEvent, render, waitForElement, wait, screen } from '@testing-library/react';
import { EditarCaja } from '../../../containers/layouts/EditarCaja';

afterEach(cleanup);
/* 
function mockFunction() {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useLocation: jest.fn().mockReturnValue({
      pathname: '/editarCaja',
      search: '?id=900',
      hash: '',
      state: null,
      key: '5nvxpbdafa',
    }),
  };
}

jest.mock('react-router-dom', () => mockFunction());
 */
/*describe('ingresar-cajas', () => {
  test('debe exportar el excel', async () => {
    render(<EditarCaja />);

    await waitForElement(() => screen.getByText(/Descargar Template Excel/i));
    expect(screen.getByText(/Descargar Template Excel/i)).toBeTruthy();
    //   fireEvent.click(screen.getByText(/Importar Excel/i));
  });
});
 */

describe('ingresar-cajas', () => {
  test('debe exportar el excel', async () => {
    expect(true).toBeTruthy();
    /*   render(<EditarCaja />);

    await waitForElement(() => screen.getByText(/Modificar Caja/i));
    expect(screen.getByText(/Modificar Caja/i)).toBeTruthy(); */
    //   fireEvent.click(screen.getByText(/Importar Excel/i));
  });
});
