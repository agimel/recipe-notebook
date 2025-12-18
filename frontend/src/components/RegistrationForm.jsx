import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import FormInput from './FormInput';
import Button from './Button';
import { useRegistration } from '../hooks/useRegistration';
import './RegistrationForm.css';

export default function RegistrationForm() {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    mode: 'onBlur',
    revalidateMode: 'onChange',
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const { register: registerUser, isLoading } = useRegistration(setError);

  const usernameValue = watch('username');

  const usernameRules = {
    required: 'Username is required',
    minLength: {
      value: 3,
      message: 'Username must be between 3 and 50 characters'
    },
    maxLength: {
      value: 50,
      message: 'Username must be between 3 and 50 characters'
    },
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message: 'Username can only contain letters, numbers, and underscores'
    }
  };

  const passwordRules = {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters'
    }
  };

  const onSubmit = async (data) => {
    await registerUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="registration-form" noValidate>
      <FormInput
        name="username"
        label="Username"
        placeholder="Enter username (3-50 characters)"
        register={register}
        rules={usernameRules}
        error={errors.username}
        value={usernameValue}
        maxLength={50}
        showCharacterCounter={true}
      />

      <FormInput
        name="password"
        label="Password"
        type="password"
        placeholder="Enter password (minimum 6 characters)"
        register={register}
        rules={passwordRules}
        error={errors.password}
      />

      <Button
        type="submit"
        isLoading={isLoading || isSubmitting}
        disabled={isLoading || isSubmitting}
        variant="primary"
      >
        {isLoading || isSubmitting ? 'Creating...' : 'Create Account'}
      </Button>

      <div className="login-link">
        <p>
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </form>
  );
}
