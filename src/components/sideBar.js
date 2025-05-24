import CustomButton from "./customButton"
import router from "../AppRoutes"

import { useAppContext } from "../contexts/AppContext/AppContextProvider"

export default function SideBar() {
    const context = useAppContext()
    return ( 
        <div className="sidenav shadow">
            <CustomButton text="Личный кабинет" onClick={() => router.navigate("/profile", {replace:false})} className='transparent'></CustomButton>
            <div style={{flex:"1"}}>
                <CustomButton text="Студенты" onClick={() => router.navigate("/students", {replace:false})} className='transparent'></CustomButton>
                <CustomButton text="Документы" onClick={() => router.navigate("/documents", {replace:false})} className='transparent'></CustomButton>
                <CustomButton text="Календарь" onClick={() => router.navigate("/calendar", {replace:false})} className='transparent'></CustomButton>
            </div>
            <CustomButton text="Выйти" onClick={context.logout} className='transparent'></CustomButton>
        </div>
    )
}
