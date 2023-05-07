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

const ParentContainer = styled.div`
width: 230px;
display:flex;
margin-left:auto;
margin-right:auto;
color: ${props => props.theme.Body.TextColorLevels[2]};
font-family: 'Open Sans', sans-serif;
padding: 30px;
flex-direction:column;
margin-top: 50px;
justify-content:center;
height: calc(100vh - 100px);
`

const PolicyContainer = styled.div`
font-size: 8pt;
margin-top: 20px;
& a {
    color: ${props => props.theme.Body.TextColorLevels[1]};
}
`


interface loginResp {
    status: "Failed" | "Success"
    detail?: string
    accountExists?: boolean
}



export default function Login() {
    const isDark = useSelector<StateType, boolean>(state => state.theme);
    const [isLoaded, setLoad] = useState(false)
    const [redirResult, setresult] = useState<loginResp>()
    const router = useRouter()

    useEffect(() => {
        setLoad(true)
    }, [])
    useEffect(() => {
        if (router.query.hasOwnProperty("code")) {
            fetch(`/api/oauth2/${router.query.redirType}`, { method: "POST", body: JSON.stringify(router.query) }).then((data) => data.json()).then((jsn) => {
                if (jsn.status == "Success") {
                    localStorage.setItem("tk", jsn.token)
                }
                setresult(jsn)
                setTimeout(() => { router.replace("/") }, 1000)
            })
        }
    }, [router.isReady])

    return (
        <>
            <ThemeProvider theme={isDark ? DarkTheme : LightTheme} >
                <GlobalStyle />
                {isLoaded ?
                    <ParentContainer>
                        {redirResult ? <>
                            {redirResult.status == "Success" ? redirResult.accountExists ? "로그인되었습니다" : "가입이 완료되었습니다" : "오류가 발생했습니다"}
                            <PolicyContainer>
                                {redirResult.detail ? "Detail:" + redirResult.detail : "1초 후 자동으로 리다이렉트됩니다"}
                            </PolicyContainer>

                        </> :
                            <>
                                잠시만 기다려주세요..
                            </>}

                    </ParentContainer>
                    : <></>}
            </ThemeProvider>
        </>
    )
}
