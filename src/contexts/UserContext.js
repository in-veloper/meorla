// import React, { createContext, useState } from 'react';
// import  { useNavigate } from 'react-router-dom';
// import jwt_decode from 'jwt-decode';
// import axios from 'axios';

// export const UserContext = createContext();

// const UserStore = (props) => {
//     const [user, setUser] = useState(null);

//     const getUser = async() => {
//         try {
//             const response = await axios.get('http://localhost:8000/token');
//             const decoded = jwt_decode(response.data.accessToken);

//             setUser({
//                 userId: decoded.userId,
//                 userName: decoded.userName,
//                 schoolName: decoded.schoolName
//             });
//         }catch(error) {
//             if(error.response) {
//                 // useNavigate("/");
//                 console.log("UserContext 로직 수행 중 ERROR" + error);
//             }
//         }
//     }

//     if(!user) {
//         getUser();
//     }

//     return (
//         <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
//     );
// }

// export default UserStore;





import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

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