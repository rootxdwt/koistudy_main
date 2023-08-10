import styled, { keyframes } from "styled-components"
import { useEffect, useState, useRef } from "react"
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import Head from "next/head"
import { useRouter } from "next/router"
import { GlobalStyle } from "@/lib/ui/DefaultComponent"

const Holder = styled.div`
  padding: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  margin: 0;
`
const LandingItm = styled.div`
width: 100vw;
height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1b1c1e;
  overflow: hidden;
`

const StartBtn = styled.p`
  color: #fff;
  margin-top: 100px;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 20px;
  border: solid 1px rgba(255,255,255,.5);
  background-color: rgba(255,255,255,.2);
`

const H1Align = styled.div`
  display: flex;
  white-space:nowrap;
  overflow: hidden;
  width: 100vw;
  text-align: center;
  align-items: center;
  justify-content: center;
  rotate: -5deg;

  & h1{
    margin: 0;
    color: rgba(255,255,255,0.3);
    margin: 0px 10px;
    font-size: 30px;
    line-height: 50px;
    text-align: center;
  }
`
const ResizeHolder = styled.div`
display: flex;
overflow: scroll;
margin-top: 100px;
width: 1400px;
&::-webkit-scrollbar {
  display: none;
}

-ms-overflow-style: none;
scrollbar-width: none;

@media(max-width: 1800px) {
  width: 1300px;
}
@media(max-width: 1700px) {
  width: 1200px;
}
@media(max-width: 1500px) {
  width: 1100px;
}
@media(max-width: 1300px) {
  width: 1000px;
}
@media(max-width: 1200px) {
  width: 900px;
}
@media(max-width: 900px) {
  width: 100vw;
}
`

const LineDraw = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 130px;
  }
`

const IntroText = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: center;
  & h1.attr {
    color: rgb(220, 220, 220);
    font-size: 30px;
    line-height: 50px;
    font-weight: 800;
    margin: 0;
  }
  & .grad {
    position: relative;
    background-color: transparent;
    background: linear-gradient(90deg,rgb(107,157,248) 20%,rgb(131,81,246) 80%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    cursor: pointer;
    
  }
  & .grad:hover::after {
    position: absolute;
    width: 130px;
    height: 2px;
    content: "";
    z-index: 1;
    background: linear-gradient(90deg,rgb(107,157,248) 20%,rgb(131,81,246) 80%);
    bottom: 5px;
    left: 0;
    animation: ${LineDraw} 0.3s ease-in-out;
  }
  & .grad::before {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 10px;
    left: 140px;
    top: 8px;
    content: "";
    font-size: 10px;
    background:linear-gradient(90deg,rgb(107,157,248) 0%,rgb(131,81,246) 100%);
    z-index: 2;
    color: #000;
  }
  & span {

      padding-right: 3px;
      border-radius: 10px;
      font-size: 30px;
  }
`

const Box = styled.div`
    height: 100px;
    width: 200px;
    background-color: rgb(40, 40, 40);
    margin: 0px 10px;
    flex-shrink: 0;
    border-radius: 20px;
    border: solid 2px rgb(60, 60, 60);
    cursor: pointer;
    display: flex;
    color: #fff;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    &:hover {
      transform: scale(0.98);
    }
    color: rgba(255,255,255,.8);
`
const LeftBlurBorder = styled.div`
  height: 104px;
  position: absolute;
  left: 0;
  width: 30px;
  z-index: 10;
  background: linear-gradient(90deg, #1b1c1e 0%, rgba(255,255,255,0) 100%);
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
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, #1b1c1e 100%);
  padding-right: 0;
  padding-left: 20px;
`

