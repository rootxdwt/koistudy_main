import styled from "styled-components"
import { useState, useEffect, useReducer, Reducer, useRef } from "react"
import { LanguageHandler } from "@/lib/pref/languageLib"
import { AcceptableLanguage } from "@/lib/pref/languageLib"
import { FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import { SubmittedCodeElem } from "../component/codeElem";
import { ThemeConsumer } from "styled-components"
import Link from "next/link"
import { useRouter } from "next/router"

import { useDispatch } from "react-redux"


const SubMainHolder = styled.div`
width:100%;

`

const SkeletonSingleCont = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    border-bottom: solid 1px ${props => props.theme.Container.backgroundColor};
`
const SkeletonItem = () => {
    return (
        <SkeletonSingleCont>
            <Skeleton width={"30%"} height={20} borderRadius={5} count={1} style={{ "flexShrink": "none", "marginBottom": "1.5px" }} />
            <Skeleton width={"80%"} height={15} borderRadius={5} count={1} style={{ "flexShrink": "none", "marginTop": "5px", "marginBottom": "5px" }} />
        </SkeletonSingleCont>
    )
}

const LoadingSkeleton = (props: { count: number }) => {

    return (
        <ThemeConsumer>
            {theme => <SkeletonTheme baseColor={theme.Container.backgroundColor} highlightColor={theme.Body.ContainerBgLevels[0]}>
                {
                    new Array(props.count > 10 ? 10 : props.count).fill(0).map((_, index) => {
                        return <SkeletonItem key={index} />
                    })
                }
            </SkeletonTheme>}
        </ThemeConsumer>

    )
}


interface ServerResp {
    Code: string
    Status: "AW" | "AC" | "CE" | "ISE"
    CodeLength: Number
    TC: Array<{ Mem: number, Time: number, State: "AW" | "AC" | "TLE" }>
    SubCode: string
    Time: Date
    Lang: AcceptableLanguage
    _id: string
}

const NoDataHolder = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: calc(100vh - 431px);
    color: ${props => props.theme.Body.TextColorLevels[3]};
    font-size: 14px;
    flex-direction: column;
`
const LoginBtn = styled.div`
    padding: 5px 20px;
    background-color: ${props => props.theme.Button.backgroundColor};
    border-radius: 5px;
    margin-top: 10px;
    cursor: pointer;
    &:hover {
        background-color: ${props => props.theme.Body.ContainerBgLevels[0]};
    }
    color:  ${props => props.theme.Body.TextColorLevels[3]};
`

const NoData = () => {
    return (
        <NoDataHolder>데이터가 없습니다</NoDataHolder>
    )
}

const Loginpls = () => {
    const router = useRouter()
    return (
        <NoDataHolder>보려면 로그인하세요
            <Link href={`/auth/?redir=${encodeURIComponent(router.asPath)}`}>
                <LoginBtn>
                    로그인
                </LoginBtn>
            </Link>
        </NoDataHolder>
    )
}

const SubmissionItmHolder = styled.div`
    display: flex;
    flex-direction: column;
`

const SubmissionItm = styled.div`
    padding: 20px;
    display: flex;
    &:hover {
        background-color: ${props => props.theme.Body.ContainerBgLevels[2]};
        cursor: pointer;
    }
    border-bottom: solid 1px ${props => props.theme.Container.backgroundColor};
`

const ItmRight = styled.div`
    display: flex;
    flex-direction: column;
    & p {
        margin: 0!important;
        font-size: 12px!important;
        color: ${props => props.theme.Body.TextColorLevels[4]}!important;
    }
`

const HeadingArea = styled.div`
    display: flex;
    align-items: center;
    & p{
        font-size: 14px!important;
        margin: 0!important;
        margin-right: 10px!important;
    }
`

const LangInfo = styled.div`
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 12px;
    font-size: 10px;
    background-color: ${props => props.theme.Body.ContainerBgLevels[1]};
    color: ${props => props.theme.Body.TextColorLevels[3]}!important;
`

const WRTitle = styled.p<{ isCorrect: boolean }>`
    color: ${props => props.isCorrect ? "#48bd5f" : props.theme.Body.TextColorLevels[1]}!important;
`

const GetDateStr = (date: Date) => {
    const dates = ["일", "월", "화", "수", "목", "금", "토"]
    let displayYear = false
    if (date.getFullYear() < new Date().getFullYear()) {
        displayYear = true
    }
    if (displayYear) return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${dates[date.getDay()]}) ${date.getHours()}시 ${date.getMinutes()}분`
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${dates[date.getDay()]}) ${date.getHours()}시 ${date.getMinutes()}분`
}

