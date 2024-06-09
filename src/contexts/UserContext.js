import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const getUser = useCallback(async () => {
        try {
            const accessToken = sessionStorage.getItem("accessToken");

            if(!accessToken) return;
            
            const response = await axios.get(`http://${BASE_URL}/api/token`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const decoded = jwtDecode(response.data.accessToken);
            
            const userInfo = {
                userId: decoded.userId,
                name: decoded.name,
                email: decoded.email,
                schoolName: decoded.schoolName,
                schoolCode: decoded.schoolCode,
                schoolAddress: decoded.schoolAddress,
                commonPassword: decoded.commonPassword,
                workStatus: decoded.workStatus,
                bedCount: decoded.bedCount,
                pmStation: decoded.pmStation,
                notifyPm: decoded.notifyPm
            };

            setUser(userInfo);
            return userInfo;
        }catch(error) {
            sessionStorage.removeItem("accessToken");
            navigate("/");
            console.error("사용자 정보 획득 중 ERROR", error);
        }
    }, [navigate]);

    const updateUser = (newUserInfo) => {
        setUser(newUserInfo);
    };

    const login = async (userData, accessToken) => {
        try {
            sessionStorage.setItem("accessToken", accessToken);
            sessionStorage.setItem("schoolCode", userData.schoolCode);
            setUser({
                userId: userData.userId,
                name: userData.name,
                email: userData.email,
                schoolName: userData.schoolName,
                schoolCode: userData.schoolCode,
                schoolAddress: userData.schoolAddress,
                commonPassword: userData.commonPassword,
                workStatus: userData.workStatus,
                bedCount: userData.bedCount,
                pmStation: userData.pmStation,
                notifyPm: userData.notifyPm
            });
        } catch (error) {
            console.error("로그인 처리 중 ERROR", error);
            navigate("/");
        }
    };

    const logout = useCallback(async(userId) => {
        try {
            const accessToken = sessionStorage.getItem("accessToken");
            if(accessToken) {   // accessToken이 존재할 경우 로그아웃 수행
                const response = await axios.post(`http://${BASE_URL}/api/user/logout`, {userId: userId});
                if(response.status === 200) {
                    sessionStorage.removeItem("accessToken");
                    sessionStorage.removeItem("schoolCode");
                    setUser(null);
                    navigate("/");
                }
            }
        }catch(error) {
            console.log("로그아웃 요청 중 ERROR", error);
        }
    }, [navigate]);
        
    useEffect(() => {
        getUser();

        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if(error.response && (error.response.status === 401 || error.response.status === 403)) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };

        // const fetchUser = async () => {
        //     await getUser();
        // };

        // fetchUser();
    }, [getUser, logout]);

    return (
        <UserContext.Provider value={{ user, login, logout, getUser, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};