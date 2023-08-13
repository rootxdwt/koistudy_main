import { useSelector } from "react-redux";
import { StateType } from "@/lib/store";
import { DarkTheme, LightTheme } from "@/lib/ui/theme";
import { ThemeProvider, keyframes } from "styled-components";
import styled, { createGlobalStyle } from "styled-components";
import { Header } from "@/lib/ui/component/header";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import userSchema from "@/lib/schema/userSchema";
import mongoose from "mongoose";
import { createClient } from "redis";
import crypto from "crypto";
import { genId } from "@/lib/pref/idGenerator";
import { generateJWT } from "@/lib/customCrypto";
import Head from "next/head";
import { BsArrowRightShort, BsCheck } from 'react-icons/bs'
import { GrFormSearch } from 'react-icons/gr'
import Link from "next/link";

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


const NormalInput = styled.div`
width: 100%;
position: relative;
& input {
    background-color: transparent;
    border: none;
    padding: 0px 15px;
    width: 100%;
    height: 40px;
    max-width: 300px;
    border: solid 2px #1d1d1d;
    
    color: #1d1d1d;
    margin-top: 10px;
    font-size: 14px;
    border-radius: 10px;
    font-weight: 400;
    &:focus {
        outline: none;
        border-color: rgb(131,81,246);
    }
    letter-spacing: 2px;
    text-align: start;
    margin-top: 20px;
    width: calc(100% - 34px);

    &::placeholder {
        color: #3e3e3e;
    }
}
`
const SubmitBtn = styled.div<{ isShown: boolean }>`
position: absolute;
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
display: ${props => props.isShown ? "flex" : "none"};
& path {
    stroke: #fff;
}
&:hover {
    background-color: rgb(107,157,248);
}
`

const ParentContainer = styled.div`

display:flex;
color: rgb(75, 75, 75);
font-family: 'Open Sans', sans-serif;
position: relative;
height: 100vh;
align-items: center;
justify-content: center;
margin-left: auto;
margin-right: auto;
@media(max-width: 590px) {
    width: calc(100% - 100px);
    padding: 0px 50px;
    height: 100vh;
    margin-top: 0;
    border: none;
}
& h1 {
    font-size: 25px;
    margin: 0px;
    margin-top: 20px;
    margin-bottom: 30px;
}

overflow: hidden;
    
`;

const BtnHolder = styled.div`
    margin-top: 20px;
    display: flex;
    width: 100%;
    justify-content: flex-end;
`
const BtnArray = styled.div`
    display: flex;
    width: 100%;
    margin-top: 15px;
`
const NextBtn = styled.div<{ borderOnly?: boolean, disabled?: boolean }>`
    background-color: ${props => props.borderOnly ? "transparent" : "#1d1d1d"};
    filter: ${props => props.disabled ? "brightness(6)" : "none"};
    border: solid 2px #1d1d1d;
    width: 100%;
    color: ${props => props.borderOnly ? "#1d1d1d" : "#fff"};
    height: 40px;
    border-radius: 10px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:nth-child(1) {
        margin-right: 10px;
    }
`;

const mainholderLoadKeyframes = keyframes`
    0% {
        opacity: 0;
    }
    100% {
        opacity:1;
    }
`

const MainContainer = styled.div`
display: flex;
padding: 30px 50px;
flex-direction:column;
position: absolute;
left: 50%;
top: 300px;
transform: translate(-50%,-50%);
justify-content:center;
border-radius: 5px;
align-items: center;
width: 290px;
animation: ${mainholderLoadKeyframes} 0.3s ease-in-out;
& .min {
    font-size: 10px;
}
& .sub {
    color: rgb(115,115,115);
    margin: 0;
    font-size: 12px;
    margin-bottom: 10px;
}
border-radius: 5px;
`;



const AlertfulContainer = styled.div`
    & p {
        margin: 0;
        margin-bottom: 10px;
    }
    & a {
        text-decoration: underline;
        color: rgb(115, 115, 115);
        font-weight: 500;
    }
    height: 16.5px;
    bottom: 30px;
    margin-top: 20px;
    right: 30px;
    text-align: center;
    width: 100%;
    border-radius: 5px;
    font-size: 12px;
    color: rgb(115, 115, 115);
`

const DataHolder = styled.div`
padding: 10px 15px;
text-align: left;
width: calc(100% - 34px);
border: solid 2px #000;
border-radius: 10px;
& p {
    margin: 0;
    font-size: 17px;
}
& div {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
& .check {
    font-size: 20px;
    margin: 0;
    padding: 0;
    
}
& span {
    font-size: 14px;
    color: #8a8a8a;
}
    
`

const LoadingAnimation = keyframes`
0%{
    rotate: 0deg;
}
100%{
    rotate: 360deg;
}
`

const Loading = styled.span`
    width: 25px;
    height: 25px;
    display: block;
    border-radius: 25px;
    border: solid 3px #1d1d1d;
    border-top: solid 2px transparent;
    animation: ${LoadingAnimation} 1s ease infinite;
`


