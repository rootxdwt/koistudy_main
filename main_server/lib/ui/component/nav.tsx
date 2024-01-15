import styled, { keyframes } from "styled-components"
import {
    useState,
    Fragment,
    useEffect,
} from "react"

import { FiChevronDown } from 'react-icons/fi'
import { AC, AW, TLE } from "../DefaultComponent"
import { useRouter } from "next/router"

const NavMain = styled.ul`
    display: flex;
    flex-direction: column;
    list-style-type: none;
    width: 200px;
    margin-top: 30px;
    background-color: ${props => props.theme.Container.backgroundColor};
    margin-right: 30px;
    border-radius: 10px;
`

const NavBtn = styled.li<{ isActive?: boolean }>`
    padding: 5px 10px;

`

export const Nav = () => {
    return (
        <NavMain>
            <NavBtn>
                메인
            </NavBtn>
            <NavBtn>
                문제
            </NavBtn>
            <NavBtn>
                대회
            </NavBtn>

        </NavMain>
    )
}