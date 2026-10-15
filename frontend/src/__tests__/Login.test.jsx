import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import * as authCtx from '../context/AuthContext.jsx';

jest.mock('../context/AuthContext.jsx');

const renderLogin = (login) => {
  authCtx.useAuth.mockReturnValue({ login });
  render(<MemoryRouter><Login /></MemoryRouter>);
};

test('wysyła email i hasło do funkcji login', async () => {
  const login = jest.fn().mockResolvedValue();
  renderLogin(login);
  await userEvent.type(screen.getByLabelText('Email'), 'jan@test.pl');
  await userEvent.type(screen.getByLabelText('Hasło'), 'haslo1234');
  await userEvent.click(screen.getByRole('button', { name: 'Zaloguj' }));
  expect(login).toHaveBeenCalledWith('jan@test.pl', 'haslo1234');
});

test('pokazuje komunikat błędu z API', async () => {
  const login = jest.fn().mockRejectedValue(new Error('Nieprawidłowy email lub hasło.'));
  renderLogin(login);
  await userEvent.type(screen.getByLabelText('Email'), 'jan@test.pl');
  await userEvent.type(screen.getByLabelText('Hasło'), 'zle');
  await userEvent.click(screen.getByRole('button', { name: 'Zaloguj' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Nieprawidłowy email lub hasło.');
});
