import styled, { keyframes } from "styled-components"
import {
    useState,
    Fragment,
    useEffect,
} from "react"

import { FiChevronDown } from 'react-icons/fi'
import { AC, AW, TLE } from "../DefaultComponent"
import { useRouter } from "next/router"
import { Button } from "../DefaultComponent"
import { LanguageHandler } from "@/lib/pref/languageLib"
import { DropDownMenu } from "./dropdownmenu"
import { AcceptableLanguage } from "@/lib/pref/languageLib"

const LoadingAnimation = keyframes`
0%{
    rotate: 0deg;
}
100%{
    rotate: 360deg;
}
`

const Loading = styled.span`
    width: 8px;
    height: 8px;
    display: block;
    border-radius: 10px;
    border: solid 2px ${props => props.theme.Body.TextColorLevels[2]};
    border-top: solid 2px ${props => props.theme.Body.backgroundColor};
    animation: ${LoadingAnimation} 2s ease infinite;
`

const Circle = styled.span<{ Color: string }>`
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: ${props => props.Color};
    transition: background-color 0.2s cubic-bezier(.5,0,.56,.99);
    position: relative;
`

const SubmissionResult = styled.div<{ isExtended: boolean, }>`
user-select: none;
position: absolute;
bottom:0;
width: calc(100% - 30px);
padding: 0px 15px;
margin-top: 20px;
  @media(max-width: 770px) {
    width: 90vw;
    position: fixed;
    padding: 0;
  }
display:flex;
z-index:2;
flex-direction: column;
align-items:flex-start;
background-color:${props => props.theme.Body.backgroundColor};

height: 50px;
outline:none;
-webkit-tap-highlight-color: rgba(0,0,0,0);
transition: height 0.5s cubic-bezier(.5,0,.56,.99);

& h3 {
    margin:0;
    color: ${props => props.theme.Title.textColor};
    font-size: 16px;
    width: 100px;
    margin-left: 10px;
}
& p {
    margin:0;
    font-size: 13px;
}
& .top {
    height: 60px;
    display:flex;
    flex-direction:row;
    justify-content: space-between;
    align-items:center;
    width: 100%;
    cursor:pointer;
}

& .top .tHolder {
    display:flex;
    flex-direction: row;
    align-items:center;

}
& .top .mHolder {
    display:flex;
    flex-direction: row;
    align-items:center;
    color: ${props => props.theme.Title.subColor};

}
& .top .mHolder p{
    margin-right: 5px;
}
& .top p.icon{
    transform: rotate(${props => props.isExtended ? "0" : "180"}deg);
    display:flex;
    align-items:center;
    justify-content:center;
    transition:transform 0.5s cubic-bezier(.5,0,.56,.99);
}
& .btm {
    transition: height 0.5s cubic-bezier(.5,0,.56,.99);
    height:0px;
    overflow:${props => props.isExtended ? "scroll" : "hidden"};
    overflow-x: hidden;
    -ms-overflow-style: none;
    scrollbar-width: none; 
    &::-webkit-scrollbar {
    display: none;
    }
    width: 100%;
}
& p.ptge {
    font-size: 13px;
    color: ${props => props.theme.Title.subColor};
}
`


const TCholder = styled.div`
margin-top: 10px;
`

const TcItm = styled.div<{ isRight: boolean, isShown: boolean }>`
padding: 0px 20px;
display:flex;
justify-content: space-between;
color: ${props => props.theme.Body.TextColorLevels[3]};
background-color: ${props => props.isShown ? props.theme.Container.backgroundColor : props.theme.Body.backgroundColor};
height: 43px;
display:flex;
align-items:center;
border-bottom: solid 1px ${props => props.isShown ? "transparent" : props.theme.Button.backgroundColor};
& .TCtitle {
    font-weight:normal;
    color: ${props => props.theme.Body.TextColorLevels[1]};
    font-size: 13px;
}
& .TCwr {
    color: ${props => props.theme.Body.TextColorLevels[0]};
    font-size:13px;
}
border-radius:${props => props.isShown ? 5 : 0}px;
cursor:pointer;
&:hover {
    background-color:${props => props.theme.Container.backgroundColor};
}

`

