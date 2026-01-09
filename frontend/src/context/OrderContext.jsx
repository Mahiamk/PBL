import React, { createContext, useState, useContext, useEffect } from 'react';
import { createOrder, fetchCustomerDashboard } from '../lib/api';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.userId) {
      fetchCustomerDashboard(user.userId)
        .then(data => {
            const mappedOrders = data.active_orders.map(o => ({
                id: o.order_id,
                store_order_id: o.store_order_id,
                date: new Date(o.order_date).toISOString().split('T')[0],
                total: o.total_amount,
                status: o.status,
                items: o.items,
                vendor_user_id: o.vendor_user_id, // Added for messaging
                store_name: o.store_name, // Added for UI
                paymentMethod: o.payment_method || 'Online Payment'
            }));
            setOrders(mappedOrders);
        })
        .catch(console.error);
    } else {
        setOrders([]);
    }
  }, [user]);

  const addOrder = async (orderData) => {
    try {
        const apiPayload = {
            items: orderData.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                product_price: item.product_price
            })),
            payment_method: orderData.paymentMethod
        };
        
        const newOrders = await createOrder(apiPayload);
        
        // Handle list of orders returned from backend
        const mappedOrders = newOrders.map(newOrder => ({
            id: newOrder.order_id,
            store_order_id: newOrder.store_order_id,
            date: new Date(newOrder.order_date).toISOString().split('T')[0],
            total: newOrder.total_amount,
            status: newOrder.status,
            items: newOrder.items,
            paymentMethod: newOrder.payment_method
        }));
        
        setOrders(prev => [...mappedOrders, ...prev]);
        return mappedOrders;
    } catch (error) {
        console.error("Failed to create order", error);
        throw error;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
