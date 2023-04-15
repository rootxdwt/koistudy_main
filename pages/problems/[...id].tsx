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
import { HiOutlineDotsVertical } from 'react-icons/hi'
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeReact from "rehype-react";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import copy from 'copy-to-clipboard';
import { Header } from "@/lib/ui/header"

import { useSelector } from 'react-redux';
import { StateType } from "@/lib/store"
import { MongoClient } from 'mongodb'
import { useRouter } from "next/router"
import { DropDownMenu } from "@/lib/ui/DefaultTemplate"
import sanitize from "mongo-sanitize"
import Head from "next/head"
import { FiChevronDown } from 'react-icons/fi'
const CodeHolder = styled.div`
padding: 10px 0px;
border-radius: 10px;
position:relative;
display:flex;
align-items:center;
overflow:hidden;
flex-shrink:0;

`

const CopyBtn = styled.span`
position:absolute;
right: 0px;
top: 10px;
width: 30px;
height: 30px;
border-radius: 10px;
color: ${props => props.theme.Body.TextColorLevels[3]};
background-color: ${props => props.theme.Container.backgroundColor};
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
    const [IsActive, setIsActive] = useState(false)

    const copyText = (text: string) => {
        setIsCopied(true)
        copy(text)
        setTimeout(() => setIsCopied(false), 1000)
    }

    let lang: "cpp" | "python" | "go" | "shell" = "shell"
    if (typeof prop.children[0].props.className == "string") {
        lang = prop.children[0].props.className.match(/language-(\w+)/)[1]
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
                    loadLanguage(lang)!
                ].filter(Boolean)
            }
            value={prop.children[0].props.children[0]}
            theme={"dark"}
        />
        {IsActive ? <CopyBtn onClick={() => copyText(prop.children[0].props.children[0])}>
            {isCopied ? <TbCheck /> : <TbCopy />}
        </CopyBtn> : <></>}
    </CodeHolder>
}


//aa

const CodeEditArea = styled.div`
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

const SubmitHolder = styled.div.attrs<{ currentWidth: number }>(props => ({
    style: {
        minWidth: props.currentWidth,
        maxWidth: props.currentWidth
    }
}))`
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

const CodeSubmit = (props: { submitFn: Function, SupportedLang: Array<"go" | "cpp" | "python" | "javascript" | "typescript" | "swift">, }) => {
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
            <CodeEditArea>
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
                    placeholder={"Submit your code"}
                />
            </CodeEditArea>
            <Submission><Button onClick={() => props.submitFn(currentCodeType, currentCodeData)}>submit</Button></Submission>
        </SubmitHolder >

    )
}

const DescHolder = styled.div`
display:flex;
flex-direction:column;
padding-bottom: 60px;
width:100%;
overflow:scroll;
padding-right:20px;
@media (max-width: 700px) {
    padding-right:0;
}
`

const Description = (props: { mdData: string, problemName: string, solved: number, rating: number }) => {
    const [markdownReact, setMdSource] = useState(<></>);
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
            .process(props.mdData)
            .then((data) => {
                setMdSource(data.result);
            });
    }, [])
    return (

        <DescHolder>
            <h1>{props.problemName}</h1>
            <div className="tags">
                <Itm>
                    <p className="grad">Rating {props.rating}</p>
                </Itm>
                <Itm>
                    <p className="min">{props.solved} solved</p>
                </Itm>
            </div>
            {markdownReact}
        </DescHolder>
    )
}


//aa

const ShowSub = keyframes`
0%{
    opacity:0;
}
100%{
    opacity:1;
}
`

const Submitted = styled.div`
position:fixed;
z-index:11;
width: 100vw;
height: 100vh;
backdrop-filter: hue(0.1);
display:flex;
align-items:center;
justify-content:center;
top:0;
left:0;
animation: ${ShowSub} 0.2s cubic-bezier(.5,0,.56,.99);
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
width: 1300px;
@media(max-width: 1800px) {
    width: 1200px;
  }
  @media(max-width: 1700px) {
    width: 1100px;
  }
  @media(max-width: 1500px) {
    width: 1000px;
  }
  @media(max-width: 1300px) {
    width: 900px;
  }
  @media(max-width: 1200px) {
    width: 800px;
  }
  @media(max-width: 900px) {
    width: 80vw;
  }
  @media (max-width: 700px) {
    width: 80vw;
    left: 10vw;
}
display:flex;
z-index:2;
flex-direction: column;
align-items:flex-start;
background-color:${props => props.theme.Body.backgroundColor};
animation: ${Showresult} 0.5s cubic-bezier(.5,0,.56,.99);
height: ${props => props.isExtended ? props.tcLength * 45 + 120 + "px" : "60px"};
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
    margin-right: 10px;
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
const Internal = styled.div<{ rating: number }>`
width: 100%;
height:calc(100vh - 70px);
display:flex;
@media (max-width: 700px) {
    height:auto;
    flex-direction:column;
}
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
    position: sticky;
    top: 0px;
    background-color: ${props => props.theme.Body.backgroundColor};
    width: 100%;
    padding-bottom: 10px;
}
& p {
    color: ${props => props.theme.Body.TextColorLevels[3]};
    line-height: 25px;
    font-size:14px;
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
padding: 5px 0px;
margin-right: 20px;
border-radius: 10px;
`


