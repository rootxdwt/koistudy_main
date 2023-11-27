import { useSelector } from "react-redux";
import { StateType } from "@/lib/store";
import { DarkTheme, LightTheme } from "@/lib/ui/theme";

import styled, { createGlobalStyle } from "styled-components";
import { Header } from "@/lib/ui/component/header";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import crypto from "crypto"
import { createClient } from 'redis';
import Head from "next/head";
import { BsArrowRightShort } from 'react-icons/bs'

const ItemHolder = styled.div`
    display: flex;
    width: 100vw;
    height: 100vh;
    align-items: center;
    flex-direction: column;
`

const GlobalStyle = createGlobalStyle`
a {
	text-decoration: none;
}


  body,html {
    margin: 0;
    padding: 0;
    background-color: #fff;
    overflow: auto;
    font-family: 'Noto Sans KR', sans-serif;
  }
    
`



const ParentContainer = styled.div`
width: 290px;
display:flex;
color: rgb(75,75,75);
font-family: 'Open Sans', sans-serif;
padding: 50px;
flex-direction:column;
border-radius: 5px;
top: 300px;
justify-content:center;
align-items: center;
@media(max-width: 590px) {
    width: calc(100% - 100px);
    padding: 0px 50px;
    margin-top: 0;
    border: none;
}
& h1 {
    font-size: 25px;
    margin: 0px;
    margin-top: 20px;
    margin-bottom: 10px;
} & p {
    font-size: 12px;
    margin: 0px;
    margin-bottom: 30px;
    color: rgb(115,115,115);
}
`


const SigninBtn = styled.div<{ bgColor: string, txtColor: string }>`
background-color: ${props => props.bgColor};
color: ${props => props.txtColor};
margin-top: 15px;
font-size: 12.5px;
display:flex;
align-items:center;
height: 40px;
width: 100%;
border-radius:10px;
justify-content: center;
overflow:hidden;
max-width: 300px;
border:solid 2px #1d1d1d;
user-select:none;
font-weight: 500;
cursor:pointer;

`

const LogoContainer = styled.div`
display:flex;
margin-right: 10px;
height:100%;
align-items:center;
justify-content:center;
`

const Otheroption = styled.div`
    border-top:solid 1px rgb(210,210,210);
    width: 100%;
    margin-top: 30px;
    padding-top: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    position: relative;

    & input {
        height: 40px;
        width: calc(100% - 30px);
        border-radius: 10px;
        border: none;
        background-color: transparent;
        border:solid 2px #1d1d1d;
        padding: 0px 15px;
        color: #1d1d1d;
        font-size: 14px;
        font-weight: 400;
    }
    & input::placeholder {
        color: #3e3e3e;
    }
    input[type="password"] {
    font-family: Verdana;
}
    & input:nth-child(2) {
        margin-top: 15px;
    }
    & input:focus {
        outline: none;
        border-color: rgb(131,81,246);
    }
    
`
const PolicyContainer = styled.p`
padding-top: 20px;
font-size: 11px;
margin-top: 20px;
color: rgb(115,115,115);
& a {
    color: rgb(75,75,75);
}
`

const KSLogoHolder = styled.div`
    display: flex;
    font-weight: 400;
    align-items: center;
    margin: 50px 0px;
    & p {
        margin: 0;
        margin-left: 10px;
    }
`

const SubmitBtn = styled.div<{ isShown: boolean }>`
position: absolute;
display: ${props => props.isShown ? "flex" : "none"};
width: 25px;
height: 25px;
right: 9px;
bottom: 9px;
border-radius: 6px;
background-color: #1d1d1d;
cursor: pointer;
align-items: center;
justify-content: center;
color: #fff;
font-size: 24px;
&:hover {
    background-color: rgb(107,157,248);
}
`


export default function Login(data: any) {
    const [isLoaded, setLoad] = useState(false)
    const router = useRouter()
    const [stateValue, setStateValue] = useState("")
    const IDRef = useRef<any>()
    const PWRef = useRef<any>()
    const [inputDone, setInputDone] = useState(false)

    useEffect(() => {

        setLoad(true)
        const interval = setInterval(() => router.replace(router.asPath), 600000)
        setStateValue(Buffer.from(JSON.stringify({ nonce: data.nonce, redir: router.query.redir, orgRegKey: router.query.orgRegKey })).toString('base64'))
        return () => clearInterval(interval)
    }, [])

    const HandleOnchange = () => {
        setInputDone(IDRef.current.value.length > 0 && PWRef.current.value.length > 0)
    }
    return (
        <>
            <Head>
                <title>
                    코이스터디
                </title>
            </Head>
            <GlobalStyle />
            <ItemHolder>
                <KSLogoHolder>

                </KSLogoHolder>
                {isLoaded ?
                    <ParentContainer>
                        <h1>코이스터디 시작하기</h1>
                        <p>로그인/가입하고 코드를 작성해 보세요</p>
                        <SigninBtn bgColor="#fff" txtColor="#303030" onClick={() => router.push(`https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=http://localhost:3000/auth/redirect/google&client_id=417400386686-s890d90hvopobco24fpkocga45p3t3h1.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/userinfo.email&state=${stateValue}`)}>
                            <LogoContainer>
                                <Image alt="google" src="https://cdn.ecdev.me/gLogo.png" width="15" height="15" />
                            </LogoContainer>
                            Google 계정을 사용해 계속하기</SigninBtn>
                        <SigninBtn bgColor="#1d1d1d" txtColor="#d6d6d6" onClick={() => router.push(`https://github.com/login/oauth/authorize?client_id=3ee621b68f1950df0ba0&state=${stateValue}&scope=user:email`)}>
                            <LogoContainer>
                                <Image alt="github" src="https://cdn.ecdev.me/github-mark-white.png" width="14" height="14" />
                            </LogoContainer>Github 계정을 사용해 계속하기
                        </SigninBtn>

                        <Otheroption>
                            <input type="text" placeholder="아이디" onChange={HandleOnchange} ref={IDRef} />
                            <input type="password" placeholder="비밀번호" onChange={HandleOnchange} ref={PWRef} />
                            <SubmitBtn isShown={inputDone}><BsArrowRightShort /></SubmitBtn>
                        </Otheroption>
                    </ParentContainer>
                    : <></>}

                <PolicyContainer>
                    &copy; 코이스터디  |  <a href="">개인정보처리방침</a>  |  <a href="">이용약관</a>
                </PolicyContainer>
            </ItemHolder>
        </>
    )
}

export const getServerSideProps = async () => {
    const csrfToken = crypto.randomBytes(16).toString('hex')
    const client = createClient();
    await client.connect();
    await client.set(csrfToken, 'true', { EX: 600 });
    return { props: { nonce: csrfToken } }
};
