import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import FormInput from './FormInput';
import Button from './Button';
import './LoginForm.css';

export default function LoginForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const usernameRules = {
    required: 'Username is required'
  };

  const passwordRules = {
    required: 'Password is required'
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
      <FormInput
        name="username"
        label="Username"
        placeholder="Enter your username"
        register={register}
        rules={usernameRules}
        error={errors.username}
        autoFocus={true}
      />

      <FormInput
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        register={register}
        rules={passwordRules}
        error={errors.password}
      />

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={isLoading}
        variant="primary"
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </Button>

      <div className="signup-link">
        <p>
          Don't have an account?{' '}
          <Link to="/register">Sign up</Link>
        </p>
      </div>
    </form>
  );
}
