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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
        getSession()
    }, [])

    const getSession = () => {
      axios.get(baseUrl + "session/", { withCredentials: true })
      .then((res) => {
        setLoading(false)
        console.log(res)
          if (res.data.isAuthenticated) {
              setUser(res.data.user_id)
              return
          } else {
            setUser(null)
            return
          }
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
        user: user, setUser: setUser}}>
          <RouterProvider router={router}/>
      </UserContext.Provider>
    )
  );
}

export default App
