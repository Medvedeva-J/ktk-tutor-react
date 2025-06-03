import React, { useContext, useEffect, useState } from "react";
import CustomButton from "../components/customButton";
import CustomInput from "../components/customInput";
import router from "../AppRoutes";
import { useFieldChange } from "../hooks/useFieldChange";
import { isResponseOk } from "../layouts/auth/useLogin";
import { baseUrl } from "../Consts";
import axios from "axios";
import { UserContext } from "../App";
import { useAppContext } from "../contexts/AppContext/AppContextProvider";

export default function LoginForm(props) {
  const context = useAppContext()

  const [error, setError] = useState(null)
  const [logInData, setLogInData] = useState({email: "", password: ""})


  const login = (loginData) => {
  const data = { email: loginData.email, password: loginData.password }
  axios.post(baseUrl + "login/", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": context.csrf,
    }
  })
  .then((res) => {
    isResponseOk(res)
    userInfo()
  })
  .catch((err) => {
    console.error(err);
    console.log("Неверные данные")
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
    context.setUser(res.data.id)
    router.navigate("/students")
  })
  .catch((err) => {
      if (err.status === 401) console.log(err.error);
  });
}

  async function handleSubmit(e) {
    e.preventDefault();
    try {
        const res = login(logInData); 
    } catch (e) {
        const err = e.response ? e.response.data.detail : "Произошла ошибка"; 
        setError(err);
    }
}

  const handleChange = useFieldChange(setLogInData)

  return(
    <form className="login-form">
        <h1 className="header1" style={{textAlign:"center"}}>Вход</h1>

        <CustomInput
        placeholder="E-mail" 
        type="text" 
        name="login" 
        id="login" 
        value={logInData.email}
        onChange={handleChange('email')}    
        />

        <CustomInput
        placeholder="Пароль"
        type="password" 
        name="password" 
        id="password" 
        value={logInData.password}
        onChange={handleChange('password')}  
        />

        <CustomButton className="primary" style={{justifyContent:"center", width:"400px"}} text='Войти' onClick={handleSubmit}  />

        { error? <p className="error body6">Ошибка входа</p>: null}
      </form>
  )
}
