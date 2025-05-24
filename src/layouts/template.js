import React, { useContext, useEffect } from "react";
import SideBar from "../components/sideBar";
import CustomButton from "../components/customButton";
import router from "../AppRoutes";
import { UserContext } from "../App";

export default function Template({
    content = <div style={{display:"flex", flexDirection:"column", gap:"20px", margin:"auto", alignItems:"center"}}>
        <h2>Страница не найдена</h2>
        <CustomButton className="primary" text="На главную" onClick={() => router.navigate("/students", {replace:false})}/>
    </div>
}) {
    const context = useContext(UserContext)
    useEffect(() => {
        if (context.user == null) {
            content = "Вы не авторизованы"
        }
    }, [context.user])

    return (
        <div className="App">
            <SideBar/>
            {content}
        </div>
    )
}