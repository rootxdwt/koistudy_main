import {
    useEffect, useState, createElement,
    Fragment,
} from "react"

import { BsCircle, BsXLg } from "react-icons/bs"
import { TbLetterT, TbCopy, TbCheck } from 'react-icons/tb'
import styled, { keyframes, ThemeProvider } from "styled-components"
import { Holder, Button } from "@/lib/ui/DefaultTemplate"
import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import { DarkTheme, LightTheme } from "@/lib/ui/theme"
import { GlobalStyle } from "@/lib/ui/DefaultTemplate"

import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeReact from "rehype-react";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import copy from 'copy-to-clipboard';

import { MongoClient } from 'mongodb'

const Internal = styled.div<{ rating: number }>`
width: 100%;
& h1 {
    color: ${props => props.theme.Body.TextColorLevels[0]};
}
& h2 {
    color: ${props => props.theme.Body.TextColorLevels[2]};
}
& h3 {
    color: ${props => props.theme.Body.TextColorLevels[2]};
}
& h3.tch3 {
    color: ${props => props.theme.Body.TextColorLevels[2]};
    font-size: 14px;
    margin-left:0;
}
& p {
    color: ${props => props.theme.Body.TextColorLevels[3]};
    line-height: 30px;
}
& p.grad {
    font-size: 9pt;
    color: ${props => props.theme.Body.TextColorLevels[3]};
    text-align: center;
    margin: 0;
    text-align:left;
    width: 50px;
    background: ${props => props.rating < 4 ? "linear-gradient(90deg, rgba(46,214,126,1) 0%, rgba(26,115,189,1) 100%)" : "linear-gradient(90deg, rgba(214,123,46,1) 0%, rgba(170,189,26,1) 100%)"};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 18px;
  }
  p.min {
    font-size: 9pt;
    margin:0;
    color: ${props => props.theme.Body.TextColorLevels[3]};
    line-height: 18px;
  }
  & .tags {
    display:flex;
    margin-top: 20px;
  }
`

const Itm = styled.div`
padding: 5px 15px;
background-color: ${props => props.theme.Button.backgroundColor};
margin-right: 20px;
border-radius: 10px;
`


const Submission = styled.div`
width: 100%;
height: 50px;
display:flex;
align-items: center;
justify-content: flex-start;
margin-bottom: 100px;
`

const CodeEditArea = styled.div`
position:relative;
display;flex;
overflow: hidden;
margin-top: 20px;
& textarea {
    position:absolute;
    background-color: transparent;
    border:none;
    width: 100%;
    color:transparent;
    padding: 0.5em;
    font-family: monospace;
    caret-color: white;
    resize: none;
    white-space: pre;
}
& textarea:focus {
    outline:none;
}
& pre {
    height: 300px;
}
`

const LangSelector = styled.div`
display:flex;
margin-top: 20px;

`

const LangBtn = styled.div<{ isActive: boolean }>`
cursor:pointer;
margin-right: 20px;
color: ${props => props.isActive ? props.theme.Body.TextColorLevels[0] : props.theme.Body.TextColorLevels[3]};
`

const Submitted = styled.div`
position:fixed;
z-index:2;
width: 100vw;
height: 100vh;
backdrop-filter: hue(0.1);
display:flex;
align-items:center;
justify-content:center;
top:0;
left:0;
color: ${props => props.theme.Body.backgroundColor};
background-color: rgba(0,0,0,.7);
`

const Showresult = keyframes`
0%{
    bottom: -100px;
}
100%{
    bottom: -0px;
}
`

