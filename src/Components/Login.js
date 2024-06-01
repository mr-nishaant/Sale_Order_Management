// src/components/Login.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Input, FormControl, FormLabel,
} from '@chakra-ui/react';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    // Dummy authentication
    if (data.username === 'admin' && data.password === 'password') {
      localStorage.setItem('auth', true);
      navigate('/orders');
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input {...register('username')} />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input type="password" {...register('password')} />
        </FormControl>
        <Button type="submit">Login</Button>
      </form>
    </Box>
  );
};

export default Login;
