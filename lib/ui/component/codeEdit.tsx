import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { AcceptableLanguage } from '@/lib/pref/languageLib'
import styled, { keyframes } from "styled-components";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { Button } from "../DefaultComponent"
import { connect } from "socket.io-client";
import copy from 'copy-to-clipboard';
import { useRouter } from "next/router";
import { LanguageHandler } from "@/lib/pref/languageLib";
import { FiChevronDown, FiCode, FiInfo } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from "@/lib/store";
import { AiOutlineClose } from 'react-icons/ai'
import { SubmissionDetail } from "./submissionDetail";
import { githubDark } from "@uiw/codemirror-theme-github";
import { ResizeX,ResizeY } from "./resizableBars";

interface WidthIn {
    currentWidth: number
}

const SubmitHolder = styled.div.attrs<WidthIn>(({ currentWidth }) => ({
    style: {
        minWidth: currentWidth,
        maxWidth: currentWidth
    }
})) <WidthIn>`
display:flex;
flex-direction:column;
margin-right:0;
position:relative;
margin-left:10px;
overflow:hidden;
padding-bottom: 40px;
@media (max-width: 770px) {
    padding-left:0px;
    margin-left:0px;
    min-width: 100%!important;
    max-width: 100%!important;
}
`


const ResultHolder = styled.div.attrs<{ currentHeight: number }>(({ currentHeight }) => ({
    style: {
        minHeight: currentHeight,
        maxHeight: currentHeight
    }
})) <{ currentHeight: number }>`
width: 100%;
margin-top: auto;
background-color: ${props => props.theme.Header.BgColor};
z-index:1000;
overflow:scroll;
display: flex;
flex-direction: column;
height: 200px;
-ms-overflow-style: none;
position:relative;
scrollbar-width: none; 
&::-webkit-scrollbar {
    display: none;
  }
`
const ConsoleHeader = styled.div`
display:flex;
font-size: 13px;
color: ${props => props.theme.Body.TextColorLevels[3]};
border-top: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
padding: 0px 10px;
height: 40px;
align-items:center;
justify-content:space-between;

position:sticky;
top:0;
z-index:3;
font-family: 'Noto Sans KR', sans-serif;
`

const SubmissionProgress = styled.div`
font-size:12px;
color: ${props=>props.theme.Body.TextColorLevels[2]};
display:flex;
align-items:center;
& p.status {
    font-size:12px;
    padding:0;
    margin:0;
    margin-left: 7px;
    color: ${props=>props.theme.Body.TextColorLevels[3]};
}
`

const ConsoleName = styled.div`
display:flex;
align-items:center;
font-size: 17px;

& p {
    margin-right: 5px;
    font-size: 13px;
}
`

const ConsoleBody = styled.div`

width: 100%;
margin-left: auto;
margin-right: auto;
padding-top: 10px;
& .cm-foldGutter {
    display:none!important;
}
`


