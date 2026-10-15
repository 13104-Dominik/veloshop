import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BikeCard from '../components/BikeCard.jsx';

const bike = { id: 1, nazwa: 'Trek FX 3', marka: 'Trek', cena: 3499, zdjecie: 'zdjecia/trek_fx3.jpg' };

test('wyświetla nazwę, markę i zdjęcie', () => {
  render(<BikeCard bike={bike} onAdd={() => {}} />);
  expect(screen.getByText('Trek FX 3')).toBeInTheDocument();
  expect(screen.getByAltText('Trek FX 3')).toHaveAttribute('src', '/zdjecia/trek_fx3.jpg');
});

test('kliknięcie przycisku wywołuje onAdd z rowerem', async () => {
  const onAdd = jest.fn();
  render(<BikeCard bike={bike} onAdd={onAdd} />);
  await userEvent.click(screen.getByRole('button', { name: /dodaj do koszyka/i }));
  expect(onAdd).toHaveBeenCalledWith(bike);
});
