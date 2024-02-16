import {
    useCallback,
    useEffect, useRef, useState,
    MutableRefObject
} from "react"

import styled, { keyframes, ThemeProvider, createGlobalStyle } from "styled-components"
import { Holder } from "@/lib/ui/DefaultComponent"
import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import { Header } from "@/lib/ui/component/problem_header"

import { useSelector } from 'react-redux';
import { StateType } from "@/lib/store"
import { useRouter } from "next/router"
import sanitize from "mongo-sanitize"
import Head from "next/head"

import { useDispatch } from "react-redux"
import { Description } from "@/lib/ui/problemPages/description"
import { Champion } from "@/lib/ui/problemPages/champion"
import { SubmissionPage } from "@/lib/ui/problemPages/submission"
import { CodeEditArea } from "@/lib/ui/component/codeEdit"
import mongoose from "mongoose"
import ProblemModel from "../../lib/schema/problemSchema"
import TagsModel from "../../lib/schema/tags"
import { AiOutlineStar, AiFillStar } from 'react-icons/ai'
import { AcceptableLanguage } from "@/lib/pref/languageLib"
import dbConnect from "@/lib/db_connection"

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

const InitialHolder = styled(Holder)`
    width: 100%;
`


const Internal = styled.div<{ rating: number }>`
width: 100%;
margin-left:auto;
margin-right: auto;
height:calc(100vh - 40px);
display:flex;
overflow:hidden;
@media(max-width: 900px) {
    width: 100%;
}
@media (max-width: 770px) {
    height:auto;
    flex-direction:column;
    width: 90vw;
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
`

const DescHolder = styled.div`
margin: 0;
padding: 0;
padding-left: 2.5vw;
display:flex;
flex-direction:column;
width:100%;
height: 100%;
overflow-y:auto;
padding-right:20px;

@media (max-width: 770px) {
    padding-left: 0;
    padding-right:0;
}
`


const submitCode = async (lang: String, code: string, num: number) => {
    const obj = JSON.stringify({ Lang: lang, Code: code })
    const tk = localStorage.getItem("tk") || ""
    const resp = await fetch(`/api/judge/${num}`, { method: "POST", body: obj, headers: { "Content-type": "application/json", "Authorization": tk } })
    if (resp.status == 429) {
        throw new Error("toomanyreq")
    }
    if (resp.status == 401) {
        throw new Error("unauthorized")
    }
    if (!resp.ok) {
        throw new Error("httperror")
    }
    return await resp.json()
}




interface ProblemDataProp {
    mdData: string
    problemName: string
    solved: number
    rating: number
    id: number
    supportedLang: Array<AcceptableLanguage>
    currentPage: string
    tags: Array<{ Name: string, Color: string, Type: string }>

}


const Titleholder = styled.div`
    display:flex;
    flex-direction: row;
    align-items: center;
    margin-top: 40px;
    padding-top: 20px;
    padding-bottom: 15px;
    width: 100%;
    & h1 {
        margin:0;
        margin-right: 20px;
        font-size: 22px;
        font-weight: bold;
    }
`



const ProbInfo = styled.div`
    display:flex;
    margin-left: auto;
    border-radius: 10px;
    align-items:center;

`

const SolvedIndicator = styled.div`
    width: 29px;
    height: 27px;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 5px;
    color: ${props => props.theme.Body.TextColorLevels[2]};
    border: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
    background-color: ${props => props.theme.Header.BgColor};
    margin-right: 10px;
`

const TPBtn = styled(SolvedIndicator)`
    width: auto;
    display: flex;
    justify-content: space-around;
    padding: 0px 8px;
    & p {
        font-size: 11px;
        margin: 0;
        margin-left: 5px;
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
            .then((data) => { if (data.added) { setFavState(true) } else setFavState(false) })
    }, [props.problemId])

    return (
        <TPBtn onClick={toggleFav}>
            {isFav ? <AiFillStar /> : <AiOutlineStar />}
            <p>{isFav ? "즐겨찾기됨" : "즐겨찾기"}</p>
        </TPBtn>
    )
}



const PageNav = styled.div<{ isSticked?: boolean }>`
    z-index:999;
    position: sticky;
    font-family: "Noto Sans KR", sans-serif;
    font-weight: 700;
    display: flex;
    align-items:center;
    top: -1px;
    padding-left: ${props => props.isSticked?`2.5vw`:`0px`};
    margin: ${props => props.isSticked?`0px -20px 0px -2.5vw`:`0px`};
    z-index:1000;
    padding-top:.5px;
    padding-bottom:.5px;
    background-color: ${props => props.isSticked?props.theme.Header.BgColor:`transparent`};
    margin-top: 20px;
    margin-bottom: 10px;
    border-bottom: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};

    @media(max-width: 770px) {
        background-color: transparent;
        position: relative;
        top: 0px;
    }
