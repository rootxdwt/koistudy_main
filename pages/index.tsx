import Head from 'next/head'
import Image from 'next/image'
import styled, { keyframes, ThemeConsumer } from 'styled-components'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'

import { GlobalStyle } from '@/lib/ui/DefaultComponent'
import { ThemeProvider } from 'styled-components'
import { DarkTheme, LightTheme } from '@/lib/ui/theme'
import { TbBrandGolang } from "react-icons/tb"
import { DiRust, DiPhp, DiPython, DiNodejsSmall, DiCode } from 'react-icons/di'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import { Header } from '@/lib/ui/component/header'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Nav } from '@/lib/ui/component/nav'
import { useSelector } from 'react-redux';
import { StateType } from '@/lib/store'

const Holder = styled.div`
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  margin-top: 65px;
  color: ${props => props.theme.Body.TextColorLevels[3]};
  flex-direction: column;
  & h2 {
    color: ${props => props.theme.Body.TextColorLevels[1]};
    margin-top: 50px;
    border-bottom: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
    padding-bottom: 20px;
  }
`

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
border: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
&:nth-child(1){
  @media(max-width: 770px) {
    margin-left: 5vw;
  }
}
&:hover {
  border: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
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

const HHolderParent = styled.div`
position: relative;
display:flex;
overflow-x: scroll;
-ms-overflow-style: none;
scrollbar-width: none; 
flex-direction:row;
width: calc(90vw - 200px);
&::-webkit-scrollbar {
  display: none;
}
@media(max-width: 770px) {
  width: 100vw;
  margin-left: auto;
  margin-right:auto;
}
`
const HcardHolder = styled.div`
display: flex;
position: relative;
`

const LeftBlurBorder = styled.div`
  height: 234px;
  position: absolute;
  left: 0;
  width: 30px;
  z-index: 10;
  background: linear-gradient(90deg, ${props => props.theme.Body.backgroundColor} 0%, rgba(255,255,255,0) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.Body.TextColorLevels[3]};
  padding-right: 20px;
  font-size: 20px;
  cursor: pointer;
  @media(max-width: 770px) {
    display: none;
  }
`
const RightBlurBorder = styled(LeftBlurBorder)`
  right: 0;
  left:auto;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, ${props => props.theme.Body.backgroundColor} 100%);
  padding-right: 0;
  padding-left: 20px;
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



const MainPageSkeleton = () => {
  return (
    <ThemeConsumer>
      {theme => <SkeletonTheme baseColor={theme.Container.backgroundColor} highlightColor={theme.Body.ContainerBgLevels[0]}>
        <SkeletonHolder>
          <Skeleton width={200} height={200} borderRadius={20} count={5} style={{ "marginRight": "30px", "flexShrink": "none", "marginTop": "30px" }} />
        </SkeletonHolder>
      </SkeletonTheme>}
    </ThemeConsumer>

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


const Myprob = (props: { problems: Array<sugprobDetails> | undefined }) => {
  const scrollRef = useRef<any>()
  const [isLeftArrowShown, setLeftArrowState] = useState(false)
  const [isRightArrowShown, setRightArrowState] = useState(true)
  const router = useRouter()
  const moveCont = (isLeft: boolean) => {
    if (isLeft) {
      scrollRef.current.scrollBy({
        top: 0,
        left: -200,
        behavior: "smooth",
      })
    } else {
      scrollRef.current.scrollBy({
        top: 0,
        left: 200,
        behavior: "smooth",
      })
    }
  }
  const listner = () => {
    if (scrollRef.current.scrollLeft == 0) {
      setLeftArrowState(false)
    } else {
      setLeftArrowState(true)
    }
    if (scrollRef.current.offsetWidth + scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth) {
      setRightArrowState(false)
    } else {
      setRightArrowState(true)
    }
  }
  useEffect(() => {
    let currentElem = scrollRef.current
    listner()
    currentElem.addEventListener('scroll', listner)
    return () => currentElem.removeEventListener('scroll', listner)
  }, [])
  return (
    <>
      {isLeftArrowShown ? <LeftBlurBorder onClick={() => moveCont(true)}><IoIosArrowBack /></LeftBlurBorder> : <></>}
      {isRightArrowShown ? <RightBlurBorder onClick={() => moveCont(false)} ><IoIosArrowForward /></RightBlurBorder> : <></>}
      <HHolderParent ref={scrollRef}>
        {typeof props.problems !== "undefined" ?
          <>
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
          </>
          : <MainPageSkeleton />}

      </HHolderParent>

    </>
  )
}

const MainPageHolder = styled.div`
display: flex;
`

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
      <Header currentPage="home" />
      <GlobalStyle />
      {loaded ?
        <MainPageHolder>
          <Holder>
            <HcardHolder>
              <Myprob problems={data}></Myprob>
            </HcardHolder>
          </Holder>

        </MainPageHolder>
        : <></>
      }
    </>
  )
}