const SubmissionResult = styled.div<{ isExtended: boolean, tcLength: number, isCorrect: boolean }>`
position:fixed;
bottom:0;
width: 800px;
display:flex;
@media(max-width: 1300px) {
    width: 700px;
}
@media (max-width: 900px) {
    width: 80vw;
}
@media (max-width: 700px) {
    width: 80vw;
    left: 10vw;
}
flex-direction: column;
align-items:flex-start;
background-color:${props => props.theme.Body.backgroundColor};
animation: ${Showresult} 0.5s cubic-bezier(.5,0,.56,.99);
height: ${props => props.isExtended ? props.tcLength * 45 + 120 + "px" : "60px"};
cursor:pointer;
outline:none;
-webkit-tap-highlight-color: rgba(0,0,0,0);
transition: height 0.5s cubic-bezier(.5,0,.56,.99);

& h3 {
    margin:0;
    color: ${props => props.theme.Title.textColor};
    font-size: 12pt;
    width: 100px;
    margin-left: 10px;
}
& .circle {
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: ${props => props.isCorrect ? "#48bd5f" : "#bd4848"};
}
& p {
    margin:0;
    font-size: 10pt;
}
& .top {
    height: 60px;
    display:flex;
    flex-direction:row;
    justify-content: space-between;
    align-items:center;
    width: 100%;
}
& .top .tHolder {
    display:flex;
    flex-direction: row;
    align-items:center;

}
& .btm {
    transition: height 0.5s cubic-bezier(.5,0,.56,.99);
    height:${props => props.isExtended ? props.tcLength * 45 + 60 + "px" : "0px"};
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

const submitCode = async (lang: String, code: string, num: number) => {
    const obj = JSON.stringify({ Lang: lang, Code: code })
    return await (await fetch(`/api/judge/${num}`, { method: "POST", body: obj, headers: { "Content-type": "application/json" } })).json()
}

interface JudgeResponse {
    errorStatement: string
    matchedTestCase: Array<{ matched: boolean, tle: boolean }>
    status: "Success" | "Error"
}

const TCholder = styled.div`
margin-top: 10px;
`

const TcItm = styled.div<{ isRight: boolean }>`
padding: 0px 20px;
display:flex;
justify-content: space-between;
color: ${props => props.theme.Body.TextColorLevels[3]};
background-color: ${props => props.theme.Container.backgroundColor};
border-bottom: solid 2px ${props => props.theme.Body.backgroundColor};
height: 43px;
display:flex;
align-items:center;
& .TCtitle {
    font-weight:normal;
    color: ${props => props.theme.Body.TextColorLevels[1]};
    font-size: 10pt;
}
& .TCwr {
    color: ${props => props.theme.Body.TextColorLevels[0]};
    font-size:10pt;
}
&:nth-child(1){
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}
`

const CodeHolder = styled.div`
padding: 10px 0px;
border-radius: 10px;
position:relative;
display:flex;
align-items:center;