const submitCode = async (lang: String, code: string, num: number) => {
    const obj = JSON.stringify({ Lang: lang, Code: code })
    return await (await fetch(`/api/judge/${num}`, { method: "POST", body: obj, headers: { "Content-type": "application/json" } })).json()
}

interface JudgeResponse {
    errorStatement: string
    matchedTestCase: Array<{ matched: boolean, tle: boolean, lim: number }>
    status: "Success" | "Error"
}

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
& .TCtitle {
    font-weight:normal;
    color: ${props => props.theme.Body.TextColorLevels[1]};
    font-size: 10pt;
}
& .TCwr {
    color: ${props => props.theme.Body.TextColorLevels[0]};
    font-size:10pt;
}
border-radius:5px;
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
    font-size: 10pt;
    color: ${props => props.theme.Body.TextColorLevels[2]};
}
& p {
    font-size: 10pt;
    margin-left: 10px;
}

`


export default function Problem(data: any) {
    const { ProblemCode, ProblemName, Script, SupportedLang, rating, solved } = data.Oth
    const [loaded, setLoadState] = useState<boolean>()
    const [isSubmitShowing, setSubmitShowState] = useState(false)
    const [contextData, setContextData] = useState<JudgeResponse>()
    const [isResultExtended, setExtended] = useState(false)
    const [caseDetail, setCaseDetail] = useState<number>(0)

    const router = useRouter()


    useEffect(() => {
        setLoadState(true)
    }, [])
    const isDark = useSelector<StateType, boolean>(state => state.theme);

    const detCode = async (t: string, c: string) => {
        setSubmitShowState(true)
        var jsn = await submitCode(t, c, ProblemCode)
        if (jsn) {
            setSubmitShowState(false)
            setContextData(jsn)
        }
    }
    return (
        <>
            <Head>
                <meta content={isDark ? "dark" : "light"} name="color-scheme" />
            </Head>
            <ThemeProvider theme={isDark ? DarkTheme : LightTheme}>
                <Header at={
                    [
                        { name: "description", action: () => router.push(`${router.query.id![0]}/description`) },
                        { name: "discussion", action: () => router.push(`${router.query.id![0]}/discussion`) },
                        { name: "submisson", action: () => router.push(`${router.query.id![0]}/submisson`) },
                        { name: "champion", action: () => router.push(`${router.query.id![0]}/champion`) }
                    ]
                }
                    currentPage={router.query.id![1]}
                />
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

                                {router.query.id![1] == "description" ?
                                    <>
                                        <Description
                                            mdData={Script}
                                            problemName={ProblemName}
                                            solved={solved}
                                            rating={rating}
                                        />
                                    </>
                                    :
                                    router.query.id![1] == "discussion"
                                        ?
                                        <>
                                        </>
                                        :
                                        router.query.id![1] == "champion"
                                            ?
                                            <>

                                            </>
                                            :
                                            <>

                                            </>
                                }
                                <CodeSubmit
                                    SupportedLang={SupportedLang}
                                    submitFn={(a: string, b: string) => detCode(a, b)}
                                ></CodeSubmit>
                                {contextData && !isSubmitShowing ?

                                    <SubmissionResult
                                        isExtended={isResultExtended}
                                        tcLength={contextData.matchedTestCase.length > 5 ? 5 : contextData.matchedTestCase.length}
                                        isCorrect={contextData.matchedTestCase.length === contextData.matchedTestCase.filter(items => items.matched == true).length && contextData.status == "Success"}
                                    >
                                        <div className="top" onClick={() => { if (contextData.errorStatement == "NONE") setExtended(!isResultExtended) }}>
                                            <div className="tHolder">
                                                <span className="circle"></span><h3>{contextData.status}</h3>
                                            </div>
                                            <div className="mHolder">
                                                <p>{contextData.status == "Error" ? contextData.errorStatement == "CE" ? "컴파일 에러가 발생했습니다" : contextData.errorStatement == "ISE" ? "실행에 실패했습니다" : "틀렸습니다" : "맞았습니다"} </p>
                                                <p className="icon">
                                                    <FiChevronDown />
                                                </p>
                                            </div>

                                        </div>
                                        <div className="btm">
                                            <h3 className="tch3">Test Cases</h3>
                                            <p className="ptge">{(contextData.matchedTestCase.filter(itm => itm.matched == true).length / contextData.matchedTestCase.length) * 100}%</p>
                                            <TCholder>
                                                {contextData.matchedTestCase.map((elem, index) => {
                                                    return (
                                                        <Fragment key={index} >
                                                            <TcItm isRight={elem.matched} onClick={(e) => { setCaseDetail(caseDetail == index ? -1 : index) }} isShown={caseDetail == index}>
                                                                <div className="TCtitle">{index}</div>
                                                                <div className="TCwr">{elem.matched ? <BsCircle /> : elem.tle ? <TbLetterT /> : <BsXLg />}</div>
                                                            </TcItm>
                                                            <Details isShown={caseDetail == index}>
                                                                <span>
                                                                    <b>
                                                                        시간제한:
                                                                    </b>
                                                                    <p>
                                                                        {elem.lim}ms
                                                                    </p>
                                                                </span>
                                                                <span>
                                                                    {elem.matched ? <BsCircle /> : elem.tle ? <TbLetterT /> : <BsXLg />}
                                                                    <p>

                                                                        {elem.matched ? "맞았습니다" : elem.tle ? "시간 제한 초과" : "테스트 케이스 불일치"}
                                                                    </p>

                                                                </span>
                                                            </Details>
                                                        </Fragment>
                                                    )
                                                })}
                                            </TCholder>
                                        </div>
                                    </SubmissionResult>
                                    :
                                    <></>}
                            </Internal>
                        </Holder></> :
                    <></>
                }
            </ThemeProvider>

        </>)
}

export const getServerSideProps = async (context: any) => {
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);

    const db = client.db("main");
    const collection = db.collection('Problems');
    await client.connect();
    const { id } = context.query;

    if (["description", "discussion", "submisson", "champion"].indexOf(id[1]) == -1) {
        return {
            notFound: true,
        };
    }

    try {
        if (typeof id[0] == "string") {
            const findDC = await collection.findOne({ ProblemCode: parseInt(sanitize(id[0])) })
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
