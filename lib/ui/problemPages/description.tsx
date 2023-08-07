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
import Image from "next/image";
import { useSelector } from "react-redux";
import { StateType } from "@/lib/store";
import { CodeElem } from "../component/codeElem";
import { AcceptableLanguage } from "@/lib/pref/languageLib";

const H2Elem = styled.h2`
padding-bottom: 10px;
margin-bottom: 10px;
border-bottom: solid 1px ${props => props.theme.Container.backgroundColor};
`

const isValidImgJson = (str: string) => {
    try {
        let g = JSON.parse(str);
        g["width"]
        g["height"]
        g["type"]
        g["alt"]
    } catch (e) {
        return false;
    }
    return true;
}

interface ImgDataJSON {
    alt: string
    width: number
    height: number
    type: "diagram" | "image"
}

const ImgElem = (props: any) => {
    const isDark = useSelector<StateType, boolean>(state => state.theme);
    if (!isValidImgJson(props.alt)) {
        return <></>
    }

    const ImgAbtJSON: ImgDataJSON = JSON.parse(props.alt)

    return (
        <Image src={props.src}
            alt={ImgAbtJSON["alt"]}
            width={ImgAbtJSON["width"]}
            height={ImgAbtJSON["height"]}
            style={{ objectFit: "contain" }}
        />
    )
}


const CodeText = styled.code`
    background-color: ${props => props.theme.Container.backgroundColor};
    border: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
    padding: 0px 2px;
    border-radius: 2px;
`


const InternalCodeElem = (prop: any) => {
    let lang: AcceptableLanguage | undefined
    if (typeof prop.children[0].props.className == "string") {
        lang = prop.children[0].props.className.match(/language-(\w+)/)[1]
    }
    return (
        <CodeElem lang={lang} data={prop.children[0].props.children[0]} />
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
                components: { pre: InternalCodeElem, img: ImgElem, h2: H2Elem, code: CodeText },
            })
            .process(props.mdData)
            .then((data) => {
                setMdSource(data.result);
            });
    }, [props])
    return (
        <>
            {markdownReact}
        </>
    )
}
