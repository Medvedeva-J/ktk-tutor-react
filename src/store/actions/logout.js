import axios from "axios";
import { baseUrl } from "../../Consts";
import { isResponseOk } from "../../layouts/auth/useLogin";
import router from "../../AppRoutes";

export async function logout () {
    axios.get(baseUrl + "logout", { withCredentials: true })
    .then((res) => {
      isResponseOk(res)
      router.navigate('/login')
    })
    .catch(err => console.error(err));
}