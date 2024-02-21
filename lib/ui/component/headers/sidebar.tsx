import styled, { keyframes, ThemeConsumer } from "styled-components"
import { FiChevronLeft } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineClose } from "react-icons/ai";
import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

const ShowContainer = keyframes`
    0% {
        left: -350px;
    }
    100% {
        left: 0px;
    }
`

const Container = styled.div`
    position: fixed;
    top:0;
    left: 0;
    height: 100vh;
    width: 350px;
    background-color: ${props => props.theme.Header.BgColor};
    z-index: 9999;
    border-right: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
    animation: ${ShowContainer} 0.2s ease-out;
`
const Heading = styled.div`
    padding: 20px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`
const Body = styled.ul`
    display: flex;
    flex-direction: column;
    padding: 20px;
    list-style-type: none;
`
const Icon = styled.p`
    font-size: 16px;
    margin: 0;
    padding: 0;
    margin: 0px 10px;
`
const HeaderBtn = styled.button`
display: flex;
background-color: inherit;
border: none;
align-items: center;
padding: 0;
cursor: pointer;
color: ${props => props.theme.Body.TextColorLevels[2]};
font-size: 14px;
&:hover {
    color: ${props => props.theme.Body.TextColorLevels[0]};
}
`
const Prob = styled.li<{ isActive?: boolean }>`
    cursor: pointer;
    padding: 20px;
    background-color: ${props => props.isActive ? props.theme.Body.ContainerBgLevels[2] : "transparent"};
    &:hover {
        background-color: ${props => props.theme.Body.ContainerBgLevels[2]};
    }
    & .title {
        margin: 0;
        padding: 0;
        font-size: 14px;
        color: ${props => props.isActive ? "rgb(107,157,248)" : props.theme.Body.TextColorLevels[1]};
        margin-bottom: 2px;
    }
    & .sub {
        margin: 0;
        padding: 0;
        font-size: 11px;
        color: ${props => props.theme.Body.TextColorLevels[3]};
    }
`
const ShowBgDark = keyframes`
    0% {
        opacity:0;
    }
    100% {
        opacity: 0.4;
    }
`
const BgDark = styled.div`
    width:100vw;
    height: 100vh;
    background-color: #000;
    z-index: 9999;
    position: fixed;
    opacity: 0.4;
    animation: ${ShowBgDark} 0.2s ease-out;
`
export const SideBar = (props: { prob: [{ ProblemName: string, rating: number, ProblemCode: number }],ProblemCode:number, closeFn: Function }) => {
    return (
        <>
            <BgDark onClick={() => props.closeFn()} />
            <Container>
                <Heading>
                    <Link href={"/problems"}>
                        <HeaderBtn>
                            <Icon><FiChevronLeft /></Icon>
                            문제 목록
                        </HeaderBtn>
                    </Link>
                    <HeaderBtn onClick={() => props.closeFn()}>
                        <Icon>
                            <AiOutlineClose />
                        </Icon>
                    </HeaderBtn>
                </Heading>
                <Body>
                    {props.prob.map((elem, index) => {
                        return (
                            <Link key={elem.ProblemName + index} href={`/problems/${elem.ProblemCode}/description`}>
                            <Prob isActive={props.ProblemCode==elem.ProblemCode}>
                                <p className="title">
                                    {elem.ProblemName}
                                </p>
                                <p className="sub">
                                    레이팅 {elem.rating}
                                </p>
                            </Prob>
                            </Link>
                        )
                    })}
                </Body>
            </Container>
        </>

    )
}