import './App.css';
import'./Variables.css';
import React, { useState, useEffect } from "react";
import { RouterProvider } from 'react-router-dom';
import { baseUrl } from './Consts';
import axios from 'axios';
import router from './AppRoutes'
import Icons from './icons/icons';
import { isResponseOk } from './layouts/auth/useLogin';



export const UserContext = React.createContext()

function App() {
  const [user, setUser] = useState(null);
  const [csrf, setCsrf] = useState(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession()
}, [])

const isResponseOk = (res) => {
  if (!(res.status >= 200 && res.status <= 299)) {
    throw Error(res.statusText);
  }
}

const getCSRF = () => {
    axios.get(baseUrl + 'csrf/', { withCredentials: true })
    .then((res) => {
        isResponseOk(res)

        const csrfToken = res.headers.get('X-CSRFToken')
        setCsrf(csrfToken)
    })
    .catch((err) => console.error(err))
}

const getSession = () => {
  axios.get(baseUrl + "session/", { withCredentials: true })
  .then((res) => {
      if (res.data.isAuthenticated) {
          setUser(res.data.user_id)
          return
      } else {
        router.navigate('/students')
      }
      getCSRF()
  })
  .catch(err => console.error(err))
}

// Полученный CSRF-токен пихаем в заголовок и отправляем серверу
const login = (loginData) => {
  const data = { username: loginData.email, password: loginData.password }
  axios.post(baseUrl + "login/", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrf,
    }
  })
  .then((res) => {
    isResponseOk(res)
    
    userInfo()
  })
  .catch((err) => {
    console.error(err);
    setIsError("Неверные данные")
  });
}

const userInfo = () => {
  axios.get(baseUrl + "user_info/", {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((res) => {
    console.log("Вы авторизованы как: " + res.data.id);
    setUser(res.data.id)
  })
  .catch((err) => {
      if (err.status === 401) console.log(err.error);
  });
}


  return (
    loading ? (
      <div
      style={{justifyContent:"center", position:"absolute", margin:"auto", display:"flex", flexDirection:"column", alignItems:"center",
        top:"0", bottom:"0", right:"0", left:"0"
      }}>
        <Icons name="loading" className='rotate'/>
        <p>Загрузка</p>
      </div>
    ) : (
    <UserContext.Provider value={{ 
        user: user, setUser: setUser}}>
          <RouterProvider router={router}/>
      </UserContext.Provider>
    )
  );
}

export default App
