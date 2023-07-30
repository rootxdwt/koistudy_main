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
`

const NavBtn = styled.li<{ isActive?: boolean }>`

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