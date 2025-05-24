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
  const [csrf, setCsrf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
        getSession()
    }, [])

    const getCsrf = () => {
      axios.get(baseUrl + 'csrf/', { withCredentials: true })
      .then(async (res) => {
          isResponseOk(res)

          const csrfToken = res.headers.get('X-CSRFToken')
          setCsrf(csrfToken)
      })
      .catch((err) => console.error(err))
  }

    const getSession = () => {
      axios.get(baseUrl + "session/", { withCredentials: true })
      .then((res) => {
        setLoading(false)
          if (res.data.isAuthenticated) {
              setUser(res.data.user_id)
              return
          }
          getCsrf()
      })
      .catch(err => console.error(err))
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
        user: user, setUser: setUser, csrf:csrf, setCsrf:setCsrf}}>
          <RouterProvider router={router}/>
      </UserContext.Provider>
    )
  );
}

export default App
