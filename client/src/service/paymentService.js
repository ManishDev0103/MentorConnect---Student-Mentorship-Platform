import axios from "axios";

const PAYMENT_API = import.meta.env.VITE_PAYMENT_API_URL || "http://localhost:5083/api/payment";

export const createOrder = (studentId, planId, amount, sessionId = null) => {
  return axios.post(`${PAYMENT_API}/create-order`, {
    studentId,
    planId,
    amount,
    sessionId
  });
};

export const verifyPayment = (data) => {
  return axios.post(`${PAYMENT_API}/verify`, data);
};
