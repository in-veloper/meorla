import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const getUser = useCallback(async() => {
        try {
            const accessToken = sessionStorage.getItem("accessToken");
            if(accessToken) {
                const response = await axios.get('http://localhost:8000/token', {
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
                    schoolCode: decoded.schoolCode
                };
    
                setUser(userInfo);
                return userInfo;
            }
        }catch(error) {
            if(error.response) {
                sessionStorage.removeItem("accessToken");
                if(error.response.status !== 200) {
                    navigate("/");
                }
            }
        }
    }, [navigate]);
        
    useEffect(() => {
        const fetchUser = async () => {
            await getUser();
        }
        if(!user) {
            fetchUser();
        }
    }, [user, getUser]);

    const login = async (userData, accessToken) => {
        try {
            sessionStorage.setItem("accessToken", accessToken);
            sessionStorage.setItem("schoolCode", userData.schoolCode);
            setUser({
                userId: userData.userId,
                name: userData.name,
                email: userData.email,
                schoolName: userData.schoolName,
                schoolCode: userData.schoolCode
            });
        } catch (error) {
            if (error.response) {
                if (error.response.status !== 200) {
                    navigate("/");
                }
                console.log("UserContext 로직 수행 중 ERROR", error);
            }
        }
    };

    const logout = async(userId) => {
        try {
            const response = await axios.post('http://localhost:8000/user/logout', {userId: userId});
            if(response.status === 200) {
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("schoolCode");
                setUser(null);
                navigate("/");
            }
        }catch(error) {
            console.log("로그아웃 요청 중 ERROR", error);
        }
    };

    return (
        <UserContext.Provider value = {{ user, login, logout, getUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};