interface loginResp {
    status: "Failed" | "Success";
    detail?: string;
    accountExists: boolean;
    regKey?: string;
    token?: string;
    accData?: {
        Id: string;
        Mail: string;
        MailVerified: boolean;
        Uid: string;
    };
}

export default function Login(serverData: any) {

    const [redirResult, setresult] = useState<loginResp>();

    const [key, setKey] = useState<string>();
    const [currentStep, setStep] = useState<number>(0);
    const router = useRouter();
    const NameDataRef = useRef<any>();
    const OrgCodeRef = useRef<any>()
    const [AlertData, setAlertData] = useState<string | undefined>()
    const [isCompFilled, setCompFilled] = useState(false)
    const [orgData, setOrgData] = useState<any>()
    const [orgCode, setOrgCode] = useState("")
    const [isPageLoading, setPageLoading] = useState(false)

    const GotoStep = (step: number, data: object) => {
        setAlertData(undefined)
        setPageLoading(true)
        fetch(`/api/register/${step - 1}`, {
            method: "POST",
            body: JSON.stringify({ key: key, ...data }),
        })
            .then((resp) => {
                return resp.json();
            })
            .then((data) => {
                setPageLoading(false)
                if (data.status == "Success") {
                    setresult(data);
                    setStep(step);
                } else {
                    setAlertData(`Error: ${data.detail}`)

                }
            });
    };

    useEffect(() => {
        setresult(serverData);
        if (router.query.hasOwnProperty("code")) {
            if (!serverData.accountExists) setKey(serverData.regKey);
            if (serverData.status == "Success" && serverData.accountExists) {
                localStorage.setItem("tk", serverData.token);
                if (serverData.redir) {
                    router.replace(serverData.redir);
                } else {
                    router.replace("/");
                }
            }
        }
    }, [router.isReady, router]);

    const VerifyCode = async () => {
        setOrgCode(OrgCodeRef.current.value)
        const resp = await fetch("/api/org/code", { method: "POST", body: JSON.stringify({ code: OrgCodeRef.current.value }), headers: { "Content-Type": "application/json" } })
        const responseData = await resp.json()
        if (responseData["status"] == "Success" && responseData["data"] != null) {
            setOrgData(responseData["data"])
        }
    }

    return (
        <>
            <Head>
                <title>
                    코이스터디
                </title>
            </Head>

            <GlobalStyle />

            {redirResult ? (
                <ParentContainer>
                    {isPageLoading ? <><Loading /></> : <MainContainer>
                        {redirResult.status == "Success" ? (
                            redirResult.accountExists ? (
                                <></>
                            ) : (
                                <>
                                    {currentStep == 0 ? (
                                        <>
                                            <h1>이름을 알려주세요</h1>
                                            <NormalInput>
                                                <input placeholder={redirResult.accData?.Id}
                                                    ref={NameDataRef} />
                                                <SubmitBtn isShown={true} onClick={() =>
                                                    GotoStep(1, { name: NameDataRef.current.value })
                                                }>
                                                    <BsArrowRightShort />
                                                </SubmitBtn>
                                            </NormalInput>
                                            <BtnHolder>
                                            </BtnHolder>
                                        </>
                                    ) : (
                                        <>
                                            {currentStep == 1 ? (
                                                <>
                                                    {typeof orgData !== "undefined" ? <h1>아래 정보로 계속합니다</h1> : <h1>단체에 속해 있으신가요?</h1>}

                                                    {typeof orgData !== "undefined" ? <DataHolder>
                                                        <div>
                                                            <p>{orgData.Name}</p>
                                                            <b className="check">

                                                                <BsCheck />
                                                            </b>
                                                        </div>

                                                        <span>{orgData.RegCodes[0].class}{orgData.RegCodes[0].classlabel}</span>
                                                    </DataHolder> :
                                                        <NormalInput>
                                                            <input placeholder="초대 코드를 입력하세요"
                                                                ref={OrgCodeRef} onChange={(e) => setCompFilled(e.target.value.length > 0)} />
                                                            <SubmitBtn isShown={isCompFilled} onClick={VerifyCode}>
                                                                <GrFormSearch />
                                                            </SubmitBtn>
                                                        </NormalInput>
                                                    }
                                                    <BtnArray>
                                                        <NextBtn
                                                            borderOnly={true}
                                                            onClick={() =>

                                                                GotoStep(2, { orgCode: null })
                                                            }
                                                        >
                                                            건너뛰기
                                                        </NextBtn>
                                                        <NextBtn
                                                            disabled={typeof orgData == "undefined"}
                                                            onClick={() => {
                                                                if (typeof orgData !== "undefined") GotoStep(2, { orgCode: orgCode })
                                                            }
                                                            }
                                                        >
                                                            계속하기
                                                        </NextBtn>
                                                    </BtnArray>


                                                </>
                                            ) : (
                                                <h1>가입이 완료되었습니다</h1>
                                            )}
                                        </>
                                    )}
                                </>
                            )
                        ) : (
                            <>다시 시도해보세요</>
                        )}
                        <AlertfulContainer>
                            {AlertData || redirResult.detail ?
                                <p>
                                    {AlertData}
                                    {redirResult.detail ? "Detail:" + redirResult.detail : ""}
                                </p> : <></>
                            }

                            <Link href="/auth">로그인 페이지로 돌아가기</Link>
                        </AlertfulContainer>
                    </MainContainer>}
                </ParentContainer>
            ) : (
                <>잠시만 기다려주세요..</>
            )}
        </>
    );
}

