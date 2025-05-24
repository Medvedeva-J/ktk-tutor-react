import './App.css';
import'./Variables.css';
import React, { useState, useEffect } from "react";
import { RouterProvider } from 'react-router-dom';
import { baseUrl } from './Consts';
import axios from 'axios';
import router from './AppRoutes'
import Icons from './icons/icons';
import { AppContextProvider, useAppContext } from './contexts/AppContext/AppContextProvider';


function App() {
  const context = useAppContext()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    context.getSession().then((res) => setLoading(false))
}, [context.user])

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
      <RouterProvider router={router}/>
    )

  );
}

export default App
