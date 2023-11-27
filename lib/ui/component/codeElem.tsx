
import copy from 'copy-to-clipboard';
import { TbCopy, TbCheck } from 'react-icons/tb'
import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import styled, { keyframes } from 'styled-components';
import { useState } from 'react';
import { AcceptableLanguage } from '@/lib/pref/languageLib';
const CodeHolder = styled.div`
padding: 10px 10px;
border-radius: 5px;
position:relative;
display:flex;
align-items:center;
overflow:hidden;
flex-shrink:0;
background-color: ${props => props.theme.Container.backgroundColor};
border: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};

`

const CopyBtn = styled.span`
position:absolute;
right: 10px;
top: 10px;
width: 25px;
height: 25px;
border-radius: 5px;
color: ${props => props.theme.Body.TextColorLevels[3]};
background-color: ${props => props.theme.Button.backgroundColor};
cursor: pointer;
display:flex;
align-items:center;
justify-content:center;
&:hover{
    color: ${props => props.theme.Body.TextColorLevels[0]};
}
`

export const CodeElem = (prop: { lang?: AcceptableLanguage | "shell", data: string }) => {
    const [isCopied, setIsCopied] = useState(false)
    const [IsActive, setIsActive] = useState(false)

    const copyText = (text: string) => {
        setIsCopied(true)
        copy(text)
        setTimeout(() => setIsCopied(false), 1000)
    }

    let lang: any
    if (typeof prop.lang == "string") {
        lang = prop.lang
    }
    return <CodeHolder onMouseEnter={() => setIsActive(true)} onMouseLeave={() => setIsActive(false)}>
        <CodeMirror
            editable={false}
            basicSetup={
                {
                    drawSelection: false,
                    lineNumbers: false,
                    autocompletion: false,
                    foldGutter: false,
                    searchKeymap: false,
                    highlightActiveLine: false,
                    highlightActiveLineGutter: false
                }
            }
            extensions={
                [
                    loadLanguage(lang!)!
                ].filter(Boolean)
            }
            value={prop.data}
            theme={"dark"}
        />
        {IsActive ? <CopyBtn onClick={() => copyText(prop.data)}>
            {isCopied ? <TbCheck /> : <TbCopy />}
        </CopyBtn> : <></>}
    </CodeHolder>
}

const SubmittedCodeHolder = styled.div<{ isExtended: boolean }>`
margin: 10px 0px;
padding: 10px;
border-radius: 10px;
position:relative;
display:flex;
flex-direction: column;
align-items:flex-start;
justify-content: flex-start;
overflow:hidden;
flex-shrink:0;
max-height: ${props => props.isExtended ? "auto" : "150px"};
background-color: ${props => props.theme.Body.backgroundColor};
overflow-y: hidden;
position: relative;
&:before {
    content: "";
    position:absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    background: rgb(2,0,36);
    left: 0;
    height: 30px;
    background: linear-gradient(180deg, rgba(2,0,36,0) 0%, ${props => props.theme.Body.backgroundColor} 70%);
    font-size: 12px;
    padding: 5px 0px;
    cursor: pointer;
    color: ${props => props.theme.Body.TextColorLevels[3]};
    z-index: 1;
}
`


export const SubmittedCodeElem = (prop: { lang?: AcceptableLanguage | "shell", data: string }) => {
    const [isCopied, setIsCopied] = useState(false)
    const [IsActive, setIsActive] = useState(false)

    const copyText = (text: string) => {
        setIsCopied(true)
        copy(text)
        setTimeout(() => setIsCopied(false), 1000)
    }

    let lang: AcceptableLanguage | "shell" = "shell"
    if (typeof prop.lang !== "string") {
        lang = "shell"
    } else {
        lang = prop.lang
    }
    return <SubmittedCodeHolder
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        isExtended={false}>
        <CodeMirror
            editable={false}
            basicSetup={
                {
                    drawSelection: false,
                    lineNumbers: true,
                    autocompletion: false,
                    foldGutter: false,
                    searchKeymap: false,
                    highlightActiveLine: false,
                    highlightActiveLineGutter: false
                }
            }
            extensions={
                [
                    loadLanguage(lang)!
                ].filter(Boolean)
            }
            value={prop.data}
            theme={"dark"}
        />
        {IsActive ? <CopyBtn onClick={() => copyText(prop.data)}>
            {isCopied ? <TbCheck /> : <TbCopy />}
        </CopyBtn> : <></>}
    </SubmittedCodeHolder>
}