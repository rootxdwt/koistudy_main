import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { DropDownMenu } from "./dropdownmenu"
import { AcceptableLanguage } from '@/lib/pref/languageLib'
import styled, { keyframes } from "styled-components";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../DefaultComponent"
import { connect } from "socket.io-client";
import copy from 'copy-to-clipboard';
import { useRouter } from "next/router";
import { LanguageHandler } from "@/lib/pref/languageLib";
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
font-size: 20px;
align-items:center;
justify-content:center;
background-color: ${props => props.theme.Header.BgColor};
border-left: solid 1px ${props => props.theme.Body.ContainerBgLevels[2]};
border-right: solid 1px ${props => props.theme.Body.ContainerBgLevels[2]};
color: ${props => props.theme.Body.TextColorLevels[2]};
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

        console.log(process.env.REDIRURL!)
        socket = connect("http://localhost:3010/runcode", {
            path: "/sockets",
            auth: {
                Authorization: tk
            }
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
    user-select: none;

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

//dispatch({type: "tabs/add", payload:{name:"제출", id:jsn.subcode, isActive:true}})


export interface JudgeResponse {
    errorStatement: string
    matchedTestCase: Array<{ matched: boolean, tle: boolean, lim: number, exect: number, memory: number }>
    status: "Success" | "Error" | ""
}




export const CodeEditArea = (props: { probNo: number, SupportedLang: Array<AcceptableLanguage>, parentWidth: any, contextData: any, isJudging: boolean }) => {
    const [currentCodeData, setCodeData] = useState<string>("")
    const [currentCodeType, setCodeType] = useState(props.SupportedLang[0])
    const [isRunning, setRunningState] = useState(false)

    const [currentWidth, setCurrentWidth] = useState<number>(500)
    const [startingXpos, setStartingXpos] = useState<number | null>(null)
    const [isJudging, setJudging] = useState(false)
    const router = useRouter()

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
        if (!isJudging) {
            return
        }
        const tk = localStorage.getItem("tk") || ""
        console.log(process.env.REDIRURL!)
        const socket = connect("http://localhost:3010/runjudge", {
            path: "/sockets",
            auth: {
                Authorization: tk
            },
            query: {
                prob_id: props.probNo
            }
        })
        socket.on("connect_error", (err: any) => {
            socket.disconnect()
            if (err.description == 401 || err.message == "unauthorized") {
                router.push(`/auth/?redir=${encodeURIComponent(router.asPath)}`)
            } else {
                console.log(err)
                console.log("failed connecting")
            }
        });
        socket.on("connect", () => {
            socket.emit("feed", { codeData: currentCodeData, lang: currentCodeType })//a
        });
        socket.on("compile_end", () => {
            console.log("compileend")
        });
        socket.on("judge_progress", (data) => {
            console.log(data)
        })

        socket.on('error', (data: string) => {
            console.log(data)
        })


    }, [isJudging])


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
                    {tabState.map((elem: { id: string, name: string, isActive: boolean }, index: number) => {
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
                </CodeEdit> : <SubmissionDetail elemId={tabState.filter(elem => elem.isActive)[0]["id"]} />}

                {isRunning ? <RunResult codeData={currentCodeData} codeType={currentCodeType} /> : <></>}

                <SubmissionResult
                    isExtended={false}
                >
                    <div className="top">
                        <DropDownMenu
                            active={currentCodeType}
                            dropType="up"
                            items={props.SupportedLang}
                            displayName={props.SupportedLang.map(
                                (elem) => {
                                    return { name: elem, displayName: new LanguageHandler(elem, "").getLangFullName() }
                                }
                            )}
                            clickEventHandler={setCodeType} />
                        <div className="mHolder">
                            <DefaultSubmissionAreaBtn onClick={() => setRunningState(!isRunning)}>실행하기</DefaultSubmissionAreaBtn>
                            <SubmitBtn onClick={() => setJudging(!isJudging)}>{props.isJudging ? <Loading /> : "제출"}</SubmitBtn>
                        </div>
                    </div>
                </SubmissionResult>

            </SubmitHolder >
        </>
    )
}
