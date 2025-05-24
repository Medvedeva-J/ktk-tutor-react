import React, { useState, useEffect, useContext } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import CustomToggleGroup from '../components/customToggleGroup';
import {StudentProfile} from "./studentProfile/studentProfile";
import CustomButton from '../components/customButton';
import { fetchGroups, fetchMajor, fetchStudents } from "../api/api";
import router from "../AppRoutes";
import { useAppContext } from "../contexts/AppContext/AppContextProvider";

export default function Students() {
    return (
        <>
        <Routes>
                <Route path="student/:id" element={<StudentProfile/>} />
                <Route path="" element={StudentsList()} />
        </Routes></>
    )
}

function StudentsList() {
    const context = useAppContext()
    
    const [students, setStudents] = useState([])
    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState("")
    const [majorName, setMajorName] = useState(null)

    async function setupGroups(){
        const grouplist = await fetchGroups(context.user);
        setGroups(grouplist)
        const group = grouplist[0]
        setSelectedGroup(group)
        let major = group? await fetchMajor(group.major) : null
        setMajorName(major?.name)
    }
    
    async function setupStudents(group){
        const students = group ? await fetchStudents({"group": group.id}): [];
        setStudents(
            students
        );
    }

    useEffect(() => {
         if (context.user != null){
            setupGroups();
        }
    }, [context.user])

    useEffect(() => {
        setupStudents(selectedGroup)
    }, [selectedGroup])

    const handleChange = (event, newValue) => {
        if (newValue != null) {
            setSelectedGroup(groups.filter((item) => item.id == newValue)[0])
        }
    }

    return (
        <div className="app-body">
            <h1 className="header1" style={{whiteSpace:"nowrap"}}>Мои студенты</h1>

            { groups?.length > 0 ?
                (<div style={{display:"flex", flexDirection:"column", height:"100%", width:"auto"}}>
                    
                    <CustomToggleGroup value={selectedGroup.id} data={groups} exclusive onChange={handleChange}/>
                    <div className="several-pages-body">
                        <div style={{display:"flex", gap:"20px", justifyContent:"space-between", alignItems:"baseline"}}>
                            <h2 style={{margin:"0"}} className="body2">{selectedGroup.name}</h2>
                            <h3 style={{margin:"0", whiteSpace:"nowrap"}} className="body5">{majorName}</h3>
                        </div>

                        { students.length > 0?
                            <div className="body5" style={{width:"100%", backgroundColor:"var(--grey2)", display:"flex",
                                gap:"2px", flexDirection:"column", borderRadius:"10px", overflow:"clip"}}>
                                    {students.filter((student) => student.group == selectedGroup.id).map((student, i) => (
                                        <CustomButton onClick={() => router.navigate(`/student/${student.id}`, {replace:false, data:student})} 
                                        text={`${student.lastname} ${student.name} ${student.patronymic}`} className="list-item"/>
                                    ))}
                            </div> :
                            <span className="body6 semi-transparent">В данной группе нет студентов</span>
                        }
                    </div>
                </div>)
                
                : (<p>Вам не назначено академических групп</p>) 
            }
        </div>
    )
}