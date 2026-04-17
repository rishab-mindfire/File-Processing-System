import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from './LoginPage';
import { AuthProvider } from '../../context/AuthProvider';
import { loginApi } from '../../services/loginService';
import '@testing-library/jest-dom';

vi.mock('../../services/loginService', () => ({
  loginApi: vi.fn(),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
};

describe('Login Form Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update input values when user types', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // CLEANUP: Ensure fields are empty before typing
    await user.clear(emailInput);
    await user.clear(passwordInput);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should show error when form is submitted empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // CLEANUP: Ensure fields are empty
    await user.clear(emailInput);
    await user.clear(passwordInput);

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Verify validation messages appear
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();

    // check API will be not called here until validation
    expect(loginApi).not.toHaveBeenCalled();
  });

  it('should display "Login failed" message when the API call fails', async () => {
    const user = userEvent.setup();

    // Mock rejection
    vi.mocked(loginApi).mockRejectedValue(new Error('Unauthorized'));

    renderWithProviders(<Login />);

    // Fill out the form
    await user.clear(screen.getByLabelText(/email address/i));
    await user.type(screen.getByLabelText(/email address/i), 'rishab@test.com');
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');

    // Submit
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Verify the UI caught the error and displayed the general message
    const errorMessage = await screen.findByText(/login failed/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('should call loginApi with form data when valid', async () => {
    const user = userEvent.setup();

    // Mock a successful response
    vi.mocked(loginApi).mockResolvedValue('fake-token-123');

    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Clear and fill with valid data
    await user.clear(emailInput);
    await user.type(emailInput, 'dev@example.com');

    await user.clear(passwordInput);
    await user.type(passwordInput, 'secure123');

    await user.click(submitButton);

    // Verify the call happened with the correct object
    await waitFor(() => {
      expect(loginApi).toHaveBeenCalledWith({
        email: 'dev@example.com',
        password: 'secure123',
      });
    });
  });
});
