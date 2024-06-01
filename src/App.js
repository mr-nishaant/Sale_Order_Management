// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './Components/Login';
import SaleOrders from './Components/SaleOrders';
import ProtectedRoute from './Components/ProtectedRoute';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <SaleOrders />  
            </ProtectedRoute>
          }
        />
      </Routes>
    </QueryClientProvider>
  );
};

export default App;
