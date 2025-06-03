import React from "react";
import { useState } from "react";
import { baseUrl } from "../../Consts";
import router from "../../AppRoutes";
import axios from "axios";
import { fetchGroups, fetchTutor } from "../../api/api";


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
    const [userObject, setUserObject] = useState(props.userObject || null);
    const [csrf, setCsrf] = useState(props.csrf || null);
    const [groups, setGroups] = useState(props.groups || null);
    
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
              const userData = {...await fetchTutor(res.data.user_id), ...res.data}

              setUser(res.data.user_id)
              setUserObject(await fetchTutor(res.data.user_id))
              setGroups(await fetchGroups(res.data.user_id))
                
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
          router.navigate('/login')
          getCSRF();
        })
        .catch(err => console.error(err));
      }
  
    return {
      user,
      setUser,
      userObject,
      setUserObject,
      csrf, 
      setCsrf,
      groups,
      setGroups,
      getSession,
      isResponseOk,
      getCSRF,
      logout
    };
  }