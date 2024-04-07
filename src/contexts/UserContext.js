import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // useEffect(() => {
    //     const isLoggedIn = !!user;
    //     const isRequestPath = window.location.pathname.startsWith('/meorla/request/');
    //     debugger
    //     if(!isLoggedIn && window.location.pathname !== '/' && !isRequestPath) {
    //         navigate('/');
    //     }
    // }, [user, navigate]);
    
    const getUser = useCallback(async () => {
        try {
            const accessToken = sessionStorage.getItem("accessToken");

            if(!accessToken) return;
            
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
                schoolCode: decoded.schoolCode,
                schoolAddress: decoded.schoolAddress,
                commonPassword: decoded.commonPassword,
                workStatus: decoded.workStatus,
                bedCount: decoded.bedCount
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
    }
        
    useEffect(() => {
        const fetchUser = async () => {
            await getUser();
        };

        fetchUser();
    }, [getUser]);

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
                bedCount: userData.bedCount
            });
        } catch (error) {
            console.error("로그인 처리 중 ERROR", error);
            navigate("/");
        }
    };

    const logout = async(userId) => {
        try {
            const accessToken = sessionStorage.getItem("accessToken");
            if(accessToken) {   // accessToken이 존재할 경우 로그아웃 수행
                const response = await axios.post('http://localhost:8000/user/logout', {userId: userId});
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
    };

    return (
        <UserContext.Provider value = {{ user, login, logout, getUser, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};