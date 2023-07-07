import { useSelector } from "react-redux";
import { StateType } from "@/lib/store";
import { DarkTheme, LightTheme } from "@/lib/ui/theme";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import styled from "styled-components";
import { Header } from "@/lib/ui/component/header";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import crypto from "crypto"
import { createClient } from 'redis';
import Head from "next/head";

const ParentContainer = styled.div`
width: 250px;
display:flex;
color: ${props => props.theme.Body.TextColorLevels[2]};
font-family: 'Open Sans', sans-serif;
padding: 30px 50px;
flex-direction:column;
position: absolute;
left: 50%;
top: 300px;
transform: translate(-50%,-50%);
justify-content:center;
border-radius: 20px;
align-items: center;
@media(max-width: 590px) {
    width: calc(100% - 100px);
    padding: 0px 50px;
    height: 100vh;
    margin-top: 0;
    border: none;
}
& h1 {
    font-size: 20px;
    margin: 0px;
    margin-top: 20px;
    margin-bottom: 10px;
} & p {
    font-size: 11px;
    margin: 0px;
    margin-bottom: 20px;
}
`


const SigninBtn = styled.div<{ bgColor: string, txtColor: string }>`
background-color: ${props => props.bgColor};
color: ${props => props.txtColor};
margin-top: 13px;
font-size: 12px;
display:flex;
align-items:center;
height: 35px;
width: 100%;
border-radius:10px;
overflow:hidden;
max-width: 300px;
border:solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
user-select:none;
cursor:pointer;

`

const LogoContainer = styled.div`
display:flex;
margin-right: 10px;
height:100%;
width: 60px;
align-items:center;
justify-content:center;
`
const PolicyContainer = styled.div`
border-top: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
padding-top: 20px;
font-size: 11px;
margin-top: 20px;
color: ${props => props.theme.Body.TextColorLevels[3]};
& a {
    color: ${props => props.theme.Body.TextColorLevels[2]};
}
`

export default function Login(data: any) {
    const isDark = useSelector<StateType, boolean>(state => state.theme);
    const [isLoaded, setLoad] = useState(false)
    const router = useRouter()
    useEffect(() => {
        setLoad(true)
        const interval = setInterval(() => router.replace(router.asPath), 120000)
        return () => clearInterval(interval)
    }, [])
    return (
        <>
            <Head>
                <title>
                    KOISTUDY
                </title>
            </Head>
            <ThemeProvider theme={isDark ? DarkTheme : LightTheme} >
                <Header currentPage="login" />
                <GlobalStyle />
                {isLoaded ?
                    <ParentContainer>
                        <h1>통합 로그인</h1>
                        <p>로그인하고 코드를 작성해 보세요</p>
                        <SigninBtn bgColor="#fff" txtColor="#303030" onClick={() => router.push(`https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=http://localhost:3000/auth/redirect/google&client_id=417400386686-s890d90hvopobco24fpkocga45p3t3h1.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/userinfo.email&state=${data.nonce}`)}>
                            <LogoContainer>
                                <Image alt="google" src="https://cdn.ecdev.me/gLogo.png" width="15" height="15" />
                            </LogoContainer>
                            Google로 계속하기</SigninBtn>
                        <SigninBtn bgColor="#1d1d1d" txtColor="#d6d6d6" onClick={() => router.push(`https://github.com/login/oauth/authorize?client_id=3ee621b68f1950df0ba0&state=${data.nonce}&scope=user:email`)}>
                            <LogoContainer>
                                <Image alt="github" src="https://cdn.ecdev.me/github-mark-white.png" width="14" height="14" />
                            </LogoContainer>Github로 계속하기</SigninBtn>
                        <PolicyContainer>
                            계속하면 <a href="">개인정보처리방침</a> 과 <a href="">이용약관</a> 에 동의하는 것으로 간주됩니다.
                        </PolicyContainer>
                    </ParentContainer>
                    : <></>}
            </ThemeProvider>
        </>
    )
}

export const getServerSideProps = async () => {
    const csrfToken = crypto.randomBytes(16).toString('hex')
    const client = createClient();
    await client.connect();
    await client.set(csrfToken, 'true', { EX: 120 });
    return { props: { nonce: csrfToken } }
};