export default function Home() {
  const scrollRef = useRef<any>()
  const [currentText, setCurrentText] = useState("")
  const [isLeftArrowShown, setLeftArrowState] = useState(false)
  const [isRightArrowShown, setRightArrowState] = useState(true)

  const router = useRouter()

  const TextAnimation = (text: string, noDeletion?: boolean): Promise<void> => {
    return new Promise((resolve, _) => {
      let ind = 0
      const textarr = text.split("")
      let interval = setInterval(() => {
        if (ind > textarr.length) {
          if (noDeletion) {
            clearInterval(interval);
            resolve()
          }
          let sliced = textarr
          sliced.pop()
          setCurrentText(sliced!.join(""))
          if (sliced.length < 1) {
            clearInterval(interval);
            resolve()
          }
        } else {
          setCurrentText(textarr.slice(0, ind).join(""))
          ind++
        }

      }, 150)//150
    })
  }

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

  useEffect(() => {


    TextAnimation("초보자        ").then(() => {
      return TextAnimation("코딩 고수        ")
    }).then(() => {
      return TextAnimation("모두        ", true)
    })
  }, [])
  //
  return (
    <>
      <GlobalStyle />
      <Head>
        <title>
          코이스터디 | 모두를 위한 알고리즘 문제해결 플랫폼
        </title>
      </Head>
      <Holder>
        <LandingItm>
          <IntroText>
            <H1Align>
              <h1>N9TT-9G0A-B7FQ-RAC-QK6A-JI6S-7ETR-SFDR-YXHF-ASDR-SFDR-KIAP-YXHF-ASDR-AISU-LOUD-A9DJ-AS8D</h1>
              <h1 className="attr"><span>{currentText}</span>를 위한</h1>
              <h1>SXFP-CHYK-ONI6-S89U-NHLE-L6MI-4GE4-ETEV-7KFM-YWUG-QLWB-GSEF-57TC-AOSD-ISJD-OIJS</h1>
            </H1Align>
            <H1Align>
              <h1>6EAATI-UIL2-9WAX-XHYO-2E62-E3SR-33FI-XHV3-QVHD-E9A4-9JBS-M92U-LSIA-ISOD-QISD-A</h1>
              <h1 className="attr">알고리즘 문제해결 플랫폼</h1>
              <h1>7EIQ-72IU-2YNV-3L4Y-VU8X-A5TW-FDFV-FLBE-JHNC-GY78-FLN5-HDCT-OSIA-MXJZ-8JSU</h1>
            </H1Align>
            <H1Align>
              <h1>ZRUH-VNBT-DL4G-G4SVB-XEK8-73H6-P54Y-57TC-FRMS-EHS8-VFZS-KSAU-WG8SA-GHSA-S7Yd-A9DJ&gt;&gt;</h1>
              <h1 className="grad attr">코이스터디</h1>
              <h1>&lt;&lt;VK-GK6L-UR4D-UNUP-2E62-E3SR-33FI-XHV3-ZYSW-FUXY-BDFE-DFES-HRSP-A8SD-CNHJ-D1DL-ADSD-SAID</h1>
            </H1Align>
          </IntroText>

          <StartBtn onClick={() => router.push(`/auth?redir=${encodeURIComponent("/problems")}`)}>시작하기</StartBtn>

        </LandingItm>
        <LandingItm>
          <IntroText>
            <h1 className="attr">무엇을 배우고 싶으신가요?</h1>
            <ResizeHolder ref={scrollRef}>
              {isLeftArrowShown ? <LeftBlurBorder onClick={() => moveCont(true)}><IoIosArrowBack /></LeftBlurBorder> : <></>}
              {isRightArrowShown ? <RightBlurBorder onClick={() => moveCont(false)} ><IoIosArrowForward /></RightBlurBorder> : <></>}
              <Box>기초</Box>
              <Box>스택</Box>
              <Box>큐</Box>
              <Box>BFS</Box>
              <Box>DFS</Box>
              <Box>트리</Box>
              <Box>재귀</Box>

            </ResizeHolder>

          </IntroText>

        </LandingItm>

      </Holder>
    </>
  )
}