const Details = styled.div<{ isShown: boolean }>`
transition: height 0.1s cubic-bezier(.5,0,.56,.99);
height: ${props => props.isShown ? "40" : "0"}px;
margin-bottom: ${props => props.isShown ? "20" : "2"}px;
margin-left: 20px;
margin-right: 20px;
overflow:hidden;
display:flex;
align-items:center;
justify-content:space-between;
color: ${props => props.theme.Body.TextColorLevels[3]};
& span {
    display:flex;
    align-items:center;
}
& b{
    font-size: 13px;
    color: ${props => props.theme.Body.TextColorLevels[2]};
}
& p {
    font-size: 13px;
    margin-left: 10px;
}

`

const DefaultSubmissionAreaBtn = styled(Button)`
border: solid 2px ${props => props.theme.Container.backgroundColor};
&:hover {
    border: solid 2px ${props => props.theme.Body.ContainerBgLevels[0]};
}
height: 27.5px;
user-select: none;
font-size: 12px;
margin: 0;
margin-left: 10px;
`

const SubmitBtn = styled(DefaultSubmissionAreaBtn)`
width:auto;
padding: 0px 20px;
background-color: ${props => props.theme.Body.TextColorLevels[3]};
color: ${props => props.theme.Body.backgroundColor};
`



export interface JudgeResponse {
    errorStatement: string
    matchedTestCase: Array<{ matched: boolean, tle: boolean, lim: number, exect: number, memory: number }>
    status: "Success" | "Error" | ""
}

export const SubmitResult = (props:
    {
        currentCodeType: AcceptableLanguage,
        SupportedLang: AcceptableLanguage[],
        runFn: Function,
        submitFn: Function,
        setCodeType: Function
    }) => {
    return (
        <SubmissionResult
            isExtended={false}
        >
            <div className="top">
                <DropDownMenu
                    active={props.currentCodeType}
                    dropType="up"
                    items={props.SupportedLang}
                    displayName={props.SupportedLang.map(
                        (elem) => {
                            return { name: elem, displayName: new LanguageHandler(elem, "").getLangFullName() }
                        }
                    )}
                    clickEventHandler={props.setCodeType} />
                <div className="mHolder">
                    <SubmitBtn onClick={() => props.runFn()}>실행</SubmitBtn>
                    <SubmitBtn onClick={() => props.submitFn()}>제출</SubmitBtn>
                </div>
            </div>
            {/* <div className="btm">
                <h3 className="tch3">테스트 케이스</h3>
                <p className="ptge">{
                    Math.round((contextData.matchedTestCase.filter(itm => itm.matched == true).length / contextData.matchedTestCase.length) * 100)
                }% ㅣ {contextData.status == "" ? "" : Math.max(...contextData.matchedTestCase.map(elem => elem.memory))}KB</p>
                <TCholder>
                    {contextData.matchedTestCase.map((elem, index) => {
                        return (
                            <Fragment key={index} >
                                <TcItm isRight={elem.matched} onClick={() => { setCaseDetail(caseDetail == index ? -1 : index) }} isShown={caseDetail == index}>
                                    <div className="TCtitle">{index}</div>
                                    <div className="TCwr">{elem.matched ? <AC /> : elem.tle ? <TLE /> : <AW />}</div>
                                </TcItm>
                                <Details isShown={caseDetail == index}>
                                    <span>
                                        <b>
                                            T/TL:
                                        </b>
                                        <p>
                                            {elem.exect}s/{elem.lim}s
                                        </p>
                                    </span>

                                    <span>
                                        <p>
                                            {elem.matched ? `맞았습니다` : elem.tle ? "시간 제한 초과" : "테스트 케이스 불일치"}
                                        </p>

                                    </span>
                                </Details>
                            </Fragment>
                        )
                    })}
                </TCholder>
            </div> */}
        </SubmissionResult>
    )
}