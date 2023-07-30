import { useSelector } from "react-redux";
import { StateType } from "@/lib/store";
import { DarkTheme, LightTheme } from "@/lib/ui/theme";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "@/lib/ui/DefaultComponent";
import styled from "styled-components";
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

const NormalInput = styled.input`
    background-color: transparent;
    border: none;
    padding: 8px 0px;
    max-width: 300px;
    border: solid 1px ${(props) => props.theme.Body.ContainerBgLevels[0]};
    color:${(props) => props.theme.Body.TextColorLevels[1]};
    margin-top: 10px;
    font-size: 13px;
    border-radius: 5px;
    &:focus {
        outline: none;
    }
    letter-spacing: 2px;
    text-align: center;
    margin-top: 20px;
    width: 100%;
    background-color: ${(props) => props.theme.Container.backgroundColor};
`;
const ParentContainer = styled.div`

display:flex;
color: ${(props) => props.theme.Body.TextColorLevels[2]};
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
    font-size: 20px;
    margin: 0px;
    margin-top: 20px;
    margin-bottom: 10px;
}

overflow: hidden;
    
`;

const BtnHolder = styled.div`
    margin-top: 20px;
    padding-top: 20px;
    display: flex;
    width: 100%;
    justify-content: flex-end;
    border-top: solid 2px ${(props) => props.theme.Button.backgroundColor};
`;
const NextBtn = styled.div`
    background-color: ${(props) => props.theme.Button.backgroundColor};
    padding: 7px 25px;
    border-radius: 5px;
    font-size: 13px;
    cursor: pointer;
    color:  ${(props) => props.theme.Body.TextColorLevels[3]};
    &:hover {
        background-color: ${(props) => props.theme.Body.ContainerBgLevels[0]};
    }
`;
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
width: 250px;
& .min {
    font-size: 10px;
}
& .sub {
    color:  ${(props) => props.theme.Body.TextColorLevels[3]};
    margin: 0;
    font-size: 11px;
    margin-bottom: 10px;
}
width: 250px;
border-radius: 5px;
`;

const PolicyContainer = styled.div`
font-size: 11px;
margin-top: 20px;
& a {
    color: ${(props) => props.theme.Body.TextColorLevels[1]};
}
`

const AlertfulContainer = styled.div`
    height: 16.5px;
    bottom: 30px;
    margin-top: 20px;
    right: 30px;
    text-align: end;
    width: 100%;
    border-radius: 5px;
    font-size: 12px;
    color: ${props => props.theme.Body.TextColorLevels[3]};
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
    const isDark = useSelector<StateType, boolean>((state) => state.theme);

    const [redirResult, setresult] = useState<loginResp>();

    const [key, setKey] = useState<string>();
    const [currentStep, setStep] = useState<number>(0);
    const router = useRouter();
    const NameDataRef = useRef<any>();
    const [AlertData, setAlertData] = useState<string | undefined>()

    const GotoStep = (step: number, data: object) => {
        setAlertData(undefined)
        fetch(`/api/register/${step - 1}`, {
            method: "POST",
            body: JSON.stringify({ key: key, ...data }),
        })
            .then((resp) => {
                return resp.json();
            })
            .then((data) => {
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
                setTimeout(() => {
                    router.replace("/");
                }, 1000);
            }
        }
    }, [router.isReady, router]);

    return (
        <>
            <Head>
                <title>
                    KOISTUDY
                </title>
            </Head>

            <GlobalStyle />
            <Header currentPage="login" />
            {redirResult ? (
                <ParentContainer>
                    <MainContainer>
                        {redirResult.status == "Success" ? (
                            redirResult.accountExists ? (
                                <>로그인되었습니다</>
                            ) : (
                                <>
                                    {currentStep == 0 ? (
                                        <>
                                            <h1>이름을 알려주세요</h1>
                                            <p className="sub">가입 후 언제든지 바꿀 수 있습니다</p>
                                            <NormalInput
                                                placeholder={redirResult.accData?.Id}
                                                ref={NameDataRef}
                                            />
                                            <BtnHolder>
                                                <NextBtn
                                                    onClick={() =>
                                                        GotoStep(1, { name: NameDataRef.current.value })
                                                    }
                                                >
                                                    계속하기
                                                </NextBtn>
                                            </BtnHolder>
                                        </>
                                    ) : (
                                        <>
                                            {currentStep == 1 ? (
                                                <>
                                                    <h1>단체에 속해 있으신가요?</h1>
                                                </>
                                            ) : (
                                                <h1>가입이 완료되었습니다</h1>
                                            )}
                                        </>
                                    )}
                                </>
                            )
                        ) : (
                            <>오류가 발생했습니다</>
                        )}
                        <AlertfulContainer>
                            {AlertData}
                        </AlertfulContainer>
                    </MainContainer>
                    <PolicyContainer>
                        {redirResult.detail ? "Detail:" + redirResult.detail : ""}
                    </PolicyContainer>
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
        const redisData = await client.get(requestedData.state);
        if (redisData !== "true") {
            return { props: { detail: "csrf token mismatch" } };
        }
        await client.del(requestedData.state);
        console.log(redirType);
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
                    },
                };
            } else {
                let token = await generateJWT(data[0].Uid, process.env.JWTKEY, true);
                return { props: { status: "Success", accountExists: true, token: token } };
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
                    },
                };
            } else {
                let token = await generateJWT(data[0].Uid, process.env.JWTKEY, true);
                return {
                    props: { status: "Success", accountExists: true, token: token },
                };
            }
        }
    } catch (e) {
        return { props: { detail: "unknown error" } };
    }
}
