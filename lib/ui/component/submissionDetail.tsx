import styled, { keyframes } from "styled-components"
import {
    useState,
    Fragment,
    useEffect,
} from "react"


import { FiChevronDown } from "react-icons/fi"
import { SubmittedCodeElem } from "./codeElem"
import { AC, AW, TLE } from "../DefaultComponent"
const TabMain = styled.div`
width:calc(100% - 40px);
display: flex;
flex-direction: column;
padding: 0px 20px;
height: 100%;
overflow: auto;
`

const stringFromAnsState = (statud:string) =>{
    switch(statud){
        case "AC":
            return "맞았습니다"
        case "AW":
            return "틀렸습니다"
        case "CE":
            return "컴파일 에러"
        case "TLE":
            return "시간 초과"
        case "ISE":
            return "실행에 실패했습니다"
    }
}

const CodeHolder = styled.div`
display:flex;
width: 100%;
flex-direction: column;
flex-shrink: 0;
`
const ExtendControlBtn =styled.button<{isExtended:boolean}>`
    background-color: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -10px;
    color: ${props=>props.theme.Body.TextColorLevels[1]};
    &:hover {
        color: ${props=>props.theme.Body.TextColorLevels[0]};
    }
    & p{
        color: inherit;
        margin: 0;
        padding: 0;
        margin-right: 10px;
        font-size: 12px;
    }
    & svg {
        rotate: ${props=>props.isExtended?"180deg":"0deg"};
    }
`

const TestcaseHolder = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
`
const TestCase = styled.li`
    margin: 0;
    padding: 0;
    border-bottom: solid 1px ${props=>props.theme.Body.ContainerBgLevels[1]};
    padding: 7px 0px;
    font-size: 12px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    & p {
        margin: 0;
        font-size: 12px;
    }
    & div{
        display: flex;
        align-items: center;
        font-size: 14px;
        justify-content: space-between;
        margin-right: 5px;
        

    }
`

const TitleHolder = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
    margin-bottom: 15px;
    max-height: 40px;
    & h2 {
        margin: 0;
        display:flex;
        min-width: 125px;
        max-width:300px;
        justify-content: space-between;
    }
`

export const SubmissionDetail = (props:{elemId:string}) => {
    const [submissionData, setSubmissionData] = useState<any>()
    const [isCodeExtended, setCodeExtended] = useState(false)
    useEffect(()=>{
        if(typeof submissionData !== "undefined") {
            if(submissionData.prob!=props.elemId) {
                setSubmissionData(undefined)
            }
        }
        fetch(`/api/user/submission/${props.elemId}`,{ method: "GET", headers: { "Authorization": localStorage.getItem("tk") || "" }}).then((data)=>{
            return data.json()
        }).then((parsed)=>{
            setSubmissionData({...parsed[0],prob:props.elemId})
        })
    },[props.elemId])
    return (
        <TabMain>
            {typeof submissionData === "undefined"?
            <>로딩중</>
            :<>
            <TitleHolder>
            <h2>{submissionData["Status"]=="AC"?<AC />:submissionData["Status"]=="TLE"?<TLE />:<AW />}{stringFromAnsState(submissionData["Status"])}</h2>
            </TitleHolder>
            <TitleHolder>
            <h2>코드</h2>
            </TitleHolder>
            <CodeHolder>
            <SubmittedCodeElem lang={submissionData["Lang"]} data={submissionData["Code"]} isExtended={isCodeExtended}/>
            <ExtendControlBtn onClick={()=>setCodeExtended(!isCodeExtended)} isExtended={isCodeExtended}>
                <p>
                    {isCodeExtended?"코드 접기":"코드 펼치기"}
                </p>
                <FiChevronDown />
            </ExtendControlBtn>
            </CodeHolder>
            <TitleHolder>
            <h2>테스트 케이스</h2>
            <p>
            {Math.round((submissionData.TC.filter((elem:any)=>{return elem.State=="AC"}).length/submissionData.TC.length)*100)}%
            </p>
            </TitleHolder>
            <TestcaseHolder>
                {submissionData.TC.map((elem:any,index:number)=>{
                    return (
                        <TestCase key={elem["_id"]}>
                            <p>케이스 {index}</p>
                            <div>
                                <FiChevronDown />
                            </div>
                        </TestCase>
                    )
                })}
            </TestcaseHolder>
            
            </>}
        </TabMain>
    )
}