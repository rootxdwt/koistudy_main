import styled, { keyframes, ThemeConsumer } from "styled-components"
import { RiUser3Fill } from 'react-icons/ri'
import { MdDarkMode, MdLightMode, MdLogout, MdOutlineSearch, MdVerified } from 'react-icons/md'
import { FiChevronDown } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from "../../store";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'
import Image from "next/image";
import Link from "next/link";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const HeaderComp = styled.header<{ isTop: any }>`
position:fixed;

z-index:20;
top:0;
width: 100vw;
display:flex;
align-items:center;
border-bottom: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
background-color: ${props => props.theme.Header.BgColor};
& div.contentHolder {
    padding: 0px;
    height: 40px;
    margin-left:auto;
    margin-right:auto;
    display:flex;
    align-items:center;
    justify-content: center;
    font-family: 'Poppins', sans-serif;
    color: ${props => props.theme.Body.TextColorLevels[3]};
    width: 95vw;

      @media(max-width: 900px) {
        width: 90vw;
        margin-left:auto;
        margin-right:auto;
      }

}
& p {
    display:flex;
    align-items:center;
    cursor:pointer;
    margin: 0;
    margin-left: 10px;
}
& span {
    display:flex;
    align-items:center;
}
`

const BtnHolder = styled.div`
display:flex;
margin-left:auto;
margin-right:0;
flex-direction: row;
align-items: center;
`
const BtnComp = styled.p`
font-size: 17px;
display:flex;
align-items:center;
justify-content:center;
color: ${props => props.theme.Body.TextColorLevels[3]};

border-radius: 5px;
cursor:pointer;
margin:0;
margin-left: 20px;
z-index:1;
min-height: 30px;
min-width: 30px;
&:hover {
    background-color: ${props => props.theme.Body.ContainerBgLevels[1]};
  }
`


const DropDownBtn = styled.span<{ isDropped: boolean }>`
    color: ${props => props.theme.Body.TextColorLevels[1]};
    transform: rotate(${props => props.isDropped ? "90" : "-90"}deg);
    transition: transform 0.3s cubic-bezier(.5,0,.56,.99);
    cursor:pointer;
    font-size: 14px;
    margin: 0;
    padding: 0;
`

const ProfileBtnHolder = styled.div`
  width: 200px;
  position: fixed;
  top: 80px;
  z-index:99;
  background-color: ${props => props.theme.Header.BgColor};
  border-radius: 10px;
  padding: 5px;
  box-shadow: ${props => props.theme.Body.ContainerBgLevels[2]} 0px 0px 10px;
  --hwidth: 1200px;
@media(max-width: 1800px) {
  --hwidth: 1300px;
  }
  @media(max-width: 1700px) {
    --hwidth: 1200px;
  }
  @media(max-width: 1500px) {
    --hwidth: 1100px;
  }
  @media(max-width: 1300px) {
    --hwidth: 1000px;
  }
  @media(max-width: 1200px) {
    --hwidth: 900px;
  }
  @media(max-width: 900px) {
    --hwidth: 90vw;
  }
  right: 20px;

`

const LogoArea = styled.div`
  display:flex;
  align-items: center;
  margin-right: 10px;
  & p {
    color: ${props => props.theme.Body.TextColorLevels[2]};
    margin-left: 10px;

  }
`

const LogoIcon = styled.div`
display: flex;
align-items: center;
justify-content: center;
position: relative;
&::before {
  background: linear-gradient(90deg, rgb(107,157,248) 0%, rgb(131,81,246) 100%);
  width: 100%;
  height: 20px;
  content: "";
  display: block;
  position: absolute;
  z-index: -1;
  filter: blur(6px);
  opacity: 0.8;
}
`
const UserButton = styled.div`
  height: 50px;
  display:flex;
  align-items: center;
  padding: 0 10px;
  justify-content: space-between;
  border-radius:10px;
  
  cursor:pointer;

  & p{
    margin:0;
  }
  & .userInfo {
    display:flex;
    flex-direction: column;
    align-items:flex-end;
    color: ${props => props.theme.Body.TextColorLevels[3]};
  }
  & .userName {
    font-size: 12px;
    margin:0;
    color: ${props => props.theme.Body.TextColorLevels[2]};
    display:flex;
    align-items:center;
    p{
      max-width: 120px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    }
    .badge{
      margin-left: 5px;
    }
  }
  & .sub {
    margin:0;
    font-size: 8px;
    max-width: 120px;
    color: ${props => props.theme.Body.TextColorLevels[4]};
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  &:hover {
    background-color: ${props => props.theme.Container.backgroundColor};
  }

`

