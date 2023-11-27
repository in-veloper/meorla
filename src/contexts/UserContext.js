import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
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
                    console.log("UserContext 로직 수행 중 ERROR", error);
                }
            }
        }
        if(!user) {
            getUser();
        }
    // }, [user]);


    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value = {{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};