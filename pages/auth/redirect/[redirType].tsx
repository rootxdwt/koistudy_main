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
align-items: flex-start;
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
}
`

const PolicyContainer = styled.div`
font-size: 11px;
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

    const [redirResult, setresult] = useState<loginResp>()
    const router = useRouter()

    useEffect(() => {
        if (router.query.hasOwnProperty("code")) {
            fetch(`/api/oauth2/${router.query.redirType}`, { method: "POST", body: JSON.stringify(router.query) }).then((data) => data.json()).then((jsn) => {
                if (jsn.status == "Success" && jsn.accountExists) {
                    localStorage.setItem("tk", jsn.token)
                    setTimeout(() => { router.replace("/") }, 1000)
                }
                setresult(jsn)
            })
        }
    }, [router.isReady, router])

    return (
        <>
            <ThemeProvider theme={isDark ? DarkTheme : LightTheme} >

                <GlobalStyle />
                <Header currentPage="login" />
                {redirResult ?
                    <ParentContainer>
                        {redirResult.status == "Success" ? redirResult.accountExists ?
                            <>
                                로그인되었습니다
                            </>
                            : <>
                                <h1>처음 뵙겠습니다</h1>

                            </>
                            :
                            <>
                                오류가 발생했습니다
                            </>
                        }
                        <PolicyContainer>
                            {redirResult.detail ? "Detail:" + redirResult.detail : ""}
                        </PolicyContainer>

                    </ParentContainer>
                    : <>잠시만 기다려주세요..</>}
            </ThemeProvider>
        </>
    )
}
