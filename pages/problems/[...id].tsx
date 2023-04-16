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
import { MongoClient } from 'mongodb'
import { useRouter } from "next/router"
import sanitize from "mongo-sanitize"
import Head from "next/head"

import { Description } from "@/lib/ui/problemPages/description"
import { Champion } from "@/lib/ui/problemPages/champion"
import { Discussion } from "@/lib/ui/problemPages/discussion"
import { SubmissionPage } from "@/lib/ui/problemPages/submission"
import { SubmitResult, JudgeResponse } from "@/lib/ui/component/submissionMenu";
import { CodeEditArea } from "@/lib/ui/component/codeEdit"

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



const submitCode = async (lang: String, code: string, num: number) => {
    const obj = JSON.stringify({ Lang: lang, Code: code })
    return await (await fetch(`/api/judge/${num}`, { method: "POST", body: obj, headers: { "Content-type": "application/json" } })).json()
}




interface ProblemDataProp {
    mdData: string
    problemName: string
    solved: number
    rating: number

}

const ProblemPageHandler = (props: { currentPage: string, problemData: ProblemDataProp }) => {
    const { currentPage, problemData } = props
    switch (currentPage) {
        case "description":
            return <Description
                mdData={problemData.mdData}
                problemName={problemData.problemName}
                solved={problemData.solved}
                rating={problemData.rating}
            />
        case "discussion":
            return <Discussion />
        case "champion":
            return <Champion />
        case "submission":
            return <SubmissionPage />
        default:
            return <></>
    }
}

export default function Problem(data: any) {
    const { ProblemCode, ProblemName, Script, SupportedLang, rating, solved } = data.Oth
    const [loaded, setLoadState] = useState<boolean>()
    const [isSubmitShowing, setSubmitShowState] = useState(false)
    const [contextData, setContextData] = useState<JudgeResponse>()

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
                        { name: "submission", action: () => router.push(`${router.query.id![0]}/submission`) },
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
                                <ProblemPageHandler currentPage={router.query.id![1]} problemData={{ mdData: Script, problemName: ProblemName, solved: solved, rating: rating }} />
                                <CodeEditArea
                                    SupportedLang={SupportedLang}
                                    submitFn={(a: string, b: string) => detCode(a, b)}
                                />
                                {contextData && !isSubmitShowing ?
                                    <SubmitResult contextData={contextData} />
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

    if (["description", "discussion", "submission", "champion"].indexOf(id[1]) == -1) {
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
