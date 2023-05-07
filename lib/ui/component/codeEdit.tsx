import { Holder, Button } from "@/lib/ui/DefaultComponent"
import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { BsFillPlayFill, BsStopFill } from 'react-icons/bs'
import { MdDelete } from 'react-icons/md'
import { DropDownMenu } from "@/lib/ui/DefaultComponent"
import { AcceptableLanguage } from '@/lib/pref/languageLib'
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { connect } from "socket.io-client";
import copy from 'copy-to-clipboard';
import { TbCopy } from 'react-icons/tb'
import { useRouter } from "next/router";

const CodeEditAreaComponent = styled.div`
display:flex;
overflow: hidden;
margin-top: 30px;
margin-bottom: 10px;
height: 100%;
`

const LangSelector = styled.div`
display:flex;
margin-top: 20px;
align-items:center;

`

const RunBtn = styled(Button)`
width:30px;
`

const Submission = styled.div`
width: 100%;
height: 50px;
display:flex;
align-items: center;
justify-content: flex-start;
`

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
margin-left:20px;
overflow:hidden;
padding-bottom: 70px;
@media (max-width: 700px) {
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
background-color: ${props => props.theme.Container.backgroundColor};
width:10px;
margin-left:-20px;
cursor:col-resize;
display:flex;
align-items:center;
justify-content:center;
&:hover {
    background-color: ${props => props.theme.Button.backgroundColor};
}
@media (max-width: 700px) {
    display:none;
}
`

const ResultHolder = styled.div`
position:absolute;
width: 100%;
background-color: ${props => props.theme.Body.backgroundColor};
z-index:2;
height: 170px;
overflow:scroll;
bottom:120px;
-ms-overflow-style: none;
scrollbar-width: none; 
&::-webkit-scrollbar {
    display: none;
  }
`
const ConsoleHeader = styled.div`
display:flex;
font-size: 10pt;
color: ${props => props.theme.Body.TextColorLevels[3]};
padding: 0px 10px;
height: 40px;
align-items:center;
justify-content:space-between;
margin-bottom: 10px;
position:sticky;
top:0;
background-color: ${props => props.theme.Body.backgroundColor};
z-index:3;
font-family: 'Poppins', sans-serif;
`

const ConsoleBtnHolder = styled.div`
display:flex;

`
const ConsoleName = styled.div`
display:flex;
align-items:center;
font-size: 13pt;

& p {
    margin-right: 5px;
    font-size: 10pt;
}
`
const ConsoleButtonArea = styled(RunBtn)`

margin:0;
margin-left: 20px;
&:hover {
    color: ${props => props.theme.Body.TextColorLevels[2]};
}
`
let socket: any
const RunResult = (props: { codeData: string, codeType: string }) => {
    const [isConsoleEditable, setEditableState] = useState(false)
    const [inputData, setInputData] = useState<string>("")
    const [fixValue, setValue] = useState("")
    const [consoleCleared, setconsoleCleared] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const router = useRouter()
    const copyText = (text: string) => {
        setIsCopied(true)
        copy(text)
        setTimeout(() => setIsCopied(false), 1000)
    }
    useEffect((): any => {
        const tk = localStorage.getItem("tk") || ""

        socket = connect("localhost:3000", {
            path: "/api/judge/runcode",
            extraHeaders: {
                Authorization: tk
            }
        })
        socket.on("connect_error", (err: any) => {
            socket.disconnect()
            if (err.description == 401 || err.message == "unauthorized") {
                router.push("/auth/login")
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
                    <p>console</p>
                </ConsoleName>
                <ConsoleBtnHolder>
                    <ConsoleButtonArea onClick={() => { copyText(fixValue) }}><TbCopy /></ConsoleButtonArea>
                    <ConsoleButtonArea onClick={() => { setconsoleCleared(true); setValue("") }}><MdDelete /></ConsoleButtonArea>
                </ConsoleBtnHolder>
            </ConsoleHeader>
            <CodeMirror
                height="110px"
                onChange={(v, _) => setInputData(v)}
                placeholder={isConsoleEditable ? "여기에 입력하세요" : consoleCleared ? "Console cleared" : "Compiling.."}
                onKeyDown={(e) => { if (e.key == "Enter") { socket.emit("input", inputData?.split("\n")[inputData?.split("\n").length - 2] + "\n") } }}
                value={fixValue}
                basicSetup={
                    {
                        drawSelection: false,
                        autocompletion: false,
                        lineNumbers: false,
                        searchKeymap: false,
                        highlightActiveLine: false,
                        highlightActiveLineGutter: false
                    }
                }
                extensions={
                    [
                        loadLanguage("shell")!
                    ].filter(Boolean)
                }
                editable={isConsoleEditable}
                theme={"dark"}></CodeMirror>
        </ResultHolder>)
}

export const CodeEditArea = (props: { submitFn: Function, SupportedLang: Array<AcceptableLanguage> }) => {
    const [currentCodeData, setCodeData] = useState<string>("")
    const [currentCodeType, setCodeType] = useState(props.SupportedLang[0])
    const [currentWidth, setCurrentWidth] = useState<number>(300)
    const [startingXpos, setStartingXpos] = useState<number | null>(null)
    const [isRunning, setRunningState] = useState(false)


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

    useEffect(() => {
        window.addEventListener('mousemove', mouseMoveHandler)
        window.addEventListener('touchmove', touchMoveHandler)

        return () => {
            window.removeEventListener('mousemove', mouseMoveHandler)
            window.removeEventListener('touchmove', touchMoveHandler)
        }
    }, [startingXpos])

    return (
        <SubmitHolder currentWidth={currentWidth}>
            <Rearrange
                onMouseDown={(e) => setStartingXpos(e.pageX)}
                onTouchStart={(e) => setStartingXpos(e.touches[0].pageX)}
                onMouseUp={() => setStartingXpos(null)}
                onTouchEnd={() => setStartingXpos(null)}
            >
                <HiOutlineDotsVertical />
            </Rearrange>
            <LangSelector>

                <DropDownMenu active={currentCodeType} items={props.SupportedLang} clickEventHandler={setCodeType} />
            </LangSelector>
            <CodeEditAreaComponent>
                <CodeMirror
                    basicSetup={
                        {
                            drawSelection: false,
                            autocompletion: false,
                            searchKeymap: false,
                            highlightActiveLine: false,
                            highlightActiveLineGutter: false
                        }
                    }

                    height="calc(100vh - 260px)"
                    extensions={
                        [
                            loadLanguage(currentCodeType)!
                        ].filter(Boolean)
                    }
                    onChange={(v, _) => setCodeData(v)}
                    theme={"dark"}
                    placeholder={"여기에 코드를 작성하세요"}
                />
            </CodeEditAreaComponent>
            {isRunning ? <RunResult codeData={currentCodeData} codeType={currentCodeType} /> : <></>}
            <Submission><Button onClick={() => props.submitFn(currentCodeType, currentCodeData)}>submit</Button>
                <RunBtn onClick={() => setRunningState(!isRunning)}>
                    {isRunning ? <BsStopFill /> : <BsFillPlayFill />}
                </RunBtn>
            </Submission>
        </SubmitHolder >
    )
}
