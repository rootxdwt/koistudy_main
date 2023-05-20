import userSchema from "@/lib/schema/userSchema";
import mongoose from "mongoose";
import sanitize from "mongo-sanitize";
import styled, { keyframes, ThemeProvider } from "styled-components"
import { Holder } from "@/lib/ui/DefaultComponent"
import { DarkTheme, LightTheme } from "@/lib/ui/theme"
import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import { Header } from "@/lib/ui/component/header"

import { useSelector } from 'react-redux';
import { StateType } from "@/lib/store"
import { useRouter } from "next/router"

export default function UserPage(data: any) {
    const isDark = useSelector<StateType, boolean>(state => state.theme);
    const router = useRouter()
    const profileData = data
    return (
        <ThemeProvider theme={isDark ? DarkTheme : LightTheme}>
            <GlobalStyle />
            <Header
                currentPage="user"
            />
            <Holder>
                <h1>
                    {profileData.Id}
                </h1>
            </Holder>
        </ThemeProvider>
    )
}

export const getServerSideProps = async (context: any) => {
    const url = 'mongodb://localhost:27017/main';
    mongoose.connect(url)
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