`

const CopyBtn = styled.span`
position:absolute;
right: 0px;
top: 10px;
background-color: ${props => props.theme.Button.backgroundColor};
width: 30px;
height: 30px;
border-radius: 10px;
color: ${props => props.theme.Body.TextColorLevels[3]};
cursor: pointer;
display:flex;
align-items:center;
justify-content:center;
&:hover{
    color: ${props => props.theme.Body.TextColorLevels[0]};
}
`

const CodeElem = (prop: any) => {
    const [isCopied, setIsCopied] = useState(false)

    const copyText = (text: string) => {
        setIsCopied(true)
        copy(text)
        setTimeout(() => setIsCopied(false), 1000)
    }

    let lang: "cpp" | "python" | "go" | "shell" = "shell"
    if (typeof prop.children[0].props.className == "string") {
        lang = prop.children[0].props.className.match(/language-(\w+)/)[1]
    }
    return <CodeHolder>
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
                    loadLanguage(lang)!
                ].filter(Boolean)
            }
            value={prop.children[0].props.children[0]}
            theme={"dark"}
        /><CopyBtn onClick={() => copyText(prop.children[0].props.children[0])}>
            {isCopied ? <TbCheck /> : <TbCopy />}
        </CopyBtn>
    </CodeHolder>
}

export default function Problem(data: any) {
    const { ProblemCode, ProblemName, Script, SupportedLang, rating, solved } = data.Oth
    const [loaded, setLoadState] = useState<boolean>()
    const [currentCodeType, setCodeType] = useState(SupportedLang[0])
    const [isSubmitShowing, setSubmitShowState] = useState(false)
    const [contextData, setContextData] = useState<JudgeResponse>()
    const [isResultExtended, setExtended] = useState(false)

    const [currentCodeData, setCodeData] = useState<string>("")
    const [markdownReact, setMdSource] = useState(<></>);

    const detCode = async (t: string, c: string) => {
        setSubmitShowState(true)
        var jsn = await submitCode(t, c, ProblemCode)
        if (jsn) {
            setSubmitShowState(false)
            setContextData(jsn)
        }
    }
    useEffect(() => {
        unified()
            .use(remarkParse)
            .use(remarkMath)
            .use(remarkRehype)
            .use(rehypeSlug)
            .use(rehypeKatex)
            .use(rehypeReact, {
                createElement,
                Fragment,
                components: { pre: CodeElem },
            })
            .process(Script)
            .then((data) => {
                setMdSource(data.result);
                setLoadState(true)
            });
    }, [])
    return (
        <ThemeProvider theme={DarkTheme}>
            <GlobalStyle />
            {loaded ?
                <>
                    <Holder>
                        {isSubmitShowing ?
                            <Submitted />
                            :
                            <></>
                        }
                        <Internal rating={rating}>
                            <h1>{ProblemName}</h1>
                            <div className="tags">
                                <Itm>
                                    <p className="grad">Rating {rating}</p>
                                </Itm>
                                <Itm>
                                    <p className="min">{solved} solved</p>
                                </Itm>
                            </div>

                            {markdownReact}
                            <h1>
                                Submit
                            </h1>
                            <LangSelector>
                                {SupportedLang.map((elem: string, index: number) => {
                                    return (
                                        <LangBtn
                                            onClick={() => setCodeType(elem)}
                                            isActive={elem === currentCodeType}
                                            key={index}
                                        >
                                            {elem.charAt(0).toUpperCase() + elem.slice(1)}
                                        </LangBtn>
                                    )
                                })}
                            </LangSelector>
                            <CodeEditArea>
                                <CodeMirror
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
                                            loadLanguage(currentCodeType)!
                                        ].filter(Boolean)
                                    }
                                    onChange={(v, _) => setCodeData(v)}
                                    theme={"dark"}
                                    placeholder={"Submit your code"}
                                    height={"300px"}
                                />
                            </CodeEditArea>

                            {contextData && !isSubmitShowing ?
                                <SubmissionResult
                                    isExtended={isResultExtended}
                                    tcLength={contextData.matchedTestCase.length}
                                    isCorrect={contextData.matchedTestCase.length === contextData.matchedTestCase.filter(items => items.matched == true).length && contextData.status == "Success"}
                                    onClick={() => { if (contextData.errorStatement == "NONE") setExtended(!isResultExtended) }}
                                >
                                    <div className="top">
                                        <div className="tHolder">
                                            <span className="circle"></span><h3>{contextData.status}</h3>
                                        </div>
                                        <p>{contextData.status == "Error" ? contextData.errorStatement == "CE" ? "컴파일 에러가 발생했습니다" : contextData.errorStatement == "ISE" ? "실행에 실패했습니다" : "테스트 케이스 오류" : "맞았습니다"}</p>
                                    </div>
                                    <div className="btm">
                                        <h3 className="tch3">Test Cases</h3>
                                        <p className="ptge">{(contextData.matchedTestCase.filter(itm => itm.matched == true).length / contextData.matchedTestCase.length) * 100}%</p>
                                        <TCholder>
                                            {contextData.matchedTestCase.map((elem, index) => {
                                                return (
                                                    <TcItm isRight={elem.matched} key={index}>
                                                        <div className="TCtitle">{index}</div>
                                                        <div className="TCwr">{elem.matched ? <BsCircle /> : elem.tle ? <TbLetterT /> : <BsXLg />}</div>
                                                    </TcItm>
                                                )
                                            })}
                                        </TCholder>
                                    </div>
                                </SubmissionResult> : <></>}
                            <Submission><Button onClick={() => detCode(currentCodeType, currentCodeData)}><p>Submit</p></Button></Submission>

                        </Internal>
                    </Holder></> : <></>}
        </ThemeProvider>
    )
}

export const getServerSideProps = async (context: any) => {
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);

    const db = client.db("main");
    const collection = db.collection('Problems');
    await client.connect();
    const { id } = context.query;

    try {
        if (typeof id == "string") {
            const findDC = await collection.findOne({ ProblemCode: parseInt(id) })
            const { TestProgress, ...Oth } = JSON.parse(JSON.stringify(findDC))
            return {
                props: { Oth }
            };
        } else {
            return {
                notFound: true,
            };
        }
    } catch (e) {
        return {
            notFound: true,
        };
    }
};