interface IdToken {
    iss: string;
    azp: string;
    aud: string;
    sub: string;
    email: string;
    email_verified: boolean;
    at_hash: string;
    iat: string;
    exp: string;
}

export async function getServerSideProps(context: any) {

    const client = createClient();
    await client.connect();

    try {
        const { redirType } = context.query;
        if (["google", "github"].indexOf(redirType) == -1) {
            return { notFound: true }
        }
        const requestedData = context.query;
        let { redir, nonce } = JSON.parse(Buffer.from(requestedData.state, 'base64').toString('ascii'))
        const redisData = await client.get(nonce);

        if (typeof redir === "undefined") redir = null

        if (redisData !== "true") {
            return { props: { detail: "csrf token mismatch" } };
        }
        await client.del(nonce);
        let uid;
        const url = "mongodb://localhost:27017/main";
        mongoose.connect(url);
        if (
            typeof process.env.JWTKEY === "undefined" ||
            typeof process.env.GOOGLEPRIVATE === "undefined" ||
            typeof process.env.GITHUBPRIVATE === "undefined"
        ) {
            console.log("JWTKEY not specified in .env");
            return { props: { detail: "error" } };
        }

        if (redirType == "github") {
            var rsp = await fetch(
                `https://github.com/login/oauth/access_token?client_id=3ee621b68f1950df0ba0&client_secret=${process.env.GITHUBPRIVATE}&code=${requestedData.code}&redirect_uri=http://${process.env.REDIRURL}/auth/redirect/github`,
                { method: "POST", headers: { Accept: "application/json" } }
            );
            const respJsn = await rsp.json();

            const infoReq = await fetch(`https://api.github.com/user/emails`, {
                headers: { Authorization: `token ${respJsn.access_token}` },
            });
            const emailData = await infoReq.json();

            const primaryMail = emailData.filter((elem: any) => {
                return elem.primary;
            })[0];
            const data = await userSchema.find({ Mail: primaryMail.email });
            if (data.length < 1) {
                let regKey = crypto.randomBytes(10).toString("hex");
                uid = crypto.randomBytes(10).toString("hex");
                let accData = {
                    Id: genId(),
                    Mail: primaryMail.email,
                    MailVerified: primaryMail.verified,
                    Uid: uid,
                };
                await client.set(regKey, JSON.stringify(accData), { EX: 60 });
                return {
                    props: {
                        status: "Success",
                        accountExists: false,
                        regKey: regKey,
                        accData: accData,
                        redir: redir
                    },
                };
            } else {
                let token = await generateJWT(data[0].Uid, process.env.JWTKEY, true);
                return { props: { status: "Success", accountExists: true, token: token, redir: redir } };
            }
        } else if (redirType == "google") {
            var rsp = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                body: JSON.stringify({
                    client_id:
                        "417400386686-s890d90hvopobco24fpkocga45p3t3h1.apps.googleusercontent.com",
                    client_secret: process.env.GOOGLEPRIVATE,
                    code: requestedData.code,
                    redirect_uri: `http://${process.env.REDIRURL}/auth/redirect/google`,
                    grant_type: "authorization_code",
                }),
            });
            const respJsn = await rsp.json();
            const infoReq = await fetch(
                `https://oauth2.googleapis.com/tokeninfo?id_token=${respJsn.id_token}`
            );

            const userData: IdToken = await infoReq.json();

            const data = await userSchema.find({ Mail: userData.email });
            if (data.length < 1) {
                let regKey = crypto.randomBytes(10).toString("hex");
                uid = crypto.randomBytes(10).toString("hex");
                let accData = {
                    Id: genId(),
                    Mail: userData.email,
                    MailVerified: userData.email_verified,
                    Uid: uid,
                };
                await client.set(regKey, JSON.stringify(accData), { EX: 60 });
                return {
                    props: {
                        status: "Success",
                        accountExists: false,
                        regKey: regKey,
                        accData: accData,
                        redir: redir
                    },
                };
            } else {
                let token = await generateJWT(data[0].Uid, process.env.JWTKEY, true);
                return {
                    props: { status: "Success", accountExists: true, token: token, redir: redir },
                };
            }
        }
    } catch (e) {
        return { props: { detail: "unknown error" } };
    }
}