interface UserResp {
    Id: string
    Mail: string
    MailVerified: string
    PfpURL: string
    Rank: number
    isAdmin: boolean
    Uid: string
}

const HeaderSkeleton = () => {
    return (
        <ThemeConsumer>
            {theme => <SkeletonTheme baseColor={theme.Container.backgroundColor} highlightColor={theme.Body.ContainerBgLevels[0]}>
                <Skeleton width={180} height={15} borderRadius={5} count={2} style={{ "flexShrink": "none" }} />
            </SkeletonTheme>}
        </ThemeConsumer>
    )
}

const LogOutBtn = styled.div`
  display:flex;
  align-items:center;
  justify-content: flex-end;
  font-size:13px;
  padding: 5px 10px;
  border-radius: 5px;

  margin-top: 5px;
  cursor: pointer;
  color: ${props => props.theme.Body.TextColorLevels[3]};
  &:hover {
    color: ${props => props.theme.Body.TextColorLevels[1]};
  }
  & p{
    font-size:11px;
    margin:0;
    margin-left: 5px;
  }
`

const LoginInIdentifier = styled.div`
  color: ${props => props.theme.Body.TextColorLevels[1]};
  font-size: 13px;
  display:flex;
  width: 100%;
  height: 100%;
  align-items: center;
`

const ProbNavBtn = styled.div`
  display: flex;
  padding: 3px;
  border-radius: 5px;
  font-family: 'Noto Sans KR', sans-serif;
  margin-left: 15px;
  cursor: pointer;
  color:${props => props.theme.Body.TextColorLevels[1]};
  border: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
  & p {
    margin: 0;
    padding: 0;
    font-size: 12px;
    margin-left: 3px;
    padding-right: 5px;
  }
  &:hover {
    background-color: ${props => props.theme.Button.backgroundColor};
  }
`

const LoginBtn = styled.div`
font-family: 'Noto Sans KR', sans-serif;
font-size: 12px;
padding: 4px 13px;
border-radius:5px;
margin-left: 20px;
cursor:pointer;
background-color: rgb(107, 157, 248);
color: ${props => props.theme.Body.backgroundColor};
`


const ImageHolder = styled.div`
  
  width: 32px;
  height: 32px;
  border-radius: 20px;
  overflow:hidden;
`

const HeaderPfHolder = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 7px;
  border-radius: 10px;
  &:hover {
    background-color: ${props => props.theme.Body.ContainerBgLevels[1]};
  }
`
const HeaderImageHolder = styled.div`
  width: 25px;
  height: 25px;
  border-radius: 5px;
  overflow:hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