const SelectionArea = styled.div`
    display:flex;
    justify-content: space-between;
    margin-top: 10px;
    margin-bottom: 20px;

`

const Selection = styled.div`
    position: relative;
    width: 48%;
    user-select: none;
`

const SelectionBtn = styled.div`
        border-radius: 10px;
    height: 35px;
    background-color: ${props => props.theme.Header.BgColor};

    border:solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
    cursor: pointer;
    display: flex;
    align-items: center;
    width: calc(100% - 4px);
    & p {
        font-size: 13px!important;
        margin-left: 10px;
        margin-right: auto;
    }
    &:hover {
        background-color: ${props => props.theme.Body.ContainerBgLevels[2]};
    }
`


const SelectionList = styled.ul<{ isShown: boolean }>`
    position: absolute;
    top: 45px;
    width: calc(100% - 22px);
    background-color: ${props => props.theme.Header.BgColor};
    border:solid 1px ${props => props.theme.Button.backgroundColor};
    border-radius: 10px;
    margin: 0;
    padding: 0;
    padding: 10px;
    max-height: 140px;
    -ms-overflow-style: none;
    scrollbar-width: none; 
    &&::-webkit-scrollbar {
    display: none;
    }
    z-index: 3;
    overflow: auto;
    display: ${props => props.isShown ? "inherit" : "none"};

`

const ListItm = styled.li<{ isActive: boolean }>`

    height: 35px;
    padding-left: 10px;
    list-style-type: none;
    font-size: 12px;
    display: flex;
    align-items: center;
    color: ${props => props.isActive ? props.theme.Body.TextColorLevels[1] : props.theme.Body.TextColorLevels[3]};
    &:hover {
        background-color: ${props => props.theme.Body.ContainerBgLevels[2]};
    }
    border-radius: 5px;
    cursor: pointer;
`



const ChevRon = styled.div<{ spin: boolean }>`
    rotate: ${props => props.spin ? "180deg" : "0deg"};
    transition: rotate 0.3s cubic-bezier(.5,0,.56,.99);
    margin-right: 10px;
    color: ${props => props.theme.Body.TextColorLevels[3]};
`

const CodeElemHolder = styled.div`
display:flex;
flex-direction:column;
position:relative;
`

const ViewDetailBtn = styled.div`
position:absolute;
bottom:15px;
z-index:1;
right:15px;
cursor:pointer;
display: flex;
color: ${props => props.theme.Body.TextColorLevels[3]};
display:flex;
align-items:center;
flex-direction: row;
& p.txt {
    margin-right: 5px;
    font-size:12px;
}
& p.icon {
    margin:0;
    rotate:-90deg;
}
`

const PageNavBtnHolder = styled.div`
    width:100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0px;
    margin-bottom: 70px;
`
const PageNavBtn = styled.div<{ display: boolean }>`
    opacity:${props => props.display ? "100%" : "20%"};
    font-size: 13px;
    &:nth-child(2) {
        margin-left: 20px;
    }
    display: flex;
    align-items: center;
    color: ${props => props.theme.Body.TextColorLevels[3]};
    &:hover {
        color: ${props => props.theme.Body.TextColorLevels[0]};
    }
    user-select: none;
    cursor: pointer;
    & p {
        margin: 0 5px;
        padding: 0;
        font-size: 15px;
        display: flex;
        align-items: center;
    }
    
`
const PageCountDropDown = styled.div`
position: relative;
    padding:3px 10px;
    background-color: ${props => props.theme.Header.BgColor};
    border: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
    color: ${props => props.theme.Body.TextColorLevels[3]};
    display: flex;
    font-size: 13px;
    cursor: pointer;
    align-items: center;
    & p {
        font-size: 13px;
        margin: 0;
        padding: 0;
        margin-right: 5px;
    }
`
const PageCountDropDownElem = styled.ul`
    position: absolute;
    list-style-type: none;
    user-select: none;
    left:-1px;
    top: 30px;
    padding:0;
    width: calc(100% - 10px);
    text-align: left;
    padding: 5px;
    margin:0;
    background-color: ${props => props.theme.Header.BgColor};
    border: solid 1px ${props => props.theme.Body.ContainerBgLevels[1]};
    & li {
        cursor: pointer;
        padding:2px 10px;

    }
`

