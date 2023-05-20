import styled from "styled-components";
import {
    useEffect, useState, createElement,
    Fragment,
} from "react"

import remarkRehype from "remark-rehype";
import { unified } from "unified";
import remarkParse from "remark-parse";
import rehypeReact from "rehype-react";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import copy from 'copy-to-clipboard';
import { TbCopy, TbCheck } from 'react-icons/tb'
import { AiOutlineStar, AiFillStar } from 'react-icons/ai'
import CodeMirror from "@uiw/react-codemirror";
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import Image from "next/image";
import { useSelector } from "react-redux";
import { StateType } from "@/lib/store";

const DescHolder = styled.div`
display:flex;
flex-direction:column;
padding-bottom: 60px;
width:100%;
overflow-y:scroll;
padding-right:20px;
@media (max-width: 700px) {
    padding-right:0;
}
`


const CodeHolder = styled.div`
padding: 10px;
border-radius: 10px;
position:relative;
display:flex;
align-items:center;
overflow:hidden;
flex-shrink:0;
background-color: ${props => props.theme.Container.backgroundColor};

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

const H2Elem = styled.h2`
padding-bottom: 10px;
margin-bottom: 10px;
`

const ImgElem = (props: any) => {
    const isDark = useSelector<StateType, boolean>(state => state.theme);
    return (
        <img src={props.src} alt={props.alt} style={{ objectFit: "contain", filter: props.alt == "bwDiagram" && isDark ? "invert(1)" : "invert(0)" }} />
    )
}

const CodeElem = (prop: any) => {
    const [isCopied, setIsCopied] = useState(false)
    const [IsActive, setIsActive] = useState(false)

    const copyText = (text: string) => {
        setIsCopied(true)
        copy(text)
        setTimeout(() => setIsCopied(false), 1000)
    }

    let lang: "cpp" | "python" | "go" | "shell" | "php" | "swift" | "javascript" = "shell"
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

const Itm = styled.div<{ rating?: number }>`
padding: 2px 15px;
margin-right: 20px;
border-radius: 5px;
background-color: ${props => props.theme.Container.backgroundColor};
font-family: 'Poppins',sans-serif;
& p{
    font-size: 11px!important;
}
& p.grad {
    color: ${props => props.theme.Body.TextColorLevels[3]};
    text-align: center;
    margin: 0;
    text-align:left;
    background: ${props => props.rating && props.rating < 4 ? "linear-gradient(90deg, rgb(107,157,248) 0%, rgb(131,81,246) 100%)" : "linear-gradient(90deg, rgba(214,123,46,1) 0%, rgba(170,189,26,1) 100%)"};
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
& p.min {
    margin:0;
    color: ${props => props.theme.Body.TextColorLevels[3]};
  }
`

const TPBtn = styled.div`

    width: 29px;
    height: 29px;

    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 5px;
    color: ${props => props.theme.Body.TextColorLevels[2]};
    background-color: ${props => props.theme.Container.backgroundColor};
    &:hover {
        background-color: ${props => props.theme.Button.backgroundColor};
        &::after {
        position:absolute;
        content: "북마크";
        margin-top: 65px;
        font-size: 10px;
        background-color: ${props => props.theme.Container.backgroundColor};
        padding: 4px 10px;
        border-radius: 4px;
    }
    }
`

const FavBtn = (props: { problemId: number }) => {
    const [isFav, setFavState] = useState(false)
    const toggleFav = () => {
        fetch(`/api/user/favorites/${props.problemId}`, { method: isFav ? "DELETE" : "POST", headers: { Authorization: localStorage.getItem("tk")! } })
            .then((resp) => resp.json())
            .then((data) => { if (data.status) setFavState(!isFav) })
    }
    useEffect(() => {
        fetch(`/api/user/favorites/${props.problemId}`, { method: "GET", headers: { Authorization: localStorage.getItem("tk")! } })
            .then((resp) => resp.json())
            .then((data) => { if (data.added) setFavState(true) })
    }, [])
    return (
        <TPBtn onClick={toggleFav}>
            {isFav ? <AiFillStar /> : <AiOutlineStar />}
        </TPBtn>
    )
}


export const Description = (props: { mdData: string, problemName: string, solved: number, rating: number, id: number }) => {
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
                components: { pre: CodeElem, img: ImgElem, h2: H2Elem },
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
                <Itm rating={props.rating}>
                    <p className="grad">Rating {props.rating}</p>
                </Itm>
                <Itm rating={props.rating}>
                    <p className="min">{props.solved} solved</p>
                </Itm>
                <FavBtn problemId={props.id} />
            </div>
            {markdownReact}
        </DescHolder>
    )
}