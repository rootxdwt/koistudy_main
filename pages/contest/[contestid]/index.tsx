import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import styled from "styled-components"
import { Header } from "@/lib/ui/component/header"
import { FiChevronLeft } from "react-icons/fi";

const Main = styled.div`
    display:flex;
    flex-direction:column;
    margin-left:auto;
    margin-right:auto;
    margin-top: 50px;
    width: 1400px;
    min-height: 100vh;
  @media(max-width: 1700px) {
width: 1300px;
  }
  @media(max-width: 1500px) {
width: 1200px;
  }
  @media(max-width: 1300px) {
width: 1100px;
  }
  @media(max-width: 1200px) {
width: 900px;
  }
  @media(max-width: 1000px) {
width: 90vw;
  }
`

const ContestName = styled.h1`
color: ${props => props.theme.Body.TextColorLevels[1]};
font-size: 25px;
margin-top:100px;
`

const ContestDesc = styled.div`
color: ${props => props.theme.Body.TextColorLevels[3]};
font-size: 14px;
`

const Back = styled.div`
  color: ${props => props.theme.Body.TextColorLevels[3]};
  display:flex;
  align-items:center;
  cursor:pointer;
  & p {
    font-size:14px;
    margin:0;
    padding:0;
    margin-left:7px;
  }
`

const MainHolder = styled.div`
display:flex;
margin-top: 50px;

`

const Problems = styled.div`
  width: 100%;
  margin-right: 30px;
  height: 300px;
`

const ProblemArrangeHolder = styled.div`
    color: ${props => props.theme.Body.TextColorLevels[2]};
    font-size: 12px;
    width: 100%;
    height: 40px;
    top: 0px;
    margin: 0;
    display: flex;
    flex-direction: row;
    align-items: center;

    & .name {
        width: 100%;
        cursor: pointer;
    }
    & .score{
        width: 100px;
        cursor: pointer;
    }
    border-bottom: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
`

const Problem = styled.div<{ noBorder?: boolean }>`
    width: 100%;
    border-bottom: solid 1px ${props => props.noBorder ? "transparent" : props.theme.Body.ContainerBgLevels[0]};
    height: 50px;
    display: flex;
    align-items: center;
    font-size: 13px;
    cursor: pointer;
    & .name {
        width: 100%;
        color: ${props => props.theme.Body.TextColorLevels[1]};
    }
    & .score{
        width: 100px;
        color: ${props => props.theme.Body.TextColorLevels[3]};
    }
    color: ${props => props.theme.Body.TextColorLevels[2]};
`

const JoinContest = styled.button`
width: 100px;
height: 30px;
cursor:pointer;
margin-top: 30px;
border:none;
border-radius: 5px;
`

export default function Index() {
    return (
        <>
            <GlobalStyle />
            <Main>
                <Back>
                    <FiChevronLeft />
                    <p>대회 목록</p>
                </Back>
                <ContestName>
                    제 1회 코이컵
                </ContestName>
                <ContestDesc>1/26 ~ 1/31</ContestDesc>
                <MainHolder>
                    <Problems>
                        <ProblemArrangeHolder>
                            <div className="name">
                                이름
                            </div>
                            <div className="score">
                                점수
                            </div>
                        </ProblemArrangeHolder>
                        <Problem>
                            <div className="name">
                                정수 입력받아 출력하기
                            </div>
                            <div className="score">
                                500
                            </div>
                        </Problem>
                        <Problem>
                            <div className="name">
                                Wonderland Chase
                            </div>
                            <div className="score">
                                500
                            </div>
                        </Problem>
                    </Problems>

                </MainHolder>
                <JoinContest>
                    대회 참가하기
                </JoinContest>
            </Main>
        </>
    )
}