import axios from "axios";

const login_url="http://localhost:5000/auth/";

export const createuser=(data)=>{
return axios.post(`${login_url}register`,data);
}
export const loginuser=(data)=>{
return axios.post(`${login_url}login`,data);
}