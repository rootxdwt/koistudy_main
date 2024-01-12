import styled, { keyframes } from "styled-components"
import {
    useState,
    Fragment,
    useEffect,
} from "react"

import { FiChevronDown } from 'react-icons/fi'
import { useRouter } from "next/router"
import { Button } from "../DefaultComponent"
import { LanguageHandler } from "@/lib/pref/languageLib"
import { DropDownMenu } from "./dropdownmenu"
import { AcceptableLanguage } from "@/lib/pref/languageLib"

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


const DefaultSubmissionAreaBtn = styled(Button)`
border: solid 2px ${props => props.theme.Body.backgroundColor};
&:hover {
    border: solid 2px ${props => props.theme.Body.ContainerBgLevels[0]};
}
height: 29px;
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

const LoadingAnimation = keyframes`
0%{
    rotate: 0deg;
}
100%{
    rotate: 360deg;
}
`

const Loading = styled.span`
    width: 10px;
    height: 10px;
    display: block;
    border-radius: 10px;
    border: solid 2px ${props => props.theme.Body.backgroundColor};
    border-top: solid 2px transparent;
    animation: ${LoadingAnimation} 1s ease infinite;
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
        setCodeType: Function,
        isJudging:boolean
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
                    <DefaultSubmissionAreaBtn onClick={() => props.runFn()}>실행하기</DefaultSubmissionAreaBtn>
                    <SubmitBtn onClick={() => props.submitFn()}>{props.isJudging?<Loading/>:"제출"}</SubmitBtn>
                </div>
            </div>
        </SubmissionResult>
    )
}