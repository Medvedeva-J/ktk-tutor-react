import { CustomCalendar, useCalendar } from '../components/customCalendar'
import CustomInput from '../components/customInput'
import { eventFormFields, monthsGenitiveCase } from '../Consts'
import CustomButton from '../components/customButton'
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../components/Modal';
import { deleteEvent, putEvent, postEvent, fetchEvents, fetchGroups, fetchStudents, getEmptyInstance, createEventsPdf, fetchFilteredEvents } from '../api/api';
import CustomSelect from '../components/customSelect';
import { useFieldChange } from '../hooks/useFieldChange';
import Icons from '../icons/icons';
import SelectWithInput from '../components/SelectWithInput';

import { useAppContext } from '../contexts/AppContext/AppContextProvider';
import { format } from 'date-fns';



export function Calendar(props) {
    const context = useAppContext()
    const useC = useCalendar(props.date ?? new Date(), props.locale | "default")
    const [selectedDay, setSelectedDay] = useState(props.date ?? new Date())
    const targetRef = useRef(null);
    const elementRef = useRef(null);

    const [events, setEvents] = useState([])
    const [eventData, setEventData] = useState(null)
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [errors, setErrors] = useState(null)
    const [emptyEvent, setEmptyEvent] = useState(null)
    const [filters, setFilters] = useState({
        from: null,
        until: null,
        type: "all",
        group: "all"
    })

    const handleChange = useFieldChange(setEventData)
    const handleFiltersChange = useFieldChange(setFilters)

    let formFields = {...eventFormFields}

    useEffect(() => {
        async function getEmptyEvent() {
            await getEmptyInstance("Event").then(result => {
                result.group = Object.keys(formFields.group.values)[0]
                setEmptyEvent(result)
                setEventData(result)
                return result
            })
        }
        setupGroups()
        setupEvents()
        getEmptyEvent()
    }, [])

    useEffect(() => {
        if (targetRef.current && elementRef.current) {
          elementRef.current.style.height = `${targetRef.current.offsetHeight}px`;
        }
      }, [targetRef, elementRef]);


    async function setupGroups() {
        try {
            await fetchGroups(context.user).then(result => {
                let list = {}
                result?.map(item => {
                    list[item.id] = {
                        label: item.name
                    }
                })
                formFields.group.values = list
                setupStudents()
            })
        } catch (error) {
            console.log(error)
        }
    }

    async function setupStudents(){
        let students = []
        let promises = Object.keys(formFields.group.values).map(async (id) => {
            const response = await fetchStudents({"group": id})
            response.forEach((student) => {
                    students.push({
                        value: student.id,
                        label: `${student.lastname} ${student.name} ${student.patronymic}`
                    })
                }) 
        })
        await Promise.all(promises)
        formFields.student.values = students
    }

    async function setupEvents(){   
        const events = await fetchEvents(useC.selectedYear, useC.selectedMonth.monthIndex + 1);
        setEvents(
            events
        )
    }

    useEffect(() => {
        setupEvents()
    }, [useC.selectedMonth])

    const closeModal = () => {
        setEventData(emptyEvent)
        setModalIsOpen(false)
        setErrors(null)
    }

    const submitEventFilters = async () => {
        const finalFilters = []
        
        if (filters.group != "all") {
            finalFilters.push({field: "group", statement: "exact", compare_to:filters.group})
        }
        if (filters.type != "all") {
            finalFilters.push({field: "event_type", statement: "exact", compare_to:filters.type})
        }
        if (filters.until != null && filters.until != "") {
            finalFilters.push({field: "date", statement: "lt", compare_to:filters.until})
        }
        if (filters.from != null && filters.from != "") {
            finalFilters.push({field: "date", statement: "gt", compare_to:filters.from})
        }

        const user = `${context.userObject.lastname} ${context.userObject.name[0]}. ${context.userObject.patronymic[0]}.`
        const a = fetchFilteredEvents({filters: finalFilters}).then(res => {
            createEventsPdf(res, user).then(blob => {
                const url = URL.createObjectURL(blob);
                window.open(url);
              });
        })
    }

    const submitForm = async (isDel) => {
        let method;
    
        if (isDel) {
            method = "DELETE";
        } else if (eventData.id) {
            method = "PUT";
        } else {
            method = "POST";
        }
    
        try {
            if (method === "POST") {
                await postEvent(eventData);
            } else if (method === "PUT") {
                await putEvent(eventData);
            } else if (method === "DELETE") {
                await deleteEvent(eventData.id);
            }
    
            closeModal();
            setupEvents()
        } catch (err) {
            const data = await err
            setErrors(data.errors)         
        }
        
    };
    

  return (
    <div className="app-body" id="calendar">
        <div style={{display:"flex", flexGrow:"1", gap:"40px", boxSizing:"border-box", height:"fit-content"}}>
            <CustomCalendar emptyEvent={emptyEvent} ref={targetRef} callback={setSelectedDay} setModalIsOpen={setModalIsOpen} setEventData={setEventData} events={events} useC={useC}/>

            <div ref={elementRef} className='calendar-side-menu'>
                <div className='selected-day-menu shadow'>
                    <span className='header5'>{useC.selectedDay.day} {monthsGenitiveCase[useC.selectedDay.monthIndex]} {useC.selectedDay.year}</span>
                    <div>
                        { events.filter((item, i) => datesAreEqual(item.date, useC.selectedDay.date)).map((item, i) => (
                            <div className='event-item body5' onClick={() => {
                                setEventData(item)
                                setModalIsOpen(true)
                            }}>
                                <span>{item.name}</span>
                                <span>{item.time.slice(0, -3)}</span>
                            </div>
                            ))
                        }
                    </div>
                    <CustomButton onClick={() => setModalIsOpen(true)} className="primary body6" text="Создать мероприятие"/>
                </div>

                <div className='events-filters-menu shadow'>
                    <span className='header5'>Отчет по мероприятиям</span>
                    
                    <div style={{justifySelf:"stretch", display:"flex", flexDirection:"column", gap:"10px"}}>
                        <div style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
                            <div>
                                c
                                <CustomInput
                                    containerStyle={{flexGrow:1}} type="date"
                                    name="from" id="from" value={filters.from}
                                    onChange={handleFiltersChange("from")} />
                            </div>
    
                            <div>
                                по
                                <CustomInput
                                    containerStyle={{flexGrow:1}} type="date"
                                    name="until" id="until" value={filters.until}
                                    onChange={handleFiltersChange("until")} />
                            </div>
                        </div>

                        <div>
                            Группа 
                            <CustomSelect
                                style={{flexGrow:"1"}} values={{"all":{label:"Все"}, ...formFields.group.values}}
                                    name="group" 
                                    selected={filters.group}
                                    id={"group"} 
                                    value={filters.group}
                                onChange={(e) => {handleFiltersChange("group")(e.target.value)}} />
                        </div>

                        <div>
                            Тип 
                            <CustomSelect
                                style={{flexGrow:"1"}} values={{"null":{label:"Все"}, ...formFields.event_type.values}}
                                name="type" 
                                    selected={filters.group}
                                    id={"type"} 
                                    value={formFields.event_type.values[0]}
                                onChange={(e) => {handleFiltersChange("type")(e.target.value)}} />
                        </div>

                       
                    </div>

                    <CustomButton className="primary body6" onClick={submitEventFilters} text="Сформировать отчет"/>
                </div>
            </div>
        </div>

        { modalIsOpen ? 
                <Modal overlay
                style={{minWidth:"fit-content", width: "auto", maxWidth:"600px", flexGrow:"1"}}
                content={<ModalContent
                    eventData={eventData}
                    closeModal={closeModal}
                    formFields={formFields}
                    handleChange={handleChange}
                    submitFormCallback={submitForm}/>}/> :
            null
        }

        { errors ? 
            <Modal style={{zIndex:"10000", position:"fixed", right:"20px", bottom:"20px"}}
            content={
                <div>
                    {Object.keys(errors).map((key) => 
                    <p>
                        <span className='highlight'>{key}</span>
                        : {errors[key]}
                    </p>)}
                </div>
            }/> :
            null
        }
    </div>
  )
}

