import axios from "axios";

const PAYMENT_API = "http://localhost:5000/api/payment";

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
