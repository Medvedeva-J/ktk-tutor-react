import React from "react";
import { useState } from "react";
import { baseUrl } from "../../Consts";
import router from "../../AppRoutes";
import axios from "axios";


const Context = React.createContext(null);
export const AppContextProvider = ({ children, ...props }) => {
    const context = useCreateAppContext(props);
    return <Context.Provider value={context}>{children}</Context.Provider>;
  };

  export function useAppContext() {
    const context = React.useContext(Context);
    if (!context) throw new Error('Use app context within provider!');
    return context;
  }

  export const useCreateAppContext = function(props) {
    const [user, setUser] = useState(props.user || null);
    const [csrf, setCsrf] = useState(props.csrf || null);
    
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
              return csrfToken
          })
          .catch((err) => console.error(err))
      }
      
      const getSession = async () => {
        return await axios.get(baseUrl + "session/", { withCredentials: true })
        .then(async (res) => {
            if (res.data.isAuthenticated) {
                setUser(res.data.user_id)
            } else {
              router.navigate('/login')
            }
            getCSRF()
            return
        })
        .catch(err => console.error(err))
      }

      const logout = () => {
        axios.get(baseUrl + "logout/", { withCredentials: true })
        .then((res) => {
          isResponseOk(res)
          setUser(null)
          getCSRF();
        })
        .catch(err => console.error(err));
      }
  
    return {
      user,
      setUser,
      csrf, 
      setCsrf,
      getSession,
      isResponseOk,
      getCSRF,
      logout
    };
  }