`

const PageBtn = styled.div<{ isActive: boolean }>`
    margin: 0;
    padding: 0px;
    margin-right: 60px;
    padding: 4px 0px;
    white-space: nowrap;
    cursor: pointer;
    & p {
        color: ${props=>props.isActive? props.theme.Body.TextColorLevels[0]:props.theme.Body.TextColorLevels[3]};
        transition: background-color 0.1s ease-in-out;
        margin: 0;
        font-size: 12px;
        padding: 0;
        border-radius: 5px;
        line-height: 20px;
        &:hover {
            color:${props=>props.theme.Body.TextColorLevels[0]};
        }
    }
`
const SolvedCount = styled.span<{ isSolved: boolean }>`
    font-size:9px;
    padding: 0px 5px;
    margin-left:10px;
    border-radius: 10px;
    background-color: ${props => props.isSolved ? "#48bd5f" : props.theme.Body.TextColorLevels[3]};
    color:  ${props => props.theme.Body.backgroundColor};
    position: relative;
    z-index: 2;
    
`

const Tags = styled.ul`
list-style-type: none;
display: flex;
padding:0;
margin-top:10px;
margin-bottom:20px;
align-items:center;
color: ${props=>props.theme.Body.TextColorLevels[2]};
border-top: solid 1px ${props=>props.theme.Body.ContainerBgLevels[1]};
& p{
    font-size: 13px;
    margin-right: 20px;
}

`

const TagItm = styled.li<{ color: string }>`

