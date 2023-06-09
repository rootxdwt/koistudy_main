import {
    useEffect, useState
} from "react"

import styled, { keyframes, ThemeProvider } from "styled-components"
import { Holder } from "@/lib/ui/DefaultComponent"
import { DarkTheme, LightTheme } from "@/lib/ui/theme"
import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import { Header } from "@/lib/ui/component/header"

import { useSelector } from 'react-redux';
import { StateType } from "@/lib/store"
import { useRouter } from "next/router"
import sanitize from "mongo-sanitize"
import Head from "next/head"

import { Description } from "@/lib/ui/problemPages/description"
import { Champion } from "@/lib/ui/problemPages/champion"
import { SubmissionPage } from "@/lib/ui/problemPages/submission"
import { SubmitResult, JudgeResponse } from "@/lib/ui/component/submissionMenu";
import { CodeEditArea } from "@/lib/ui/component/codeEdit"
import mongoose from "mongoose"
import ProblemModel from "lib/schema/problemSchema"
import Image from "next/image"
import { AiOutlineStar, AiFillStar } from 'react-icons/ai'
import { FcCheckmark } from 'react-icons/fc'
import { AcceptableLanguage } from "@/lib/pref/languageLib"
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


const Internal = styled.div<{ rating: number }>`
width: 100%;
margin-left:auto;
margin-right: auto;
height:calc(100vh - 70px);
display:flex;
overflow:hidden;
@media(max-width: 900px) {
    width: 90%;
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
display:flex;
flex-direction:column;
width:100%;
overflow-y:auto;
padding-right:20px;
height: calc(100% - 60px);
@media (max-width: 770px) {
    padding-right:0;
}
& .probInfo {
    display:flex;
    margin-top: 20px;
    margin-bottom: 20px;
  }
`

const FooterHolder = styled.footer`
    background-color: ${props => props.theme.Body.backgroundColor};
    margin-top: auto;
    display:flex;
    padding: 20px 0px;
    flex-direction: column;
`


const FooterBottom = styled.div`
    display:flex;
    color: ${props => props.theme.Button.backgroundColor};
    font-size: 12px;
    padding-top: 10px;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    border-top: solid 2px ${props => props.theme.Container.backgroundColor};
    & p {
        color: ${props => props.theme.Body.TextColorLevels[3]};
        font-size: 12px;
        margin: 0;
        margin-left: 10px;
    }
    & a {
        font-size: 11px;
        color: ${props => props.theme.Body.TextColorLevels[3]};
        margin-right: 10px;
        margin-left: 10px;
        padding-top: 10px;
    }
`

const LogoHolder = styled.div`
        display:flex;
        align-items: center;
        font-size: 12px;
        justify-content: center;
        & p{
            font-family: 'Poppins',sans-serif;
            font-size: 13px;
            margin-right: 5px;
            display:flex;
            align-items: center;
            justify-content: center;
        }
        color: ${props => props.theme.Body.TextColorLevels[2]};

`
const FooterElem = () => {
    return (
        <FooterHolder>

            <FooterBottom>
                <LogoHolder>

                    <p>
                        &copy; KOISTUDY
                    </p>
                </LogoHolder>

                <div>
                    <a href="">오픈소스</a>|
                    <a href="">이용약관</a>|
                    <a href="">크레딧</a>
                </div>

            </FooterBottom>
        </FooterHolder>
    )
}



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

}

const Itm = styled.div<{ rating?: number }>`
padding: 2px 15px;
margin-right: 10px;
border-radius: 5px;
background-color: ${props => props.theme.Container.backgroundColor};
font-family: 'Poppins',sans-serif;
& p{
    font-size: 10px!important;
}
& p.grad {
    color: ${props => props.theme.Body.TextColorLevels[3]};
    text-align: center;
    margin: 0;
    text-align:left;
    -webkit-background-clip: text;
    background-clip: text;
  }
& p.min {
    margin:0;
    color: ${props => props.theme.Body.TextColorLevels[3]};
  }
`

const Titleholder = styled.div`
    display:flex;
    flex-direction: row;
    align-items: center;
    margin-top: 20px;
    & h1 {
        margin:0;
        margin-right: 20px;
    }
`



const ProbInfo = styled.div`
        display:flex;
    margin-top: 20px;
    margin-bottom: 10px;
    border-radius: 10px;

`

const SolvedIndicator = styled.div`
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
    margin-right: 10px;
    &:hover {
        &::after {
        position:absolute;
        content: "Solved";
        margin-top: 65px;
        margin-left: 20px;
        font-size: 10px;
        background-color: ${props => props.theme.Container.backgroundColor};
        padding: 4px 10px;
        border-radius: 4px;
        z-index: 6;
    }
}
`

