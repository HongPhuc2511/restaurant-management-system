import axios from "axios"

export const endpoints={
    'categories': "/api/categories/",
    'foods':"/api/foods/",
    'login':"/o/token/",
    'register':"/api/users/",
    'current-user': "/api/users/current-user/", 
    'available-tables': "/api/tables/available/",
    'reservations': "/api/reservations/",
    'orders': "/api/orders/",
    'create-vnpay': '/api/payment/create-vnpay/',
    'vnpay-callback': '/api/payment/vnpay-callback/',
    'apply-voucher': "/api/vouchers/apply/",
    'google-login': "/api/google-login/",
    'vouchers': "/api/vouchers/",
}

export const authApis=(token)=>{
    return axios.create({
        baseURL:"http://127.0.0.1:8000/",
        headers:{
            'Authorization':`Bearer ${token}`
        }   
    });
}

export default axios.create({
    baseURL:"http://127.0.0.1:8000/"
})