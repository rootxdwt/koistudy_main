import styled from "styled-components"
import { RiUser3Fill } from 'react-icons/ri'
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import { Rubik } from 'next/font/google'
import { FiChevronDown } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from "../store";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'

const HeaderComp = styled.header`
position:fixed;
background-color: ${props => props.theme.Body.backgroundColor};
z-index:10;
top:0;
width: 100vw;
height: 70px;
display:flex;
align-items:center;
& div.h {
    margin-left:auto;
    margin-right:auto;
    width: 800px;
    display:flex;
    align-items:center;
    font-family: 'Poppins', sans-serif;
    color: ${props => props.theme.Body.TextColorLevels[3]};
    justify-content: space-between;
    @media(max-width: 1300px) {
        width: 700px;
    }
    @media (max-width: 900px) {
        width: 80vw;
    }
    @media (max-width: 700px) {
        width: 80vw;
        left: 10vw;
    }

}
& p {
    display:flex;
    align-items:center;
    cursor:pointer;
}
& span {
    display:flex;
    align-items:center;
    margin-left:2px;
}
`

const BtnHolder = styled.div`
display:flex;
`
const BtnComp = styled.p`
font-size: 13pt;
width: 30px;
height: 30px;
display:flex;
align-items:center;
justify-content:center;
color: ${props => props.theme.Body.TextColorLevels[3]};
border-radius: 10px;
background-color: ${props => props.theme.Button.backgroundColor};
cursor:pointer;
margin:0;
margin-left: 20px;
z-index:1;
font-size:11pt;
&:hover {
    color: ${props => props.theme.Body.TextColorLevels[2]};
}

`

const Subheader = styled.div<{ isShown: boolean }>`
    z-index: 9;
    position:fixed;
    top: ${props => props.isShown ? "70" : "0"}px;
    transition: top 0.3s cubic-bezier(.5,0,.56,.99);

    background-color: ${props => props.theme.Body.backgroundColor};
    width: 100vw;
    display:flex;
    flex-direction:row;
    justify-content:center;
    align-items:center;
`

const SubHolder = styled.div`
width: 800px;
@media(max-width: 1300px) {
    width: 700px;
}
@media (max-width: 900px) {
    width: 80vw;
}
@media (max-width: 700px) {
    width: 80vw;
    left: 10vw;
}
display:flex;
justify-content:flex-start;
`

const DropDownBtn = styled.span<{ isDropped: boolean }>`
    transform: rotate(${props => props.isDropped ? "180" : "0"}deg);
    transition: transform 0.3s cubic-bezier(.5,0,.56,.99);
`

const MenuNavBtn = styled.div<{ isActive: boolean }>`
padding: 5px 15px;
font-size: 9pt;
margin-right: 10px;
cursor:pointer;
border-radius: 15px;
color: ${props => props.theme.Container.logoSubColor};
font-family: 'Poppins', sans-serif;
color: ${props => props.theme.Body.TextColorLevels[3]};
background-color: ${props => props.isActive ? props.theme.Button.backgroundColor : props.theme.Body.backgroundColor};
margin-bottom: 10px;
`

export const Header = () => {
    const dispatch = useDispatch()
    const currentTheme = useSelector<StateType>(state => state.theme)
    const [isLoaded, setLoadState] = useState(false)
    const [isShown, setShown] = useState(false)

    const router = useRouter();
    const currentRoute = router.pathname.split("/")[1] == "" ? "Home" : router.pathname.split("/")[1].charAt(0).toUpperCase() + router.pathname.split("/")[1].slice(1)
    useEffect(() => setLoadState(true), [])
    return (
        <>
            {isLoaded ? <>
                < HeaderComp >
                    <div className={`h`}>
                        <p onClick={() => setShown(!isShown)} >{currentRoute}
                            <DropDownBtn isDropped={isShown} >
                                <FiChevronDown />
                            </DropDownBtn>
                        </p>
                        <BtnHolder>
                            <BtnComp>
                                <RiUser3Fill />

                            </BtnComp>
                            <BtnComp onClick={() => dispatch({ type: "theme/toggle" })}>
                                {currentTheme ? <MdDarkMode /> : <MdLightMode />}

                            </BtnComp>
                        </BtnHolder>
                    </div>
                </HeaderComp >
                <Subheader isShown={isShown}>
                    <SubHolder>
                        {[{ name: "Home", route: "/" }, { name: "Problems", route: "/problems" }].map((elem, index) => <MenuNavBtn isActive={currentRoute == elem.name} key={index} onClick={() => router.push(elem.route)}>{elem.name}</MenuNavBtn>)}
                    </SubHolder>
                </Subheader>
            </> : <></>}
        </>
    )
}