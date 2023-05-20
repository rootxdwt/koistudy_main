import styled, { keyframes } from "styled-components"
import {
    useState,
    Fragment,
    useEffect,
} from "react"

import { BsCircle, BsXLg } from "react-icons/bs"
import { TbLetterT } from 'react-icons/tb'
import { FiChevronDown } from 'react-icons/fi'
import { AC, AW, TLE } from "../DefaultComponent"

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
    width: 90vw;
  }
  @media (max-width: 770px) {
    width: 90vw;
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
    font-size: 16px;
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
    font-size: 13px;
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
    font-size: 13px;
}
& .TCwr {
    color: ${props => props.theme.Body.TextColorLevels[0]};
    font-size:13px;
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
    font-size: 13px;
    color: ${props => props.theme.Body.TextColorLevels[2]};
}
& p {
    font-size: 13px;
    margin-left: 10px;
}

`

export interface JudgeResponse {
    errorStatement: string
    matchedTestCase: Array<{ matched: boolean, tle: boolean, lim: number }>
    status: "Success" | "Error"
}

export const SubmitResult = (props: { contextData: JudgeResponse }) => {
    const [caseDetail, setCaseDetail] = useState<number>()
    const [isResultExtended, setExtended] = useState(false)

    const { contextData } = props

    useEffect(() => {
        if (contextData.matchedTestCase.every(elem => elem.matched)) {
            setCaseDetail(0)
        } else {
            setCaseDetail(contextData.matchedTestCase.map(elem => elem.matched).indexOf(false))
        }
    }, [contextData])

    return (
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
                    <p>{contextData.status == "Error" ? contextData.errorStatement == "CE" ? "컴파일 에러가 발생했습니다" : contextData.errorStatement == "ISE" ? "런타임 에러가 발생했습니다" : "틀렸습니다" : "맞았습니다"} </p>
                    {contextData.errorStatement == "NONE" ? <p className="icon">
                        <FiChevronDown />
                    </p> : <></>}
                </div>

            </div>
            <div className="btm">
                <h3 className="tch3">Test Cases</h3>
                <p className="ptge">{Math.round((contextData.matchedTestCase.filter(itm => itm.matched == true).length / contextData.matchedTestCase.length) * 100)}%</p>
                <TCholder>
                    {contextData.matchedTestCase.map((elem, index) => {
                        return (
                            <Fragment key={index} >
                                <TcItm isRight={elem.matched} onClick={() => { setCaseDetail(caseDetail == index ? -1 : index) }} isShown={caseDetail == index}>
                                    <div className="TCtitle">{index}</div>
                                    <div className="TCwr">{elem.matched ? <AC /> : elem.tle ? <TLE /> : <AW />}</div>
                                </TcItm>
                                <Details isShown={caseDetail == index}>
                                    <span>
                                        <b>
                                            TL:
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
    )
}