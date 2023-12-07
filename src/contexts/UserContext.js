import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // useEffect(() => {
        const getUser = async() => {
            try {
                const response = await axios.get('http://localhost:8000/token');
                const decoded = jwtDecode(response.data.accessToken);
    
                setUser({
                    userId: decoded.userId,
                    name: decoded.name,
                    email: decoded.email,
                    schoolName: decoded.schoolName,
                    schoolCode: decoded.schoolCode
                });
            }catch(error) {
                if(error.response) {
                    if(error.response.status === 401) {
                        navigate("/");
                    }
                    console.log("UserContext 로직 수행 중 ERROR", error);
                }
            }
        }
        
    useEffect(() => {
        // if(!user) {
            getUser();
        // }
    }, []);

    const login = async (userData) => {
        setUser(userData);
    
        try {
            // 로그인 시 서버로부터 토큰을 받아옴
            const response = await axios.post('http://localhost:8000/login', userData);
            const accessToken = response.data.accessToken;
    
            // 토큰을 사용하여 사용자 정보를 가져오기
            const userResponse = await axios.get('http://localhost:8000/token', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const decoded = jwtDecode(userResponse.data.accessToken);
    
            setUser({
                userId: decoded.userId,
                name: decoded.name,
                email: decoded.email,
                schoolName: decoded.schoolName,
                schoolCode: decoded.schoolCode
            });
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
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
                setUser(null);
                navigate("/");
            }
            console.log(response);
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