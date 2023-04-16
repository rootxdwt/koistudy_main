import { Holder, Button } from "@/lib/ui/DefaultComponent"
import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { DropDownMenu } from "@/lib/ui/DefaultComponent"
import { AcceptableLanguage } from '@/lib/pref/languageLib'
import styled from "styled-components";
import { useState } from "react";

const CodeEditAreaComponent = styled.div`
display;flex;
overflow: hidden;
margin-top: 30px;
border-radius: 5px;
margin-bottom: 10px;
height: 100%;
`

const LangSelector = styled.div`
display:flex;
margin-top: 20px;

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
padding-left:10px;
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
justofy-content:center;
&:hover {
    background-color: ${props => props.theme.Button.backgroundColor};
}
@media (max-width: 700px) {
    display:none;
}
`

export const CodeEditArea = (props: { submitFn: Function, SupportedLang: Array<AcceptableLanguage>, }) => {
    const [currentCodeData, setCodeData] = useState<string>("")
    const [currentCodeType, setCodeType] = useState(props.SupportedLang[0])
    const [currentWidth, setCurrentWidth] = useState<number>(300)

    let isResizing = false
    let startingXpos = 0

    addEventListener('mousemove', (e) => {
        if (isResizing) {
            e.preventDefault()
            setCurrentWidth(currentWidth + startingXpos - e.clientX)
        }
    })
    addEventListener('touchmove', (e) => {
        if (isResizing) {
            setCurrentWidth(currentWidth + startingXpos - e.touches[0].clientX)
        }
    })
    addEventListener('touchend', (e) => {
        isResizing = false
    })
    addEventListener('mouseup', (e) => {
        isResizing = false
    })

    return (
        <SubmitHolder currentWidth={currentWidth}>
            <Rearrange onMouseDown={(e) => { isResizing = true; startingXpos = e.clientX; }} onTouchStart={(e) => { isResizing = true; startingXpos = e.touches[0].clientX; }} >
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
            <Submission><Button onClick={() => props.submitFn(currentCodeType, currentCodeData)}>submit</Button></Submission>
        </SubmitHolder >

    )
}

