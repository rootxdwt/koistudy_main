import Head from 'next/head'
import Image from 'next/image'
import styled, { keyframes } from 'styled-components'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'

import { GlobalStyle } from '@/lib/ui/DefaultComponent'
import { ThemeProvider } from 'styled-components'
import { DarkTheme, LightTheme } from '@/lib/ui/theme'
import { Holder } from '@/lib/ui/DefaultComponent'
import { TbBrandGolang } from "react-icons/tb"
import { DiRust, DiPhp, DiPython, DiNodejsSmall, DiCode } from 'react-icons/di'
import { Header } from '@/lib/ui/component/header'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import { useSelector } from 'react-redux';
import { StateType } from '@/lib/store'


const Probcard = styled.div`
width: 100%;
border-top-left-radius: 20px;
border-top-right-radius: 20px;
background-color: ${props => props.theme.Container.backgroundColor};
height: 600px;
margin-top: 30px;
flex-shrink: 0;
`
interface sugprobDetails {
  ProblemCode: Number
  ProblemName: string
  solved: number
  rating: number
  SupportedLang: Array<string>
}

const Hcard = styled.div<{ rating: number }>`
width: 120px;
border-radius: 20px;
background-color: ${props => props.theme.Container.backgroundColor};
height: 120px;
margin-top: 30px;
margin-right: 30px;
flex-shrink: 0;
transition: transform 0.2s ease-in-out;
cursor:pointer;
display:flex;
flex-direction: column;
align-items:center;
justify-content:center;
padding: 40px;
position: relative;
&:nth-child(1){
  @media(max-width: 770px) {
    margin-left: 5vw;
  }
}
&:hover {
  transform: scale(0.95);
}
& h2 {
  font-size: 16px;
  color: ${props => props.theme.Container.titleColor};
  margin-top: 10px;
  word-break: keep-all;
  width: 100%;
  text-align:left;
}
& p {
  font-size: 12px;
  color: ${props => props.theme.Body.TextColorLevels[3]};
  text-align: center;
  margin: 0;
  margin-left: 0;
  margin-right:auto;
  text-align:left;
  background: ${props => props.rating < 4 ? "linear-gradient(90deg, rgb(107,157,248) 0%, rgb(131,81,246) 100%)" : "linear-gradient(90deg, rgba(214,123,46,1) 0%, rgba(170,189,26,1) 100%)"};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Poppins',sans-serif;
}
& span {
  width: 100%;
  font-size: 30px;
  display:flex;
  align-items:center;
  margin-top: auto;
  margin-bottom: 0;

  justify-content:space-between;
  color: ${props => props.theme.Container.logoSubColor};
}
`

const HcardHolder = styled.div`
display:flex;
overflow-x: scroll;
overflow-y: hidden;
-ms-overflow-style: none;
scrollbar-width: none; 
flex-direction:row;
&::-webkit-scrollbar {
  display: none;
}
@media(max-width: 770px) {
  width: 100vw;
  margin-left: auto;
  margin-right:auto;
}
`
const Fullview = styled.div`
width: 200px;
height: 200px;
display:flex;
align-items:center;
justify-content:center;
flex-shrink: 0;
margin-top: 30px;
margin-right: 30px;
& p {
  height: 10px;
}
`

const SkeletonHolder = styled(HcardHolder)`
& span {
  display:flex;
}
@media(max-width: 770px) {
  width: 100vw;
  margin-right:auto;
  &>span {
    padding-left: 10vw;
  }
}
`



const MainPageSkeleton = (props: { isDark: boolean }) => {
  const baseColor = props.isDark ? "rgb(50,50,50)" : "rgb(245,245,245)"
  const hlColor = props.isDark ? "rgb(70,70,70)" : "rgb(234, 234, 234)"
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={hlColor}>
      <SkeletonHolder>
        <Skeleton width={200} height={200} borderRadius={20} count={5} style={{ "marginRight": "30px", "flexShrink": "none", "marginTop": "30px" }} />
      </SkeletonHolder>
    </SkeletonTheme>

  )
}

const LanguageIcon = (props: { langs: Array<string> }) => {
  switch (props.langs[0]) {
    case "python":
      return <DiPython />
    case "go":
      return <TbBrandGolang />
    case "javascript":
      return <DiNodejsSmall />
    case "php":
      return <DiPhp />
    case "rust":
      return <DiRust />
    default:
      return <DiCode />
  }
}


const Myprob = (props: { problems: Array<sugprobDetails> }) => {
  const router = useRouter()
  return (
    <>
      <HcardHolder>
        {props.problems.map((item, index) => {
          return (
            <Hcard rating={item.rating} key={index} onClick={() => router.push(`problems/${item.ProblemCode}/description`)}>
              <p>Rating {item.rating}</p>
              <h2>{item.ProblemName}</h2>
              <span>
                <LanguageIcon langs={item.SupportedLang} />
              </span>
            </Hcard>
          )
        })}
        <Fullview><p>전체 문제 보기</p></Fullview>

      </HcardHolder>
    </>
  )
}

export default function Home() {
  const [data, setData] = useState<Array<sugprobDetails>>()
  const [loaded, setLoaded] = useState(false)
  const isDark = useSelector<StateType, boolean>(state => state.theme);
  const router = useRouter()
  useEffect(() => {
    setLoaded(true)
    fetch('/api/main').then((data) => {
      return data.json()
    }).then((jsn) => {
      setData(jsn)
    })
  }, [])
  return (
    <>
      <Head>
        <title>KOISTUDY</title>
        <link rel='shortcut icon' href='favicon.ico' />
      </Head>
      <ThemeProvider theme={isDark ? DarkTheme : LightTheme}>
        <Header currentPage="home" />
        <GlobalStyle />
        {loaded ?
          <>
            {
              data ? <Holder>
                <Myprob problems={data}></Myprob>
                {/* <Probcard></Probcard> */}
              </Holder> : <Holder>
                <MainPageSkeleton isDark={isDark} />
              </Holder>
            }
          </>
          : <></>
        }
      </ThemeProvider>
    </>
  )
}
