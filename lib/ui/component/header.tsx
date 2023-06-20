import styled, { keyframes } from "styled-components"
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

const HeaderComp = styled.header<{ isTop: boolean }>`
position:fixed;

z-index:20;
top:0;
width: 100vw;
display:flex;
align-items:center;

background-color: ${props => props.theme.Body.backgroundColor};

& div.contentHolder {
    border-bottom: solid 2px ${props => props.isTop ? "transparent" : props.theme.Body.ContainerBgLevels[1]};
    padding: 13px 0px;
    margin-left:auto;
    margin-right:auto;
    width: 1400px;
    display:flex;
    align-items:center;
    justify-content: center;
    font-family: 'Poppins', sans-serif;
    color: ${props => props.theme.Body.TextColorLevels[3]};
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
        width: 90vw;
        margin-left:auto;
        margin-right:auto;
      }
      @media (max-width: 770px) {
        width: 90vw;
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
    margin-left:2px;
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
font-size:15px;
&:hover {
    color: ${props => props.theme.Body.TextColorLevels[2]};
}

`


const DropDownBtn = styled.span<{ isDropped: boolean }>`
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
  top: 75px;
  z-index:99;
  background-color: ${props => props.theme.Body.backgroundColor};
  border:solid 2px ${props => props.theme.Container.backgroundColor};
  border-radius: 10px;
  padding: 5px;
  --hwidth: 1400px;
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
  right: calc((100vw - var(--hwidth))/2);

`

const LogoArea = styled.div`
  display:flex;
  align-items: center;
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
    height: 23px;
    content: "";
    display: block;
    position: absolute;
    z-index: -1;
    filter: blur(7px);
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

const ImageHolder = styled.div`
  
  width: 30px;
  height: 30px;
  border-radius: 20px;
  overflow:hidden;
  border: solid 2px gold;
`

const PfpHolder = (props: { imgSrc: string }) => {
  return (
    <ImageHolder>
      <Image width={30} height={30} alt="pfp" src={props.imgSrc}></Image>
    </ImageHolder>
  )
}

interface UserResp {
  Id: string
  Mail: string
  MailVerified: string
  PfpURL: string
  Rank: number
  isAdmin: boolean
  Uid: string
}

const HeaderSkeleton = (props: { isDark: boolean }) => {
  const baseColor = props.isDark ? "rgb(50,50,50)" : "rgb(245,245,245)"
  const hlColor = props.isDark ? "rgb(70,70,70)" : "rgb(234, 234, 234)"
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={hlColor}>
      <Skeleton width={180} height={15} borderRadius={5} count={2} style={{ "flexShrink": "none" }} />
    </SkeletonTheme>
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

const ProbListBtn = styled.div`
  display: flex;
  padding: 3px;
  border-radius: 5px;
  font-family: 'Noto Sans KR', sans-serif;
  margin-left: 15px;
  cursor: pointer;
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

const LeftProbList = styled.div<{ isShown: boolean }>`
  position:fixed;
  left: ${props => props.isShown ? 0 : -300}px;
  transition: left 0.3s cubic-bezier(.5,0,.56,.99);
  top: 0;
  height: 100vh;
  width: 300px;
  background-color: ${props => props.theme.Body.backgroundColor};
  z-index: 999;
  border-right: solid 1px ${props => props.theme.Button.backgroundColor};
  display: flex;
  align-items: center;
  flex-direction: column;
`

const ProbItem = styled.div`
display: flex;
  width: 90%;
  height: 50px;

  font-size: 13px;
  align-items: center;
  border-bottom: solid 1px ${props => props.theme.Button.backgroundColor};
  color: ${props => props.theme.Body.TextColorLevels[2]};
`
const Showan = keyframes`
0% {
  opacity: 0;
}
100% {
  opacity: 0.8;
}
`

const BgHdn = styled.div<{ isShown: boolean }>`
background-color: ${props => props.theme.Body.backgroundColor};
animation: ${Showan} 0.3s cubic-bezier(.5,0,.56,.99);
opacity: 0.8;
position: fixed;
width: 100vw;
height: 100vh;
z-index: 998;
top:0;
left: 0;
display: ${props => props.isShown ? "block" : "none"};
`

export const Header = (props: { currentPage: string }) => {
  const dispatch = useDispatch()
  const isDark = useSelector<StateType, boolean>(state => state.theme);
  const [isLoaded, setLoadState] = useState(false)
  const [isShown, setShown] = useState(false)
  const [userInfoShown, setuserInfo] = useState(false)
  const [userInfoJson, setJson] = useState<UserResp>()
  const [isLoggedIn, setLogin] = useState<boolean>(true)
  const [isTop, setIsTop] = useState(true)

  const verticalListner = () => {
    if (window.scrollY == 0) {
      setIsTop(true)
    } else {
      setIsTop(false)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', verticalListner)
    return () => window.removeEventListener('scroll', verticalListner)
  }, [])


  const router = useRouter();

  useEffect(() => {
    if (userInfoShown) {
      fetch('/api/user', { method: "POST", headers: { "Authorization": localStorage.getItem("tk") || "" } }).then((resp) => {
        if (!resp.ok) {
          setLogin(false)
          return undefined
        }
        return resp.json()
      }).then((jsn) => {
        setJson(jsn)
      })
    }
  }, [userInfoShown])
  useEffect(() => setLoadState(true), [])
  return (
    <>
      {isLoaded ? <>
        < HeaderComp isTop={isTop}>
          <BgHdn isShown={isShown} onClick={() => setShown(false)} />
          <LeftProbList isShown={isShown}>
            <ProbItem>Wonderland Chase</ProbItem>
            <ProbItem>이진트리의 전위순회</ProbItem>
            <ProbItem>이진트리의 중위순회</ProbItem>

          </LeftProbList>
          <div className="contentHolder">
            <LogoArea>
              <Link href="/">
                <LogoIcon>
                  <Image src="/logo.png" width={33} height={33} alt="koilogo" />
                </LogoIcon>
              </Link>

            </LogoArea>
            <ProbListBtn onClick={() => setShown(!isShown)}>
              <DropDownBtn isDropped={isShown}>
                <FiChevronDown />
              </DropDownBtn>
            </ProbListBtn>
            <BtnHolder>
              <BtnComp onClick={() => setuserInfo(!userInfoShown)}>
                <RiUser3Fill />

              </BtnComp>
              <BtnComp onClick={() => dispatch({ type: "theme/toggle" })}>
                {isDark ? <MdDarkMode /> : <MdLightMode />}

              </BtnComp>
            </BtnHolder>
          </div>
        </HeaderComp >
        {userInfoShown ?
          <ProfileBtnHolder onClick={() => { if (typeof userInfoJson !== "undefined") { router.push(`/user/${userInfoJson.Uid}`) } else if (!isLoggedIn) { router.push("/auth/login") } }}>
            <UserButton>
              {typeof userInfoJson !== "undefined" ?
                <>
                  <PfpHolder imgSrc={userInfoJson.PfpURL} />
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
                  {isLoggedIn ? <><HeaderSkeleton isDark={isDark} /></> : <LoginInIdentifier>로그인하세요</LoginInIdentifier>}
                </>}
            </UserButton>
            {isLoggedIn && typeof userInfoJson !== "undefined" ? <LogOutBtn onClick={() => { localStorage.removeItem("tk"); router.reload() }}>
              <MdLogout />
              <p>
                로그아웃
              </p>
            </LogOutBtn> : <></>}
          </ProfileBtnHolder> :
          <></>
        }
      </> : <></>}
    </>
  )
}