function ModalContent(props) {
    return (
        <div style={{display:"flex", flexDirection:"column", gap:"20px", padding:"10px"}}>
            <div className='modal-header'>
                <h2 className='header3'>
                    {props.eventData?.id ? "Редактировать мероприятие" : "Создать мероприятие"}
                    </h2>
                <div onClick={props.closeModal}>
                    <Icons name="cross"/>
                </div>
            </div>

            <div style={{display:"flex", flexDirection:"column", justifyItems:"stretch", gap:"10px"}}>
                {Object.keys(props.eventData).filter(key => !(["id", "verbose"].includes(key))).map(item => (
                    props.formFields[item].type == "select" ?
                    (
                        <CustomSelect
                        style={{flexGrow:"1"}}
                        values={props.formFields[item].values}
                        placeholder={props.eventData.verbose[`${item}_verbose`]}
                        type={props.formFields[item].type}
                        selected={item}
                        id={item} 
                        value={props.eventData[item]}
                        onChange={(e) => {props.handleChange(item)(e.target.value)}}/> 
                    ) : (
                    props.formFields[item].type == "input-select"? (
                        props.eventData.event_type == "IND" ?
                            <SelectWithInput
                            values={props.formFields[item].values}
                            placeholder={props.eventData.verbose[`${item}_verbose`]}
                            name={item}
                            id={item} 
                            value={props.eventData[item]}
                            handleChange={props.handleChange(item)}
                            /> : null) :
                        <CustomInput
                        containerStyle={{width:"auto"}}
                        type={props.formFields[item].type}
                        name={item} 
                        id={item} 
                        maxlength={props.formFields[item].max_length}
                        value={props.eventData[item]}
                        defaultChecked={props.eventData[item]}
                        onChange={props.handleChange(item)} />
                        )
                    )
                )}
            </div>

            <div style={{display:"flex", gap:"10px"}}>
                    <CustomButton onClick={() => props.submitFormCallback(false)} className="primary" text="Сохранить"/>

                    { props.eventData.id ? (
                        <div style={{display:"flex", flexGrow:"1", justifyContent:"space-between"}}>
                            <CustomButton onClick={() => {
                                props.closeModal()
                            }} className="secondary" text="Отменить"/>
                            <CustomButton onClick={() => props.submitFormCallback(true)} className="red-button" text="Удалить"/>
                        </div>
                        ) : null
                    }
            </div>
        </div>
    )
}

export const datesAreEqual = (date1, date2) => {
    date1 = new Date(date1)
    return (date1.setHours(0, 0, 0, 0) === date2.setHours(0, 0, 0, 0))
}