export const SubmissionPage = (props: { id: Number, supportedLang: Array<AcceptableLanguage> }) => {
    const [ServerData, setServerData] = useState<Array<ServerResp>>()
    const [isError, setError] = useState<string>("")
    const [isLoaded, setLoadState] = useState<boolean>(false)
    const [dropDown, setDropDown] = useState("")
    const [filterLang, setFilterLang] = useState<AcceptableLanguage | "">("")
    const [filterStat, setFilterStat] = useState("")
    const [extended, setExtended] = useState<number | undefined>()
    const [pageCountDropdown, setPageDropDown] = useState(false)
    const [PageNav, setPageNav] = useState([false, true])
    const [elemPerPage, setElemPerPage] = useState(20)

    const dispatch = useDispatch()
    const isComponentRefreshing = useRef<boolean>(false)

    useEffect(() => {
        setLoadState(false)
        setError('')
        setServerData(undefined)
        fetch(`/api/user/problem/${props.id}`, {
            method: "POST", headers: {
                'content-type': 'application/json', "Authorization": localStorage.getItem("tk")!
            }, body: JSON.stringify(
                { stat: filterStat, lang: filterLang, limit: elemPerPage }
            )
        }).then((resp) => {
            setLoadState(true)
            if (!resp.ok) {
                setError('HTTP')
                return [{}]
            } else {
                setLoadState(true)
                return resp.json()
            }
        }).then((jsn: any) => {
            setPageNav([jsn['prev'], jsn['next']])
            setServerData(jsn['data'])
        })
    }, [filterLang, filterStat, props.id, elemPerPage])

    const PageNavigate = (action: "next" | "prev") => {
        if (isComponentRefreshing.current) {
            return
        }
        isComponentRefreshing.current = true
        let query = {}
        switch (action) {
            case "next":
                query = { next: ServerData![ServerData!.length - 1]["_id"] }
                break
            case "prev":
                query = { prev: ServerData![0]["_id"] }
                break
        }
        setLoadState(false)
        setError('')
        fetch(`/api/user/problem/${props.id}`, {
            method: "POST", headers: {
                'content-type': 'application/json', "Authorization": localStorage.getItem("tk")!
            }, body: JSON.stringify(
                { stat: filterStat, lang: filterLang, ...query, limit: elemPerPage }
            )
        }).then((resp) => {
            setLoadState(true)
            if (!resp.ok) {
                setError('HTTP')
                return [{}]
            } else {
                setLoadState(true)
                return resp.json()
            }
        }).then((jsn: any) => {
            isComponentRefreshing.current = false
            setPageNav([jsn['prev'], jsn['next']])
            setServerData(jsn['data'])
        })
    }

    const StatusToMsg = (status: string) => {
        switch (status) {
            case "AC":
                return "맞았습니다"
            case "ISE":
                return "런타임 에러"
            case "CE":
                return "컴파일 에러"
            case "AW":
                return "틀렸습니다"
        }
    }

    const toggleDropDown = (target: string) => {
        if (dropDown == target) {
            setDropDown("")
        } else {
            setDropDown(target)
        }
    }
    const getLangFullname = (langName: AcceptableLanguage) => {
        const langlib = new LanguageHandler(langName, "")
        return langlib.getLangFullName()
    }



    return (
        <>
            <SubMainHolder>
                <SubmissionItmHolder>
                    <SelectionArea>
                        <Selection>
                            <SelectionBtn onClick={() => toggleDropDown("lang")}>
                                <p>{filterLang == "" ? "언어" : getLangFullname(filterLang)}</p>
                                <ChevRon spin={dropDown == "lang"}><FiChevronDown /></ChevRon>
                            </SelectionBtn>
                            <SelectionList isShown={dropDown == "lang"}>
                                <ListItm
                                    isActive={filterLang == ""}
                                    onClick={() => { setFilterLang(""); setDropDown("") }}
                                >
                                    전체
                                </ListItm>
                                {props.supportedLang.map((elem, index) => {
                                    return <ListItm
                                        isActive={filterLang == elem}
                                        key={index}
                                        onClick={() => { setFilterLang(elem); setDropDown("") }}>
                                        {getLangFullname(elem)}
                                    </ListItm>
                                })}
                            </SelectionList>
                        </Selection>
                        <Selection>
                            <SelectionBtn onClick={() => toggleDropDown("stat")}>
                                <p> {filterStat == "" ? "상태" : StatusToMsg(filterStat)}</p>
                                <ChevRon spin={dropDown == "stat"}><FiChevronDown /></ChevRon>
                            </SelectionBtn>
                            <SelectionList isShown={dropDown == "stat"}>
                                <ListItm isActive={filterStat == ""} onClick={() => { setFilterStat(""); setDropDown("") }}>전체</ListItm>
                                {["AC", "AW", "CE", "ISE"].map((elem, index) => {
                                    return <ListItm
                                        isActive={filterStat == elem}
                                        key={index}
                                        onClick={() => { setFilterStat(elem); setDropDown("") }}>
                                        {StatusToMsg(elem)}
                                    </ListItm>
                                })}
                            </SelectionList>
                        </Selection>
                    </SelectionArea>
                    {!isLoaded ?
                        <LoadingSkeleton count={elemPerPage} />
                        : <>
                            {isError !== "" ?
                                <Loginpls /> : <> {
                                    ServerData && ServerData.length < 1 ?
                                        <NoData />
                                        : <>
                                            {ServerData?.sort((a, b) => { return new Date(b.Time).valueOf() - new Date(a.Time).valueOf() }).map((elem, index) => {
                                                return (
                                                    <>
                                                        <SubmissionItm
                                                            key={index}
                                                            onClick={() => { if (extended !== index && elem.Code.length > 1) { setExtended(index) } else setExtended(undefined) }}
                                                        >
                                                            <ItmRight>
                                                                <HeadingArea>
                                                                    <WRTitle
                                                                        isCorrect={elem.Status == "AC"}
                                                                    >
                                                                        {StatusToMsg(elem.Status)}
                                                                    </WRTitle>
                                                                    <LangInfo>
                                                                        {new LanguageHandler(elem.Lang, "").getLangFullName()}
                                                                    </LangInfo>
                                                                </HeadingArea>
                                                                <p> {GetDateStr(new Date(elem.Time))}</p>
                                                            </ItmRight>
                                                        </SubmissionItm>
                                                        {extended == index ?
                                                            <CodeElemHolder>
                                                                <SubmittedCodeElem lang={elem.Lang} data={elem.Code} />
                                                                <ViewDetailBtn onClick={() => dispatch({ type: "tabs/add", payload: { name: "제출", id: elem.SubCode } })}><p className="txt">자세히 보기</p> <p className="icon"><FiChevronDown /></p></ViewDetailBtn>
                                                            </CodeElemHolder> : <></>}
                                                    </>)

                                            })}</>
                                }
                                </>
                            }
                        </>}
                </SubmissionItmHolder>
            </SubMainHolder>
            <PageNavBtnHolder>
                <PageCountDropDown onMouseEnter={() => setPageDropDown(true)} onMouseLeave={() => setPageDropDown(false)}><p>{elemPerPage}</p><FiChevronDown />
                    {pageCountDropdown ? <PageCountDropDownElem>
                        <li onClick={() => setElemPerPage(10)}>10</li>
                        <li onClick={() => setElemPerPage(20)}>20</li>
                        <li onClick={() => setElemPerPage(30)}>30</li>
                    </PageCountDropDownElem> : <></>}
                </PageCountDropDown>
                <div style={{ display: "flex" }}>
                    <PageNavBtn display={PageNav[0]} onClick={() => PageNav[0] ? PageNavigate("prev") : {}}><p><FiChevronLeft /></p>이전</PageNavBtn>
                    <PageNavBtn display={PageNav[1]} onClick={() => PageNav[1] ? PageNavigate("next") : {}}>다음<p><FiChevronRight /></p></PageNavBtn>
                </div>
            </PageNavBtnHolder>
        </>
    )
}