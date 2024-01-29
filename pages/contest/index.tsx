import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import styled from "styled-components"
import { Header } from "@/lib/ui/component/header"

const ContestArrangeHolder = styled.div`
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
    & .start{
        width: 100px;
        cursor: pointer;
    }
    & .end{
        width: 100px;
        cursor: pointer;
    }
    border-bottom: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
`

const Contest = styled.div<{noBorder?:boolean}>`
    width: 100%;
    border-bottom: solid 1px ${props => props.noBorder?"transparent":props.theme.Body.ContainerBgLevels[0]};
    height: 50px;
    display: flex;
    align-items: center;
    font-size: 13px;
    cursor: pointer;
    & .name {
        width: 100%;
        color: ${props => props.theme.Body.TextColorLevels[1]};
    }
    & .start{
        width: 100px;
        color: ${props => props.theme.Body.TextColorLevels[3]};
    }
    & .end{
        width: 100px;
        color: ${props => props.theme.Body.TextColorLevels[3]};
    }
    color: ${props => props.theme.Body.TextColorLevels[2]};
`

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


export default function Index() {
    return (
        <>
            <GlobalStyle />
            <Header currentPage={"대회"} />
            <Main>
                <ContestArrangeHolder>
                    <p className="name">이름</p>
                    <p className="start">시작일</p>
                    <p className="end">마감일</p>
                </ContestArrangeHolder>
                <Contest>
                    <p className="name">제 1회 코이컵</p>
                    <p className="start">24/1/12</p>
                    <p className="end">24/1/31</p>
                </Contest>
            </Main>
        </>
    )
}