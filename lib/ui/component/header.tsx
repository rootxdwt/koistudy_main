import styled from "styled-components"
import { RiUser3Fill } from 'react-icons/ri'
import { MdDarkMode, MdLightMode, MdLogout, MdOutlineSearch, MdVerified } from 'react-icons/md'
import { FiChevronDown } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from "../../store";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'
import Image from "next/image";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
    width: 1300px;
    display:flex;
    align-items:center;
    font-family: 'Poppins', sans-serif;
    color: ${props => props.theme.Body.TextColorLevels[3]};
    justify-content: space-between;
    @media(max-width: 1800px) {
        width: 1200px;
      }
      @media(max-width: 1700px) {
        width: 1100px;
      }
      @media(max-width: 1500px) {
        width: 1000px;
      }
      @media(max-width: 1300px) {
        width: 900px;
      }
      @media(max-width: 1200px) {
        width: 800px;
      }
      @media(max-width: 900px) {
        width: 80vw;
        margin-left:auto;
        margin-right:auto;
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
    overflow-x:scroll;
    scrollbar-width: none; 
    &::-webkit-scrollbar {
    display: none;
    }

`

const SubHolder = styled.div`
width: 1300px;
@media(max-width: 1800px) {
    width: 1200px;
  }
  @media(max-width: 1700px) {
    width: 1100px;
  }
  @media(max-width: 1500px) {
    width: 1000px;
  }
  @media(max-width: 1300px) {
    width: 900px;
  }
  @media(max-width: 1200px) {
    width: 800px;
  }
  @media(max-width: 900px) {
    width: 80vw;
    margin-left:auto;
    margin-right:auto;
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

interface PropObj {
  name: string,
  action: any
}

const ProfileBtnHolder = styled.div`
  width: 200px;
  position: fixed;
  top: 75px;
  z-index:99;
  background-color: ${props => props.theme.Body.backgroundColor};
  border:solid 2px ${props => props.theme.Container.backgroundColor};
  border-radius: 10px;
  padding: 5px;
  --hwidth: 1300px;
@media(max-width: 1800px) {
  --hwidth: 1200px;
  }
  @media(max-width: 1700px) {
    --hwidth: 1100px;
  }
  @media(max-width: 1500px) {
    --hwidth: 1000px;
  }
  @media(max-width: 1300px) {
    --hwidth: 900px;
  }
  @media(max-width: 1200px) {
    --hwidth: 800px;
  }
  @media(max-width: 900px) {
    --hwidth: 80vw;
  }
  right: calc((100vw - var(--hwidth))/2);

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
}

const HeaderSkeleton = (props: { isDark: boolean }) => {
  const baseColor = props.isDark ? "rgb(20,20,20)" : "rgb(245,245,245)"
  const hlColor = props.isDark ? "rgb(50,50,50)" : "rgb(255,255,255)"
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
  font-size:10pt;
  padding: 5px 10px;
  border-radius: 5px;

  margin-top: 5px;
  cursor: pointer;
  color: ${props => props.theme.Body.TextColorLevels[3]};
  &:hover {
    color: ${props => props.theme.Body.TextColorLevels[1]};
  }
  & p{
    font-size:8pt;
    margin:0;
    margin-left: 5px;
  }
`
export const Header = (props: { at: Array<PropObj>, currentPage: string }) => {
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
      setJson(undefined)
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
        < HeaderComp >
          <div className={`h`}>
            <p onClick={() => setShown(!isShown)} >{props.currentPage}
              <DropDownBtn isDropped={isShown} >
                <FiChevronDown />
              </DropDownBtn>
            </p>
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
        <Subheader isShown={isShown}>
          <SubHolder>
            {props.at.map((elem, index) => <MenuNavBtn isActive={props.currentPage == elem.name} key={index} onClick={() => { elem.action(); setShown(false) }}>{elem.name}</MenuNavBtn>)}
          </SubHolder>
        </Subheader>
        {userInfoShown ?
          <ProfileBtnHolder>
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
                  {isLoggedIn ? <><HeaderSkeleton isDark={isDark} /></> : <>로그인하세요</>}
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