import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import { Header } from "@/lib/ui/component/headers/problem_header"
import { useState } from "react"
export default function ContestSolvePage () {
    const [isSideMenu, setSideMenu] = useState(false)
    return (
        <>
        <GlobalStyle />
        <Header isSideMenu={isSideMenu}>

        </Header>
        </>
    )
}