const TPBtn = styled(SolvedIndicator)`

    &:hover {
        background-color: ${props => props.theme.Button.backgroundColor};
        &::after {
        margin-left: 0px;
        position:absolute;
        content: "Bookmark";
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



const PageNav = styled.div`
    margin-bottom: 10px;
    z-index:3;
    border-bottom: solid 2px ${props => props.theme.Container.backgroundColor};
    position: sticky;
    font-family: "Noto Sans KR", sans-serif;
    font-weight: 700;
    display: flex;
    top: 0px;
    background-color: ${props => props.theme.Body.backgroundColor};
    margin-top: 10px;
    @media(max-width: 770px) {
        position: relative;
    }
`

const PageBtn = styled.div<{ isActive: boolean }>`
    margin: 0;
    padding: 0px;
    margin-right: 50px;
    padding-bottom: 6px;

    border-bottom: solid 2px ${props => props.isActive ? props.theme.Body.TextColorLevels[2] : "transparent"};
    cursor: pointer;
    & p:hover {
        background-color: ${props => props.theme.Body.ContainerBgLevels[1]};
    }
    & p {
        transition: background-color 0.1s ease-in-out;
        margin: 0;
        font-size: 12px!important;
        padding: 0px 15px;
        border-radius: 5px;
    }
`

const ProblemPageHandler = (props: { currentPage: string, problemData: ProblemDataProp }) => {
    const router = useRouter()
    const { currentPage, problemData } = props
    return (
        <DescHolder>
            <Titleholder>
                <h1>{problemData.problemName}</h1>
            </Titleholder>
            <ProbInfo>
                <Itm rating={problemData.rating}>
                    <p className="grad">Rating {problemData.rating}</p>
                </Itm>
                <FavBtn problemId={problemData.id} />
                {/* <SolvedIndicator>
                    <FcCheckmark />
                </SolvedIndicator> */}
            </ProbInfo>
            <PageNav>
                <PageBtn isActive={currentPage == "description"} onClick={() => router.push(`${router.query.id![0]}/description`)}>
                    <p>설명</p></PageBtn>
                <PageBtn isActive={currentPage == "submission"} onClick={() => router.push(`${router.query.id![0]}/submission`)}><p>제출</p></PageBtn>
                <PageBtn isActive={currentPage == "champion"} onClick={() => router.push(`${router.query.id![0]}/champion`)}><p>챔피언</p></PageBtn>
            </PageNav>
            {currentPage == "description" ? <>
                <Description
                    mdData={problemData.mdData}
                    problemName={problemData.problemName}
                    solved={problemData.solved}
                    rating={problemData.rating}
                    id={problemData.id}
                />
                <FooterElem />
            </> : currentPage == "submission" ? <SubmissionPage id={problemData.id} supportedLang={problemData.supportedLang} /> : currentPage == "champion" ? <Champion /> : <></>}
        </DescHolder>
    )
}

export default function Problem(data: any) {
    const { ProblemCode, ProblemName, Script, SupportedLang, rating, solved } = data.Oth
    const [isJudging, setIsJudging] = useState(false)
    const [contextData, setContextData] = useState<JudgeResponse | undefined>()

    const router = useRouter()

    const isDark = useSelector<StateType, boolean>(state => state.theme);

    const detCode = async (t: string, c: string) => {
        try {
            setContextData(undefined)
            setIsJudging(true)
            var jsn = await submitCode(t, c, ProblemCode)
            if (jsn) {
                setIsJudging(false)
                setContextData(jsn)
            }
        } catch (e: any) {
            if (e.message == "toomanyreq") {
                setIsJudging(false)
            } else if (e.message == "unauthorized") {
                router.push("/auth/login")
            }
            else {
                console.error("unhandled error")
            }
        }
    }
    return (
        <>
            <Head>
                <meta content={isDark ? "dark" : "light"} name="color-scheme" />
                <title>
                    {ProblemName + " - KOISTUDY"}
                </title>
            </Head>
            <ThemeProvider theme={isDark ? DarkTheme : LightTheme}>
                <Header
                    currentPage="problems"
                />
                <GlobalStyle />
                <>
                    <Holder>
                        <Internal rating={rating}>
                            <ProblemPageHandler currentPage={router.query.id![1]} problemData={{ mdData: Script, problemName: ProblemName, solved: solved, rating: rating, id: parseInt(router.query.id![0]), supportedLang: SupportedLang }} />
                            <CodeEditArea
                                SupportedLang={SupportedLang}
                                submitFn={(a: string, b: string) => { if (!isJudging) detCode(a, b) }}
                            />
                            <SubmitResult contextData={contextData} isJudging={isJudging} />
                        </Internal>
                    </Holder></>
            </ThemeProvider>

        </>)
}

export const getServerSideProps = async (context: any) => {
    const url = 'mongodb://localhost:27017/main';
    mongoose.connect(url)
    const { id } = context.query;

    if (["description", "submission", "champion"].indexOf(id[1]) == -1) {
        return {
            notFound: true,
        };
    }

    try {
        if (typeof id[0] == "string") {
            const findDC = await ProblemModel.findOne({ ProblemCode: parseInt(sanitize(id[0])) }).exec();
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
