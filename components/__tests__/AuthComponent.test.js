import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthComponent from '../AuthComponent';
import { AuthProvider } from '../../context/AuthContext';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

describe('AuthComponent', () => {
  const mockSetCurrentUser = jest.fn();
  const mockSetAppInitializationError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(
      <AuthProvider>
        <AuthComponent 
          setCurrentUser={mockSetCurrentUser}
          setAppInitializationError={mockSetAppInitializationError}
        />
      </AuthProvider>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('switches to register form when clicking register link', () => {
    render(
      <AuthProvider>
        <AuthComponent 
          setCurrentUser={mockSetCurrentUser}
          setAppInitializationError={mockSetAppInitializationError}
        />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText(/need an account\? register/i));
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    const mockError = new Error('Invalid credentials');
    require('firebase/auth').signInWithEmailAndPassword.mockRejectedValueOnce(mockError);

    render(
      <AuthProvider>
        <AuthComponent 
          setCurrentUser={mockSetCurrentUser}
          setAppInitializationError={mockSetAppInitializationError}
        />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('disables form inputs during submission', async () => {
    render(
      <AuthProvider>
        <AuthComponent 
          setCurrentUser={mockSetCurrentUser}
          setAppInitializationError={mockSetAppInitializationError}
        />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Processing...');
  });
}); 