let socket: any
const RunResult = (props: { codeData: string, codeType: string }) => {
    const [resultHeight, setResultHeight] = useState(window.innerHeight/2)
    const [isConsoleEditable, setEditableState] = useState(false)
    const [inputData, setInputData] = useState<string>("")
    const [fixValue, setValue] = useState("")
    const [consoleCleared, setconsoleCleared] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [sent, setSent] = useState<string>("A4YOZcb8W2xjnblz")
    const router = useRouter()
    const copyText = (text: string) => {
        setIsCopied(true)
        copy(text)
        setTimeout(() => setIsCopied(false), 1000)
    }
    useEffect((): any => {
        const tk = localStorage.getItem("tk") || ""

        console.log(process.env.REDIRURL!)
        socket = connect("http://localhost:3010/runcode", {
            path: "/sockets",
            auth: {
                Authorization: tk
            },
            transports: ["websocket"]
        })
        socket.on("connect_error", (err: any) => {
            socket.disconnect()
            if (err.description == 401 || err.message == "unauthorized") {
                router.push(`/auth/?redir=${encodeURIComponent(router.asPath)}`)
            } else {
                console.log(err)
                setValue("Failed connecting with server")
            }
        });
        socket.on("connect", () => {
            socket.emit("codeData", { data: props.codeData, typ: props.codeType })
        });

        socket.on('error', (data: string) => {
            setEditableState(false)
            if (data) {
                setValue(data.replace(/([^\w\s+*:;-`,.'()/\\]+)/gi, ""))
            } else {
                setValue("unknown error")
            }
            socket.disconnect()
        })

        socket.on('compileEnd', () => {
            setEditableState(true)
        })
        socket.on('data', (data: string) => {
            setValue(data)
        })
        socket.on('end', (data: string) => {
            setValue(data)
            setEditableState(false)
            socket.disconnect()
        })


        if (socket) return () => socket.disconnect();
    }, [])

    return (
        <>
            <ResultHolder currentHeight={resultHeight}>
                <ResizeY setStateFunction={setResultHeight} defaultHeight={window.innerHeight/2} />
                <ConsoleHeader>
                    <ConsoleName>
                        <p>콘솔</p>
                    </ConsoleName>
                </ConsoleHeader>
                <ConsoleBody>
                    <CodeMirror
                        height="110px"
                        onChange={(v, _) => setInputData("A4YOZcb8W2xjnblz" + v)}
                        placeholder={isConsoleEditable ? "여기에 입력하세요" : consoleCleared ? "콘솔이 지워졌습니다" : "코드를 실행중입니다.."}
                        onKeyDown={(e) => {
                            if (e.key == "Enter") {
                                socket.emit("input", inputData.split(sent)[1])
                                setSent(inputData.split(sent)[1])
                            }
                        }}
                        value={fixValue}
                        basicSetup={
                            {
                                drawSelection: false,
                                autocompletion: false,
                                lineNumbers: false,
                                searchKeymap: false,
                                highlightActiveLine: false,
                                highlightActiveLineGutter: false,
                            }
                        }
                        editable={isConsoleEditable}
                        theme={githubDark}></CodeMirror>
                </ConsoleBody>
            </ResultHolder>
        </>
    )
}

const TabHolder = styled.ul`
    padding: 0;
    list-style-type: none;
    display: flex;
    flex-direction: row;
    margin: 0px;
    margin-bottom: 5px;
    background-color: ${props => props.theme.Header.BgColor};
    z-index:1000;
    border-bottom: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
`

const TabItm = styled.li<{ isActive?: boolean }>`
    user-select: none;
    max-width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 0px;
    border-top-left-radius:5px;
    border-top-right-radius:5px;
    bottom:-1px;
    z-index:1001;
    &:first-child {
        margin-left: 0px;
    }
    &:last-child {
        margin-right: 20px;
    }
    & p.name {
        margin:0;
        padding:0;
        margin-left:10px;
        margin-right:10px;
        color:${props => props.isActive ? props.theme.Body.TextColorLevels[1] : props.theme.Body.TextColorLevels[3]};
        font-size: 12px;
        display:flex;
        align-items:center;
        height: 17px;
    }
    font-size: 11px;
    color:${props => props.isActive ? props.theme.Body.TextColorLevels[1] : props.theme.Body.TextColorLevels[3]};
    border: solid 1px ${props => !props.isActive ? "transparent" : props.theme.Body.ContainerBgLevels[2]};
    border-bottom:solid 1px ${props=>props.isActive?"transparent": props.theme.Body.ContainerBgLevels[1]};
    width: 100%;
    background-color: ${props => props.isActive ? props.theme.Body.backgroundColor : props.theme.Header.BgColor};
    cursor: pointer;
    position: relative;

`

const TabLangSelector = styled.div`
    display:flex;
    align-items:center;
    justify-content:center;
    position:relative;
    font-size: 11px;
    color: ${props => props.theme.Body.TextColorLevels[3]};
    padding: 0px 5px;
    padding-left: 10px;
    height: 10px;
    border-left: solid 1px ${props=>props.theme.Body.ContainerBgLevels[0]};

`

const LangDropDown = styled.ul`
position:absolute;
background-color: ${props=>props.theme.Header.BgColor};
border: solid 1px ${props=>props.theme.Body.ContainerBgLevels[0]};
top: 30px;
left:0;
padding:0;
margin:0;
width: 100px;
border-radius: 5px;
`

const LangDropDownBtn = styled.li`
list-style-type:none;
padding:5px 10px;
margin:0;
`

const TabExtendBtn = styled.div`
    font-size:12px;
    display:flex;
    align-items:center;
    justify-content:center;
    margin-left: 2px;
    border-radius: 3px;
`

const TabCloseBtn = styled.div`
    position: absolute;
    right:10px;
    font-size: 12px;
    width: 15px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    &:hover {
        background-color: ${props => props.theme.Body.ContainerBgLevels[1]};
    }
`

const CodeEdit = styled.div`
    height: 100%;
    overflow: auto;
`

const SubmissionResult = styled.div<{ isExtended: boolean, }>`
user-select: none;
position: absolute;
bottom:0;
width: calc(100% - 12px);
padding: 0px;
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
background-color:${props => props.theme.Header.BgColor};
z-index:1000;
border-top:solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
padding: 0px 6px;
height: 40px;
outline:none;
-webkit-tap-highlight-color: rgba(0,0,0,0);
transition: height 0.5s cubic-bezier(.5,0,.56,.99);

& .top {
    height: 40px;
    display:flex;
    flex-direction:row;
    justify-content: space-between;
    align-items:center;
    width: 100%;
    cursor:pointer;
}

& .top .mHolder {
    display:flex;
    flex-direction: row;
    align-items:center;
    margin-left:auto;
    margin-right:0;
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


const multiplyArray = (data:Array<number>) =>{
    let m=1
    for(const itm of data) {
        m*=itm
    }
    return m
}


export const CodeEditArea = (props: { probNo: number, SupportedLang: Array<AcceptableLanguage>, parentWidth: any, contextData: any, isJudging: boolean }) => {
    const [currentCodeData, setCodeData] = useState<string>("")
    const [currentCodeType, setCodeType] = useState(props.SupportedLang[0])
    const [isRunning, setRunningState] = useState(false)

    const [currentWidth, setCurrentWidth] = useState<number>(500)
    const [isJudging, setJudging] = useState(false)
    const router = useRouter()
    const [isLangDropdown, setLangDropDown] = useState(false)
    const [judgingStatus,setJudgingStatus] = useState<string>()

    const tabState = useSelector<StateType, Array<{ name: string, id: string, isActive: boolean }>>(state => state.tabs.activeTabs);

    const dispatch = useDispatch()


    useEffect(() => {
        let judge_progress:Array<number>=[]
        if (!isJudging) {
            return
        }
        setJudgingStatus("제출중..")
        const tk = localStorage.getItem("tk") || ""
        console.log(process.env.REDIRURL!)
        const socket = connect("http://localhost:3010/runjudge", {
            path: "/sockets",
            auth: {
                Authorization: tk
            },
            query: {
                prob_id: props.probNo
            },
            transports: ["websocket"]
        })
        socket.on("connect_error", (err: any) => {
            socket.disconnect()
            if (err.description == 401 || err.message == "unauthorized") {
                router.push(`/auth/?redir=${encodeURIComponent(router.asPath)}`)
            } else {
                console.log(err.message)
                if(err.message=="ratelimited") {
                    setJudgingStatus("다른 채점이 진행중입니다")
                    setJudging(false)
                }
            }
        });
        socket.on("connect", () => {
            setJudgingStatus("제출됨")
            socket.emit("feed", { codeData: currentCodeData, lang: currentCodeType })
        });
        socket.on("compile_end", () => {
            setJudgingStatus("컴파일 완료")
        });
        socket.on("judge_progress", (data:Array<number>) => {
            judge_progress[data[0]]=data[1]
            setJudgingStatus("채점중.."+Math.round(multiplyArray(judge_progress)*100)+"%")
        })

        socket.on('success', (data: string) => {
            dispatch({type: "tabs/add", payload:{name:"제출", id:data, isActive:true}})
            setJudgingStatus("채점이 완료되었습니다")
            setJudging(false)
        })

        socket.on('error', (data: string) => {
            setJudgingStatus("오류가 발생했습니다")
            setJudging(false)
        })


    }, [isJudging])

    return (
        <>
            <SubmitHolder currentWidth={currentWidth}>
                <ResizeX setStateFunction={setCurrentWidth} parentWidth={props.parentWidth} />
                <TabHolder>
                    <TabItm isActive={
                        tabState.every(elem => !elem.isActive)}
                        onClick={() => dispatch({ type: "tabs/setActive", payload: "" })}>
                        <FiCode />
                        <p className="name">
                        코드
                        </p>
                        {tabState.every(elem => !elem.isActive)?                        <TabLangSelector onClick={()=>setLangDropDown(!isLangDropdown)}>
                        {new LanguageHandler(currentCodeType, "").getLangFullName()}
                        <TabExtendBtn><FiChevronDown /></TabExtendBtn>
                        {isLangDropdown?                        <LangDropDown>
                            {props.SupportedLang.map(
                                (elem) => {
                                    return (<LangDropDownBtn key={elem} onClick={()=>setCodeType(elem)}>
                                        {new LanguageHandler(elem, "").getLangFullName()}
                                    </LangDropDownBtn>)
                                }
                            )}

</LangDropDown>:<></>}
                        </TabLangSelector>:<></>}
                    </TabItm>
                    {tabState.map((elem: { id: string, name: string, isActive: boolean }, index: number) => {
                        return (
                            <TabItm key={index} isActive={elem.isActive} onClick={() => dispatch({ type: "tabs/setActive", payload: elem.id })}>
                                <p className="name">{elem.name}</p>
                                <TabCloseBtn onClick={() => dispatch({ type: "tabs/remove", payload: elem.id })}>
                                    <AiOutlineClose />
                                </TabCloseBtn>
                            </TabItm>
                        )
                    })}
                </TabHolder>
                {tabState.every(elem => !elem.isActive) ? <CodeEdit>

                    <CodeMirror
                        basicSetup={
                            {
                                drawSelection: true,
                                autocompletion: false,
                                searchKeymap: false,
                                highlightActiveLine: false,
                                highlightActiveLineGutter: false
                            }
                        }

                        extensions={
                            [
                                loadLanguage(currentCodeType)!
                            ].filter(Boolean)
                        }
                        value={currentCodeData}
                        onChange={(v, _) => setCodeData(v)}
                        theme={githubDark}
                    />
                </CodeEdit> : <SubmissionDetail elemId={tabState.filter(elem => elem.isActive)[0]["id"]} />}

                {isRunning ? <RunResult codeData={currentCodeData} codeType={currentCodeType} /> : <></>}

                <SubmissionResult
                    isExtended={false}
                >
                    <div className="top">
                        {judgingStatus?<SubmissionProgress><FiInfo /><p className="status">{judgingStatus}</p></SubmissionProgress>:<></>}
                        <div className="mHolder">
                            <DefaultSubmissionAreaBtn onClick={() => setRunningState(!isRunning)}>{isRunning ? "정지하기" : "실행하기"}</DefaultSubmissionAreaBtn>
                            <SubmitBtn onClick={() => {if(!isJudging) {setJudging(!isJudging)}}}>{isJudging ? <Loading /> : "제출"}</SubmitBtn>
                        </div>
                    </div>
                </SubmissionResult>

            </SubmitHolder >
        </>
    )
}
