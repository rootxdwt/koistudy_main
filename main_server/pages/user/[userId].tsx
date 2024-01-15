import userSchema from "../../lib/schema/userSchema";
import mongoose from "mongoose";
import sanitize from "mongo-sanitize";
import styled, { keyframes, ThemeProvider } from "styled-components"
import { Holder } from "@/lib/ui/DefaultComponent"
import { DarkTheme, LightTheme } from "@/lib/ui/theme"
import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import { Header } from "@/lib/ui/component/header"
import Image from "next/image";

const Banner = styled.div`
width: 100%;
height: 300px;
overflow: hidden;
position: relative;
@media(max-width:900px) {
    border-radius: 0px;
}

`

const Pfp = styled.div<{ userRank: number }>`
    margin-top: -50px;
    border-radius: 100px;
    overflow: hidden;
    z-index: 1;
    width: 100px;
    height: 100px;
    margin-left: 20px;
    border: solid 10px ${props => props.userRank < 1 ? props.theme.Body.backgroundColor : "gold"};
`

const ProfileHolder = styled(Holder)`
    padding-top: 0;
`


export default function UserPage(data: any) {
    const profileData = data
    return (
        <>
            <GlobalStyle />
            <Header
                currentPage="user"
            />
            <Holder>
                <Banner>

                </Banner>
                <Pfp userRank={profileData.Rank}>
                    <Image src={profileData.PfpURL} alt="userprofilephoto" width={100} height={100} />
                </Pfp>
                <h1>
                    {profileData.Id}
                </h1>
            </Holder>
        </>
    )
}

export const getServerSideProps = async (context: any) => {
    const url = process.env.MONGOCONNSTR!;
    await mongoose.connect(url)
    const { userId } = context.query;

    try {
        if (typeof userId == "string") {
            const FoundUser = JSON.parse(JSON.stringify(await userSchema.findOne({ Uid: sanitize(userId) }, 'Id Mail MailVerified Uid -_id PfpURL isAdmin Rank Banner').exec()));
            return {
                props: { ...FoundUser }
            };
        } else {
            return {
                notFound: true,
            };
        }
    } catch (e) {
        return {
            notFound: true,
        };
    }
};