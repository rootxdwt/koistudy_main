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

const HeaderComp = styled.header<{ isTop: any, isTransparent: boolean }>`
position:fixed;

z-index:20;
top:0;
width: 100vw;
display:flex;
align-items:center;
border-bottom: solid 1px ${props => props.isTop ? props.theme.Body.ContainerBgLevels[1] : "transparent"};

background-color: ${props => props.isTransparent ? "transparent" : props.theme.Body.backgroundColor};

& div.contentHolder {
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

const ProbNavBtn = styled.div`
  display: flex;
  padding: 3px;
  border-radius: 5px;
  font-family: 'Noto Sans KR', sans-serif;
  margin-left: 15px;
  cursor: pointer;
  color:${props => props.theme.Body.TextColorLevels[1]};
  border: solid 1px ${props => props.theme.Button.backgroundColor};
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

export const Header = (props: { currentPage: string, forwardNavigatable?: { target: number }, backwardNavigatable?: { target: number } }) => {
  const dispatch = useDispatch()
  const isDark = useSelector<StateType, boolean>(state => state.theme);
  const [isLoaded, setLoadState] = useState(false)
  const [isShown, setShown] = useState(false)
  const [userInfoShown, setuserInfo] = useState(false)
  const [userInfoJson, setJson] = useState<UserResp>()
  const [isLoggedIn, setLogin] = useState<boolean>(true)
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

  useEffect(() => setLoadState(true), [props])
  return (
    <>
      {isLoaded ? <>
        < HeaderComp isTop={props.forwardNavigatable || props.backwardNavigatable} isTransparent={props.currentPage == "login"} >
          <div className="contentHolder">
            <LogoArea>
              <Link href="/">
                <LogoIcon>
                  <Image src="/logo.png" width={33} height={33} alt="koilogo" />
                </LogoIcon>
              </Link>

            </LogoArea>
            {props.forwardNavigatable ?
              <ProbNavBtn >
                <Link href={`/problems/${props.forwardNavigatable.target}/description`}>
                  <DropDownBtn isDropped={true}>
                    <FiChevronDown />
                  </DropDownBtn>
                </Link>
              </ProbNavBtn>
              : <></>}

            {props.backwardNavigatable ?
              <ProbNavBtn>
                <Link href={`/problems/${props.backwardNavigatable.target}/description`}>
                  <DropDownBtn isDropped={false}>
                    <FiChevronDown />
                  </DropDownBtn>
                </Link>
              </ProbNavBtn>
              : <></>}

            <BtnHolder>
              {props.currentPage !== "login" ? <BtnComp onClick={() => setuserInfo(!userInfoShown)}>
                <RiUser3Fill />

              </BtnComp> : <></>}
              <BtnComp onClick={() => dispatch({ type: "theme/toggle" })}>
                {isDark ? <MdDarkMode /> : <MdLightMode />}

              </BtnComp>
            </BtnHolder>
          </div>
        </HeaderComp >
        {userInfoShown ?
          <ProfileBtnHolder onClick={() => { if (typeof userInfoJson !== "undefined") { router.push(`/user/${userInfoJson.Uid}`) } else if (!isLoggedIn) { router.push("/auth/") } }}>
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
                  {isLoggedIn ? <><HeaderSkeleton isDark={isDark} /></> : <LoginInIdentifier>
                    로그인하세요
                  </LoginInIdentifier>}
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
      </> : <></>
      }
    </>
  )
}