font-size: 10px;
padding: 4px 11px;
margin-right: 7px;
border-radius: 12px;
background-color: ${props => props.color ? props.color + "19" : props.theme.Body.ContainerBgLevels[2]};
color: ${props => props.color ? props.color : props.theme.Body.TextColorLevels[3]};
position: relative;
display:flex;
align-items:center;
`
const LineIndicator = styled.div`
border-left:solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
height: 15px;
margin: 0px 8px;
margin-right:15px;
`
const ProblemPageHandler = (props: ProblemDataProp) => {
    const router = useRouter()
    const { currentPage, mdData, problemName, solved, rating, id, supportedLang, tags } = props
    const [isSticky, setIsSticky] = useState(false)

    const stickyHeaderRef = useRef() as MutableRefObject<HTMLDivElement>
    useEffect(() => {
        const cachedRef = stickyHeaderRef.current,
            observer = new IntersectionObserver(
                ([e]) => {console.log(e);setIsSticky(!e.isIntersecting)},
                { threshold: [1] }
            )

        observer.observe(cachedRef)

        return () => {
            observer.unobserve(cachedRef)
        }
    }, [])
    const [submissionData, setsubmisstionData] = useState<{ isSolved: boolean, dataLength: number }>()
    useEffect(() => {
        fetch(`/api/user/problem/${id}/count`, { headers: { authorization: localStorage.getItem("tk")! } }).then(
            (resp) => {
                if (resp.ok) {
                    return resp.json()
                }
            }).then(
                (data) => {
                    setsubmisstionData(data)
                })
    }, [id, currentPage])
    return (
        <DescHolder>
            <Titleholder>
                <h1>{problemName}</h1>
                <ProbInfo>
                    <FavBtn problemId={id} />
                </ProbInfo>
            </Titleholder>
            <PageNav ref={stickyHeaderRef} isSticked={isSticky}>
                <PageBtn isActive={currentPage == "description"} onClick={() => router.push(`${router.query.id![0]}/description`)}>
                    <p>설명</p></PageBtn>
                <PageBtn isActive={currentPage == "submission"} onClick={() => router.push(`${router.query.id![0]}/submission`)}>
                    <p>
                        제출
                        {typeof submissionData !== "undefined" ? <SolvedCount isSolved={submissionData.isSolved}>
                            {submissionData.dataLength}
                        </SolvedCount> : <></>}
                    </p>
                </PageBtn>
                <PageBtn isActive={currentPage == "champion"} onClick={() => router.push(`${router.query.id![0]}/champion`)}><p>문제 통계</p></PageBtn>
            </PageNav>
            {currentPage == "description" ? <>
                <Description
                    mdData={mdData}
                    problemName={problemName}
                    solved={solved}
                    rating={rating}
                    id={id}
                />
                            <Tags>
                                <p>
                                태그: 
                                </p>
                {tags.filter((elem) => elem.Type == "category").map((elem, index) => {
                    return (
                        <>
                            <TagItm key={elem.Name} color={elem.Color}>{elem.Name}</TagItm>
                            {tags.filter((elem) => elem.Type != "category").length > 0 ? <LineIndicator /> : <></>}

                        </>
                    )
                })}
                {tags.filter((elem) => elem.Type != "category").map((elem, index) => {
                    return (
                        <>
                            <TagItm key={elem.Name} color="">{elem.Name}</TagItm>
                        </>
                    )
                })}
            </Tags>
            </> : currentPage == "submission" ? <SubmissionPage id={id} supportedLang={supportedLang} dataLength={submissionData?.dataLength} /> : currentPage == "champion" ? <Champion /> : <></>}
        </DescHolder>
    )
}

const LocalGlobal = createGlobalStyle`
    body,html {
        overflow:hidden!important;
        height: 100vh;
    }
    @media (max-width: 770px) {
	body,
	html {
		overflow: auto!important;
        height: auto;
	}
}
`

export default function Problem(data: any): JSX.Element {
    const { ProblemCode, ProblemName, Script, SupportedLang, rating, solved, navigatable, tags } = data
    const [isJudging, setIsJudging] = useState(false)
    const [contextData, setContextData] = useState<any | undefined>()
    const InternalRef = useRef<any>()

    const router = useRouter()
    const dispatch = useDispatch()

    const isDark = useSelector<StateType, boolean>(state => state.theme.isDarkTheme);

    useEffect(() => {
        setContextData(undefined)
        setIsJudging(false)
    }, [ProblemCode])

    const getParentWidth = useCallback(() => {
        return InternalRef.current.getBoundingClientRect().width
    }, [InternalRef])
    return (
        <>
            <Head>
                <meta content={isDark ? "dark" : "light"} name="color-scheme" />
                <title>
                    {ProblemName + " - 코이스터디"}
                </title>
            </Head>
            <Header
                forwardNavigatable={navigatable[0] ? { target: parseInt(ProblemCode) - 1 } : undefined}
                backwardNavigatable={navigatable[1] ? { target: parseInt(ProblemCode) + 1 } : undefined}
            />
            <LocalGlobal />
            <GlobalStyle />
            <>
                <InitialHolder>
                    <Internal rating={rating} ref={InternalRef}>
                        <ProblemPageHandler currentPage={router.query.id![1]} mdData={Script} problemName={ProblemName} solved={solved} rating={rating} id={parseInt(router.query.id![0])} supportedLang={SupportedLang} tags={tags} />
                        <CodeEditArea
                            SupportedLang={SupportedLang}
                            probNo={ProblemCode}
                            parentWidth={() => getParentWidth()}
                            contextData={contextData}
                            isJudging={isJudging}
                        />
                    </Internal>
                </InitialHolder></>

        </>)
}

export const getServerSideProps = async (context: any) => {

    await dbConnect()
    const { id } = context.query;

    if (["description", "submission", "champion"].indexOf(id[1]) == -1) {
        return {
            notFound: true,
        };
    }

    try {
        if (typeof id[0] == "string") {
            const findDC = await ProblemModel.findOne({ ProblemCode: parseInt(sanitize(id[0])) }, 'Script solved rating ProblemCode ProblemName SupportedLang Mem tags')

            const data = JSON.parse(JSON.stringify(findDC))

            if (data["tags"]) {
                data["tags"] = JSON.parse(JSON.stringify(await TagsModel.find({ Name: data["tags"] }, 'Name Color Type -_id')))
            }

            const forwardProb = await ProblemModel.findOne({ ProblemCode: parseInt(sanitize(id[0])) - 1 }, '-_id ProblemCode')
            const backwardProb = await ProblemModel.findOne({ ProblemCode: parseInt(sanitize(id[0])) + 1 }, '-_id ProblemCode')

            let forward = false
            let backward = false
            if (backwardProb !== null) {
                backward = true
            }
            if (forwardProb !== null) {
                forward = true
            }
            return {
                props: { navigatable: [forward, backward], ...data }
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
