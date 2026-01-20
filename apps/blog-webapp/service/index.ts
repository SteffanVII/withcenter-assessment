import axios, { AxiosHeaders } from "axios";

export const axiosHeaders = (customHeaders?: Record<string, string>): AxiosHeaders => {
    const headers = new AxiosHeaders({
        'Content-Type': 'application/json',
    });
    if (customHeaders) {
        Object.entries(customHeaders).forEach(([key, value]) => {
            headers.set(key, value);
        });
    }
    return headers;
}

export let axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    headers : axiosHeaders(),
    withCredentials : true
})