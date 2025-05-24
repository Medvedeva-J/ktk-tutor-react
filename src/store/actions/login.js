
import { baseUrl } from "../../Consts";
import axios from "axios";
import { isResponseOk } from "../../layouts/auth/useLogin";
import { getCsrf } from "./getCsrf";

export async function login (context, logInData,) {
	try {
    console.log(context.csrf)
		const data = { email: logInData.email, password: logInData.password }
		await fetch(baseUrl + "login/", {
      method:"POST",
			credentials: "include",
			headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": context.csrf,
			},
      body:JSON.stringify(data)
		})
		.then((res) => {
			isResponseOk(res)
			context.setUser(res.data.id)
			userInfo()
		})
	} catch (error) {
		throw error
	}
}

const userInfo = () => {
    axios.get(baseUrl + "user_info/", {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      console.log(res)
      console.log("Вы авторизованы как: " + res.data.id);
    })
    .catch((err) => {
        console.log(err.error);
    });
  }
