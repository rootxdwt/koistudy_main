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

const ItemHolder = styled.div`
    display: flex;
    width: 100vw;
    height: 100vh;
    align-items: center;
    flex-direction: column;
`

const ParentContainer = styled.div`
width: 290px;
display:flex;
color: ${props => props.theme.Body.TextColorLevels[2]};
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
    color: ${props => props.theme.Body.TextColorLevels[3]};
}
`


const SigninBtn = styled.div<{ bgColor: string, txtColor: string }>`
background-color: ${props => props.bgColor};
color: ${props => props.txtColor};
margin-top: 15px;
font-size: 12.5px;
display:flex;
align-items:center;
height: 36px;
width: 100%;
border-radius:10px;
justify-content: center;
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
align-items:center;
justify-content:center;
`

const Otheroption = styled.div`
    border-top: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
    width: 100%;
    margin-top: 20px;
    padding-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    & p {
        cursor: pointer;
        margin: 0;
        font-size: 12px;
        color: ${props => props.theme.Body.TextColorLevels[3]};
    }
`
const PolicyContainer = styled.p`
padding-top: 20px;
font-size: 11px;
margin-top: 20px;
color: ${props => props.theme.Body.TextColorLevels[3]};
& a {
    color: ${props => props.theme.Body.TextColorLevels[2]};
}
`

const KSLogoHolder = styled.div`
    display: flex;
    font-weight: 400;
    color: ${props => props.theme.Body.TextColorLevels[2]};
    align-items: center;
    margin: 50px 0px;
    & p {
        margin: 0;
        margin-left: 10px;
    }
`

export default function Login(data: any) {
    const isDark = useSelector<StateType, boolean>(state => state.theme);
    const [isLoaded, setLoad] = useState(false)
    const router = useRouter()
    const [stateValue, setStateValue] = useState("")
    const [usePassWord, setUsePassword] = useState(false)

    useEffect(() => {

        setLoad(true)
        const interval = setInterval(() => router.replace(router.asPath), 120000)
        setStateValue(Buffer.from(JSON.stringify({ nonce: data.nonce, redir: router.query.redir })).toString('base64'))
        console.log(stateValue)
        return () => clearInterval(interval)
    }, [])
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
                        <h1>계속하기</h1>
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
                            <p onClick={() => setUsePassword(!usePassWord)}>
                                {!usePassWord ? "아이디, 비밀번호 사용하기" : "Oauth2 사용하기"}
                            </p>
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
    await client.set(csrfToken, 'true', { EX: 120 });
    return { props: { nonce: csrfToken } }
};
