import CustomButton from "../components/customButton";
import router from "../AppRoutes";
import CustomDocumentForm from "../forms/customDocumentForm";
import { useState } from "react";
import Icons from "../icons/icons";
import { fetchStudents } from "../api/api";
import { createPdf } from "../api/api";
import { useAppContext  } from "../contexts/AppContext/AppContextProvider";
import CustomSelect from "../components/customSelect";
import { docTitle } from "../Consts";

function DocumentsList() {
    const context = useAppContext()
    const [selectedGroup, setSelectedGroup] = useState(context.groups[0] || null)
    const [pdfUrl, setPdfUrl] = useState(null)

    const handleSubmit = (e) => {
        const selectedFields = {
            name: {label: "Имя", value: "name"},
            lastname: {label: "Фамилия", value: "lastname"},
            patronymic: {label: "Отчество", value: "patronymic"},
            birth_date: {label: "Дата рождения", value: "birth_date"},
        }
        const filtersData = {0: {field: "group", statement:"exact", compare_to:selectedGroup.id}}
        const user = `${context.userObject.lastname} ${context.userObject.name[0]}. ${context.userObject.patronymic[0]}.`
        const a = fetchStudents({fields: selectedFields, filters: filtersData}).then(res => {
            createPdf(res, selectedGroup.name, docTitle, user).then(blob => {
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
              });
        })
        
    }
    return (
    <div className="app-body" style={{flexDirection:"row"}}>
            <div style={{width:"auto", flexGrow:"1"}}>
                <div className="body-header" style={{justifyContent:"space-between"}}>
                    <h1 className="header1">Документы</h1>
                    <CustomButton destination="custom" className="primary" text="Создать свой отчет" 
                    onClick={() => router.navigate("custom", {replace:false})}></CustomButton>
                </div>

                <div style={{display:"flex", flexDirection:"column",marginTop:"20px", width:"200px", marginBottom:"20px"}}>
                    <span className="body6 semi-transparent">Номер группы</span>
                    <CustomSelect onChange={(e) => {setSelectedGroup(context.groups.filter(item => item.id == e.target.value)[0])}}
                        values={context.groups.map(gr => {return {label:gr.name, value: gr.id}})}/>
                </div>

                <div className="body5" style={{width:"100%", backgroundColor:"var(--grey2)", display:"flex", gap:"2px", flexDirection:"column"}}>
                                        <div onClick={handleSubmit} style={{backgroundColor:"white", margin:"0", padding:"10px", display:"flex", alignItems:"center", justifyContent:"space-between"}}><p>Отчет об индивидуальной работе со студентами</p>
                    <svg fill="var(--dark-blue)" width="32px" height="32px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M512 666.5L367.2 521.7l36.2-36.2 83 83V256h51.2v312.5l83-83 36.2 36.2L512 666.5zm-204.8 50.3V768h409.6v-51.2H307.2z"></path></g></svg>
                    </div>
                    
                    <div onClick={handleSubmit} style={{backgroundColor:"white", margin:"0", padding:"10px", display:"flex", alignItems:"center", justifyContent:"space-between"}}><p>Состав академической группы</p>
                    <svg fill="var(--dark-blue)" width="32px" height="32px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M512 666.5L367.2 521.7l36.2-36.2 83 83V256h51.2v312.5l83-83 36.2 36.2L512 666.5zm-204.8 50.3V768h409.6v-51.2H307.2z"></path></g></svg>
                    </div>
                </div>
            </div>

            {pdfUrl ? (
                <embed src={pdfUrl + '#zoom=FitH'} type="application/pdf" style={{minWidth:"50vw", flexGrow:"2"}} />
            ) : (
                <div style={{textAlign:"center", display:"flex", flexDirection: "column", justifyContent:"center",
                    borderRadius:"10px", backgroundColor:"var(--grey1)", padding:"20px"
                }}>
                    <h2 className="header4">Здесь будет доступен ваш документ</h2>
                    <p className="body5">Выберите номер группы для формирования отчета,<br/>а потом нажмите на иконку напротив нужного документа</p>
                </div>
            )}
    </div>)
}

function CustomDocument() {
    const [pdfUrl, setPdfUrl] = useState(null);

    return (
        <div className="app-body" style={{flexDirection:"row"}}>
            <div style={{width:"auto", flexGrow:"2"}}>
                <div className="body-header" style={{gap:"10px"}}>
                    <CustomButton style={{padding:"5px"}} onClick={() => router.navigate(-1)} className="transparent"
                    icon={<Icons name="chevronLeft" size={24} color="var(--dark-blue)" className="big"/>}/>
                    <h1 className="header1">Свой отчет</h1>
                </div>
    
                <CustomDocumentForm setPdfUrl={setPdfUrl}/>
            </div>

            {pdfUrl ? (
                <embed src={pdfUrl + '#zoom=FitW'} type="application/pdf" style={{width:"40wv", flexGrow:"1"}} />
            ) : (
                <div style={{textAlign:"center", display:"flex", flexDirection: "column", justifyContent:"center",
                    borderRadius:"10px", backgroundColor:"var(--grey1)", padding:"20px"
                }}>
                    <h2 className="header4">Здесь будет доступен ваш документ</h2>
                    <p className="body5">Выберите необходимые поля и условия, а потом нажмите "Сформировать отчет"</p>
                </div>
            )}
        </div>
    )
}

export {DocumentsList, CustomDocument}