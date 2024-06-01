import React, { useState } from 'react';
import {
  Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, useDisclosure,
  Table, Thead, Tbody, Tr, Th, Td, Select, useToast, Input,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ThemeToggle from './ThemeToggle';

const fetchOrders = async (status) => {
  const response = await fetch(`http://localhost:5000/orders?status=${status}`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorResponse = await response.text();
    console.error('Error response:', errorResponse);
    throw new Error(`Network response was not ok. Status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

const fetchUserDetails = async () => {
  const response = await fetch(`http://localhost:5000/users`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorResponse = await response.text();
    console.error('Error response:', errorResponse);
    throw new Error(`Network response was not ok. Status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

const fetchProductDetails = async () => {
  const response = await fetch(`http://localhost:5000/products`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorResponse = await response.text();
    console.error('Error response:', errorResponse);
    throw new Error(`Network response was not ok. Status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

const SaleOrders = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { register, handleSubmit } = useForm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErrorData
  } = useQuery({
    queryKey: ['orders', status],
    queryFn: () => fetchOrders(status)
  });

  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
    error: usersErrorData
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUserDetails
  });

  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorData
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProductDetails
  });

  const mutation = useMutation({
    mutationFn: newOrder => {
      return fetch('http://localhost:5000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      toast({
        title: "Order created.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatedOrder => {
      return fetch(`http://localhost:5000/orders/${updatedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrder),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      toast({
        title: "Order updated.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      onClose();
    },
  });

  const onSubmit = (data) => {
    if (selectedOrder) {
      updateMutation.mutate({ ...selectedOrder, ...data });
    } else {
      mutation.mutate(data);
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    onOpen();
  };

  if (ordersLoading || usersLoading || productsLoading) return <div>Loading...</div>;
  if (ordersError || usersError || productsError) return <div>Error: {ordersErrorData?.message || usersErrorData?.message || productsErrorData?.message}</div>;

  return (
    <Box p={8}>
      <ThemeToggle />
      <Select onChange={(e) => setStatus(e.target.value)} value={status}>
        <option value="active">Active Orders</option>
        <option value="completed">Completed Orders</option>
      </Select>
      {orders?.length > 0 ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order) => (
              <Tr key={order.id}>
                <Td>{order.id}</Td>
                <Td>{users?.find(user => user.id === order.customer_id)?.name}</Td>
                <Td>{order.status}</Td>
                <Td>
                  <Button onClick={() => handleEdit(order)}>Edit</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <div>No orders found.</div>
      )}
      <Button onClick={() => { setSelectedOrder(null); onOpen(); }}>+ Sale Order</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedOrder ? 'Edit Sale Order' : 'Create Sale Order'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Select {...register('customer_id')} defaultValue={selectedOrder ? selectedOrder.customer_id : ''}>
                {users?.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </Select>
              <Input {...register('invoice_no')} placeholder="Invoice Number" defaultValue={selectedOrder ? selectedOrder.invoice_no : ''} />
              <Input type="date" {...register('invoice_date')} placeholder="Invoice Date" defaultValue={selectedOrder ? selectedOrder.invoice_date : ''} />
              <Select {...register('product_id')} defaultValue={selectedOrder ? selectedOrder.product_id : ''}>
                {products?.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </Select>
              <Select {...register('status')} defaultValue={selectedOrder ? selectedOrder.status : 'active'}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </Select>
              <Button type="submit">{selectedOrder ? 'Update' : 'Submit'}</Button>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SaleOrders;