`
const HeaderDropDown = styled.div<{ isRotated?: boolean }>`
display: flex;
align-items: center;
justify-content: center;
margin-left: 8px;
rotate: ${props => props.isRotated ? "180deg" : "0deg"};
transition: rotate 0.1s ease-in-out;
`


export const Header = (props: { forwardNavigatable?: { target: number }, backwardNavigatable?: { target: number } }) => {
    const dispatch = useDispatch()
    const isDark = useSelector<StateType, boolean>(state => state.theme.isDarkTheme);

    const [isLoaded, setLoadState] = useState(false)
    const [userInfoShown, setuserInfo] = useState(false)
    const [userInfoJson, setJson] = useState<UserResp>()
    const [isLoggedIn, setLogin] = useState<boolean>(true)
    const router = useRouter();

    useEffect(() => {
        fetch('/api/user', { method: "POST", headers: { "Authorization": localStorage.getItem("tk") || "" } }).then((resp) => {
            if (!resp.ok) {
                setLogin(false)
                return undefined
            }
            return resp.json()
        }).then((jsn) => {
            setJson(jsn)
        })
    }, [userInfoShown])

    useEffect(() => setLoadState(true), [props])
    return (
        <>
            {isLoaded ? <>
                < HeaderComp isTop={props.forwardNavigatable || props.backwardNavigatable} >
                    <div className="contentHolder">
                        <LogoArea>
                            <Link href="/">
                                <LogoIcon>
                                    <Image src="/logo.png" width={33} height={33} alt="koilogo" />
                                </LogoIcon>
                            </Link>

                        </LogoArea>
                        {props.forwardNavigatable ?
                            <ProbNavBtn onClick={() => router.push(`/problems/${props.forwardNavigatable!.target}/description`)}>
                                <DropDownBtn isDropped={true}>
                                    <FiChevronDown />
                                </DropDownBtn>
                            </ProbNavBtn>
                            : <></>}

                        {props.backwardNavigatable ?
                            <ProbNavBtn onClick={() => router.push(`/problems/${props.backwardNavigatable!.target}/description`)}>
                                <DropDownBtn isDropped={false}>
                                    <FiChevronDown />
                                </DropDownBtn>
                            </ProbNavBtn>
                            : <></>}

                        <BtnHolder>
                            {/* <BtnComp onClick={() => dispatch({ type: "theme/toggle" })}>
                {isDark ? <MdDarkMode /> : <MdLightMode />}

              </BtnComp> */}
                            <BtnComp>
                                <MdOutlineSearch />
                            </BtnComp>
                            {isLoggedIn ?
                                <BtnComp onClick={() => setuserInfo(!userInfoShown)}>
                                    <HeaderPfHolder>
                                        <HeaderImageHolder>
                                            {typeof userInfoJson !== "undefined" ?
                                                <Image width={25} height={25} alt="pfp" src={userInfoJson.PfpURL}></Image> : <></>}
                                        </HeaderImageHolder>
                                        <HeaderDropDown isRotated={userInfoShown}>
                                            <FiChevronDown />
                                        </HeaderDropDown>

                                    </HeaderPfHolder>

                                </BtnComp> :
                                <Link href={`/auth/?redir=${encodeURIComponent(router.asPath)}`}><LoginBtn>로그인</LoginBtn></Link>
                            }
                        </BtnHolder>
                    </div>
                </HeaderComp >
                {userInfoShown ?
                    <ProfileBtnHolder onClick={() => { if (typeof userInfoJson !== "undefined") { router.push(`/user/${userInfoJson.Uid}`) } else if (!isLoggedIn) { router.push(`/auth/?redir=${encodeURIComponent(router.asPath)}`) } }}>
                        <UserButton>
                            {typeof userInfoJson !== "undefined" ?
                                <>
                                    <ImageHolder>
                                        <Image width={35} height={35} alt="pfp" src={userInfoJson.PfpURL}></Image>
                                    </ImageHolder>
                                    <div className="userInfo">
                                        <div className="userName">
                                            <p>
                                                {userInfoJson.Id}
                                            </p>
                                            <div className="badge">
                                                {userInfoJson.isAdmin ? <MdVerified /> : <></>}
                                            </div>
                                        </div>
                                        <p className="sub">
                                            {userInfoJson.Mail}
                                        </p>
                                    </div>
                                </>
                                : <>
                                    {isLoggedIn ? <>
                                        <HeaderSkeleton />
                                    </> : <LoginInIdentifier>
                                        로그인하세요
                                    </LoginInIdentifier>}
                                </>}
                        </UserButton>
                        {isLoggedIn && typeof userInfoJson !== "undefined" ? <><LogOutBtn onClick={() => { localStorage.removeItem("tk"); router.reload() }}>
                            <RiUser3Fill />
                            <p>
                                개인 설정
                            </p>
                        </LogOutBtn><LogOutBtn onClick={() => { localStorage.removeItem("tk"); router.reload() }}>
                                <MdLogout />
                                <p>
                                    로그아웃
                                </p>
                            </LogOutBtn></> : <></>}
                    </ProfileBtnHolder> :
                    <></>
                }
            </> : <></>
            }
        </>
    )
}