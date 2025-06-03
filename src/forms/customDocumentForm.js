import React, { useEffect, useId, useState } from "react";
import CustomButton from "../components/customButton";
import { useFieldChange } from "../hooks/useFieldChange";
import DocumentFilterComponent from "../components/DocumentFilterComponent";
import CustomMultiSelect from "../components/customMultiSelect";
import { createPdf, fetchStudents } from "../api/api";
import CustomInput from "../components/customInput";
import CustomSelect from "../components/customSelect";
import { useAppContext } from "../contexts/AppContext/AppContextProvider";

const statementFields = {
    name: {label: "Имя", value: "name"},
    lastname: {label: "Фамилия", value: "lastname"},
    patronymic: {label: "Отчество", value: "patronymic"},
    age: {label: "Возраст", value: "age"},
    gender: {label: "Пол", value: "gender"},
}

export default function CustomDocumentForm(props) {
    const documentFields = {
        name: {label: "Имя", value: "name"},
        lastname: {label: "Фамилия", value: "lastname"},
        patronymic: {label: "Отчество", value: "patronymic"},
        birth_date: {label: "Дата рождения", value: "birth_date"},
        group: {label: "Группа", value: "group"},
        gender: {label: "Пол", value: "gender"},
        age: {label: "Возраст", value: "age"},
        email: {label: "E-mail", value: "email"},
        phone: {label: "Телефон", value: "phone"},
        is_disabled: {label: "Является ли инвалидом", value: "is_disabled"},
        disability_group: {label: "Группа инвалидности", value: "disability_group"},
        disability_category: {label: "Категория инвалидности", value: "disability_category"},
    }

    const [title, setTitle] = useState("")

    const context = useAppContext()
    const [selectedGroup, setSelectedGroup] = useState(context.groups[0] || null)

    const [filtersData, setFiltersData] = useState({})
    const [children,setChildren] = useState([]);
    const [nextId,setnextId] = useState(0);
    const [selectedFields, setSelectedeFields] = useState([])


    const handleChange = useFieldChange(setFiltersData)
   
    function handleSubmit(e) {
        e.preventDefault()
        const finalTitle = title.trim().length > 0 ? title : "Без названия" 
        const finalFilters = {...Object.values(filtersData).filter(val => val['compare_to'].trim().length > 0)}
        const finalFields = selectedFields.length > 0 ? selectedFields : ["name", "lastname", "patronymic"]
        finalFilters[nextId] = {field: "group", statement: "exact", compare_to:selectedGroup.id}
        const user = `${context.userObject.lastname} ${context.userObject.name[0]}. ${context.userObject.patronymic[0]}.`
        const a = fetchStudents({fields: finalFields, filters: finalFilters}).then(res => {
            console.log(res)
            createPdf(res, selectedGroup.name, finalTitle, user).then(blob => {
                const url = URL.createObjectURL(blob);
               props.setPdfUrl(url);
              });
        })
    }

    function addFilter(e) {
        e.preventDefault()
        setChildren(old => [...old, 
            <DocumentFilterComponent onChange={handleChange(nextId)} key={nextId} uniqid={nextId} name={Object.values(statementFields)[0].label} removeFilter={removeFilter} fields={statementFields}/>
        ])
        setnextId(nextId + 1)
    }

    function removeFilter(e, id) {
        e.preventDefault()
        setChildren(old => [...old.filter(item => item.key != id)])
    }
  return (
    <form style={{display:"flex", flexDirection:"column", gap:"40px", width:"100%"}}>
        <div style={{display:"flex", alignItems:"end", gap:"20px"}}>
            <div style={{display:"flex", flexDirection:"column",marginTop:"20px",}}>
                <span className="body6 semi-transparent">Номер группы</span>
                <CustomSelect onChange={(e) => {setSelectedGroup(context.groups.filter(item => item.id == e.target.value)[0])}}
                    values={context.groups.map(gr => {return {label:gr.name, value: gr.id}})}/>
            </div>
            <CustomInput containerStyle={{width:"auto", flexGrow:"1"}} onChange={(e) => {setTitle(e)}} placeholder={"Название отчета"}/>
        </div>

        <div style={{display:"flex", flexDirection:"column", width:"100%"}}>
                <h2 className="header5" style={{margin:"0",  whiteSpace:"nowrap"}}>Включить в отчет поля</h2>
                <CustomMultiSelect getSelectedCallback={setSelectedeFields} data={documentFields}/>
        </div>

        <div style={{display:"flex", flexDirection:"column", width:"100%"}}>
            <div style={{display:"flex", height:"fit-content", alignItems:"center", gap:"10px",boxSizing:"border-box"}}>
                <h2 className="header5" style={{margin:"0", whiteSpace:"nowrap"}}>Проверка значений</h2>
                <CustomButton onClick={(e) => addFilter(e)} style={{width:"fit-content", fontWeight:"800", fontSize:'12px'}} text="+"/>
            </div>

            <div>
                {children.map((child, key) => child)}
                </div>
           
        </div>

        <CustomButton type="submit" onClick={handleSubmit} className="primary" containerStyle={{alignSelf:"flex-end"}} text="Сформировать отчет"></CustomButton>

    </form>
    
  )
}
