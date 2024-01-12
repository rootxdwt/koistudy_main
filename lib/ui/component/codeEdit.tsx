import { Button } from "@/lib/ui/DefaultComponent"
import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { BsFillPlayFill, BsStopFill } from 'react-icons/bs'
import { DropDownMenu } from "./dropdownmenu"
import { AcceptableLanguage } from '@/lib/pref/languageLib'
import styled from "styled-components";
import { useCallback, useEffect, useRef, useState } from "react";
import { connect } from "socket.io-client";
import copy from 'copy-to-clipboard';
import { useRouter } from "next/router";
import { LanguageHandler } from "@/lib/pref/languageLib";
import { SubmitResult } from "./submissionMenu";
import { FiChevronDown } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from "@/lib/store";
import { AiOutlineClose } from 'react-icons/ai'
import { SubmissionDetail } from "./submissionDetail";

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
padding-bottom: 50px;
@media (max-width: 770px) {
    padding-left:0px;
    margin-left:0px;
    min-width: 100%!important;
    max-width: 100%!important;
}
`

const Rearrange = styled.span`
position:fixed;
height: 100vh;
top:0;

width:10px;
margin-left:-12px;
cursor:col-resize;
display:flex;
align-items:center;
justify-content:center;
background-color: ${props => props.theme.Header.BgColor};
border-left: solid 1px ${props => props.theme.Body.ContainerBgLevels[2]};
border-right: solid 1px ${props => props.theme.Body.ContainerBgLevels[2]};
&:hover {
    background-color: ${props => props.theme.Button.backgroundColor};
}
@media (max-width: 770px) {
    display:none;
}
`

const ResultHolder = styled.div`
width: 100%;
margin-top: auto;
background-color: ${props => props.theme.Body.backgroundColor};
z-index:2;
overflow:scroll;
display: flex;
flex-direction: column;
height: 200px;
-ms-overflow-style: none;
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

const ConsoleBtnHolder = styled.div`
display:flex;

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
`

let socket: any
const RunResult = (props: { codeData: string, codeType: string }) => {
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

        socket = connect(process.env.REDIRURL!, {
            path: "/api/judge/runcode",
            extraHeaders: {
                Authorization: tk
            }
        })
        socket.on("connect_error", (err: any) => {
            socket.disconnect()
            if (err.description == 401 || err.message == "unauthorized") {
                router.push(`/auth/?redir=${encodeURIComponent(router.asPath)}`)
            } else {
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

        <ResultHolder>
            <ConsoleHeader>
                <ConsoleName>
                    <p>실행 결과</p>
                </ConsoleName>
                <ConsoleBtnHolder>
                    <FiChevronDown />
                </ConsoleBtnHolder>
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
                    theme={"dark"}></CodeMirror>
            </ConsoleBody>
        </ResultHolder>)
}

const TabHolder = styled.ul`
    padding: 0;
    list-style-type: none;
    display: flex;
    flex-direction: row;
    font-size: 12px;
    margin: 0px;
    margin-bottom: 5px;
`

const TabItm = styled.li<{ isActive?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 0px;
    &:first-child {
        border-left: none;
    }
    border-left: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
    border-bottom: solid 1px ${props => props.theme.Body.backgroundColor};
    width: 100%;
    color: ${props => props.isActive ? props.theme.Body.TextColorLevels[1] : props.theme.Body.TextColorLevels[3]};
    /* background-color: ${props => props.isActive ? props.theme.Body.ContainerBgLevels[2] : "transparent"}; */
    cursor: pointer;
    position: relative;
    &:hover {
        background-color: ${props => props.theme.Body.ContainerBgLevels[2]};
    }

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

const TabMain = styled.div`
width:100%;
display: flex;
flex-direction: column;

`

const CodeEdit = styled.div`
    height: 100%;
    overflow: auto;
`


export const CodeEditArea = (props: { submitFn: Function, SupportedLang: Array<AcceptableLanguage>, parentWidth: any, contextData: any, isJudging: boolean }) => {
    const [currentCodeData, setCodeData] = useState<string>("")
    const [currentCodeType, setCodeType] = useState(props.SupportedLang[0])
    const [isRunning, setRunningState] = useState(false)

    const [currentWidth, setCurrentWidth] = useState<number>(500)
    const [startingXpos, setStartingXpos] = useState<number | null>(null)
    const tabState = useSelector<StateType, Array<{ name: string, id: string, isActive: boolean }>>(state => state.tabs.activeTabs);

    const dispatch = useDispatch()

    const mouseMoveHandler = (e: MouseEvent) => {
        if (startingXpos !== null) {
            e.preventDefault()
            setCurrentWidth(currentWidth + startingXpos - e.pageX)
        }
    }

    const touchMoveHandler = (e: TouchEvent) => {
        if (startingXpos !== null) {
            setCurrentWidth(currentWidth + startingXpos - e.touches[0].pageX)
        }
    }
    const ResetPos = () => {
        setStartingXpos(null)
    }

    useEffect(() => {
        setCurrentWidth(props.parentWidth() / 2)
    }, [])

    useEffect(() => {
        window.addEventListener('mousemove', mouseMoveHandler)
        window.addEventListener('touchmove', touchMoveHandler)
        window.addEventListener('mouseup', ResetPos)
        window.addEventListener('touchend', ResetPos)

        return () => {
            window.removeEventListener('mousemove', mouseMoveHandler)
            window.removeEventListener('touchmove', touchMoveHandler)
            window.removeEventListener('mouseup', ResetPos)
            window.removeEventListener('touchend', ResetPos)
        }
    }, [startingXpos])

    return (
        <>
            <SubmitHolder currentWidth={currentWidth}>
                <Rearrange
                    onMouseDown={(e) => setStartingXpos(e.pageX)}
                    onTouchStart={(e) => setStartingXpos(e.touches[0].pageX)}
                    onMouseUp={ResetPos}
                    onTouchEnd={ResetPos}
                >
                </Rearrange>
                {tabState.length > 0 ? <TabHolder>
                    <TabItm isActive={
                        tabState.every(elem => !elem.isActive)}
                        onClick={() => dispatch({ type: "tabs/setActive", payload: "" })}>
                        코드 편집기
                    </TabItm>
                    {tabState.map((elem: { id: string, name: string, isActive:boolean }, index: number) => {
                        return (
                            <TabItm key={index} isActive={elem.isActive} onClick={() => dispatch({ type: "tabs/setActive", payload: elem.id })}>
                                {elem.name}
                                <TabCloseBtn onClick={() => dispatch({ type: "tabs/remove", payload: elem.id })}>
                                    <AiOutlineClose />
                                </TabCloseBtn>
                            </TabItm>
                        )
                    })}
                </TabHolder> : <></>}
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
                        onChange={(v, _) => setCodeData(v)}
                        theme={"dark"}
                        placeholder={"여기에 코드를 작성하세요"}
                    />
                </CodeEdit> : <SubmissionDetail elemId={tabState.filter(elem=>elem.isActive)[0]["id"]}/>}

                {isRunning? <RunResult codeData={currentCodeData} codeType={currentCodeType} /> : <></>}
                <SubmitResult currentCodeType={currentCodeType}
                    SupportedLang={props.SupportedLang}
                    setCodeType={setCodeType}
                    runFn={() => setRunningState(!isRunning)}
                    submitFn={() => props.submitFn(currentCodeType, currentCodeData)} 
                    isJudging={props.isJudging}
                    />
                    
            </SubmitHolder >
        </>
    )
}
