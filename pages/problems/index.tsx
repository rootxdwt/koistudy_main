import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import styled from "styled-components"
import { Header } from "@/lib/ui/component/header"
const Holder = styled.div`
    background-color: ${props => props.theme.Body.backgroundColor};
    padding-top: 60px;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
`
const RightMenu = styled.div`
    width: 350px;
    height: 100vh;
`
const MainHolder = styled.div`
    width: 100%;
`
const Topics = styled.ul`
    list-style-type: none;
    display: flex;
    padding-left: 10px;
`
const Topic = styled.li<{ isActive?: boolean }>`
    font-size: 12px;
    padding: 5px 15px;
    margin: 0px 7px;
    border-radius: 10px;
    background-color: ${props => props.isActive ? props.theme.Body.ContainerBgLevels[1] : "transparent"};
    color: ${props => props.isActive ? props.theme.Body.TextColorLevels[2] : props.theme.Body.TextColorLevels[3]};
    position: relative;
    border: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
    cursor: pointer;
    
`
const FirstRowHeadings = styled.div`
    display: flex;
    align-items: center;
    border: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
    margin-right: 20px;
    border-radius: 10px;
`
const InputArea = styled.div`
        height: 21px;
        border: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    & input {
        background-color: transparent;
        border: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
        border-radius: 5px;
        width: 100%;
        height: 100%;
    }
    & input:focus {
        outline: none;
    }
`
const TagsHolder = styled.div`
        border-radius: 10px;
        max-height: 160px;
        padding: 20px;
        border: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
`
const TagHeader = styled.div`
    font-size: 15px;
    color: ${props => props.theme.Body.TextColorLevels[2]};
    padding-bottom: 15px;
    border-bottom: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
    
`
const Tag = styled.div`
    color: ${props => props.theme.Body.TextColorLevels[3]};
    font-size: 11px;
    padding: 3px 11px;
    border-radius: 15px;
    margin: 5px;
    display: flex;
    align-items: center;
    & span {
        background-color: ${props => props.theme.Body.ContainerBgLevels[1]};
        font-size: 10px;
        padding: 1px 5px;
        border-radius: 15px;
        margin-left:5px;
    }
`

const Tags = styled.div`
    display: flex;
    flex-wrap: wrap;
`
export default function ProblemIndex() {
    return (
        <>
            <GlobalStyle />

            <Holder>
                <MainHolder>
                    <FirstRowHeadings>
                        <Topics>
                            <Topic isActive>
                                Dynamic Programming
                            </Topic>
                            <Topic>
                                기초 문제
                            </Topic>
                        </Topics>

                    </FirstRowHeadings>
                </MainHolder>
                <RightMenu>
                    <TagsHolder>
                        <Tags>
                            <Tag>
                                DFS
                                <span>
                                    71
                                </span>
                            </Tag>
                            <Tag>
                                BFS
                                <span>
                                    51
                                </span>
                            </Tag>
                            <Tag>
                                Query
                                <span>
                                    11
                                </span>
                            </Tag>
                            <Tag>
                                Stack
                                <span>
                                    102
                                </span>
                            </Tag>
                            <Tag>
                                Queue
                                <span>
                                    132
                                </span>
                            </Tag>
                        </Tags>


                    </TagsHolder>
                </RightMenu>
            </Holder>

        </>)
}