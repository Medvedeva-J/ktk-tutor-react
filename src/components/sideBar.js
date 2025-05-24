import CustomButton from "./customButton"
import router from "../AppRoutes"
import { getCsrf, logout } from "../store/actions"
import { useContext } from "react"
import { UserContext } from "../App"

export default function SideBar() {
    const context = useContext(UserContext)
    return ( 
        <div className="sidenav shadow">
            <CustomButton text="Личный кабинет" onClick={() => router.navigate("/profile", {replace:false})} className='transparent'></CustomButton>
            <div style={{flex:"1"}}>
                <CustomButton text="Студенты" onClick={() => router.navigate("/students", {replace:false})} className='transparent'></CustomButton>
                <CustomButton text="Документы" onClick={() => router.navigate("/documents", {replace:false})} className='transparent'></CustomButton>
                <CustomButton text="Календарь" onClick={() => router.navigate("/calendar", {replace:false})} className='transparent'></CustomButton>
            </div>
            <CustomButton text="Выйти" onClick={() => {logout().then(async (res) => {
                context.setUser(null)
                const csrf = await getCsrf()
            })}} className='transparent'></CustomButton>
        </div>
    )
}