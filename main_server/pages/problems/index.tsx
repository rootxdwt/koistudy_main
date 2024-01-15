import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import styled from "styled-components"
import { Header } from "@/lib/ui/component/header"
import { FiChevronDown, FiArrowDown,FiArrowUp, FiX, FiShuffle, FiCheck } from "react-icons/fi"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import { encode } from 'querystring'
import Link from "next/link"
import { ThemeConsumer } from "styled-components"
import Image from "next/image"
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import { AcceptableLanguage, LanguageHandler } from "@/lib/pref/languageLib"
import Head from "next/head"
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import BannerSchema from "../../lib/schema/bannerSchema"
import mongoose from "mongoose"

const Holder = styled.div`
    background-color: ${props => props.theme.Body.backgroundColor};
    display: flex;
    flex-direction: column;
    width: 1200px;
    margin-left: auto;
    margin-right: auto;
    height: auto;
    position: relative;
    width: 1400px;
    min-height: 100vh;
  @media(max-width: 1700px) {
width: 1300px;
  }
  @media(max-width: 1500px) {
width: 1200px;
  }
  @media(max-width: 1300px) {
width: 1100px;
  }
  @media(max-width: 1200px) {
width: 900px;
  }
  @media(max-width: 1000px) {
width: 90vw;
  }
`

const ProblemHolder = styled.div`
    margin-top: 40px;
    height: auto;
    width: 100%;
`
const BannerElem = styled.div<{color: any}>`
    width:100vw;
    height:270px;
    background-color: rgb(${props=>props.color.join(",")});
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease-in-out;

`

const BannerHolder = styled.div`
    position: relative;
width: 1400px;
  @media(max-width: 1700px) {
width: 1300px;
  }
  @media(max-width: 1500px) {
width: 1200px;
  }
  @media(max-width: 1300px) {
width: 1100px;
  }
  @media(max-width: 1200px) {
width: 900px;
  }
  @media(max-width: 1000px) {
width: 90vw;
  }
    display: flex;
    align-items: center;
    margin-left: auto;
    margin-right: auto;
    justify-content: space-between;
    height: 100%;
`

const BannerText = styled.div<{ isTextBlack: boolean }>`
    display: flex;
    flex-direction: column;
    max-width: 250px;
    & h1 {
        color:${props => props.isTextBlack ? "#000" : "#fff"};
        margin: 0;
        padding: 0;
        font-size: 25px;
        word-break: keep-all;
        transition: color 0.3s ease-in-out;
    }
    & p {
        color:${props => props.isTextBlack ? "#343434" : "#d7d7d7"};
        margin: 0;
        padding: 0;
        margin-top: 10px;
        font-size: 15px;
        word-break: keep-all;
        transition: color 0.3s ease-in-out;
    }

`
const BannerImg = styled.div`
width: 400px;
position: relative;
height: 150px;
margin-right: 0;

& img {
    object-fit: contain;
    object-position: right;
}
`
const BannerSelectors = styled.div<{isTextBlack:boolean}>`
    position: absolute;
    bottom: 30px;
    display: flex;
    font-size: 15px;
    color:${props=>props.isTextBlack?"#000":"#fff"};
    align-items: center;
    transition: color 0.3s ease-in-out;
    cursor: pointer;
    & p {
        width: 50px;
        display: flex;
        justify-content: space-evenly;
        margin: 0;
        font-size: 12px;
        user-select: none;
    }
    & b {
        color:${props=>props.isTextBlack?"#707070":"#cccccc"};
    }
`
interface BannerData {
    Img:string,
    Title:string,
    Sub:string,
    Link:string,
    Color:Array<number>
}

const Banner = (props: { data: Array<BannerData> }) => {

    const [ActivebannerIndex, setActiveBannerIndex] = useState<number>(0)
    
    return (
        <BannerElem color={props.data[ActivebannerIndex].Color}>
            <BannerHolder>
                <BannerText isTextBlack={props.data[ActivebannerIndex].Color[0] * 0.299 + props.data[ActivebannerIndex].Color[1] * 0.587 + props.data[ActivebannerIndex].Color[2] * 0.114 > 186}>
                    <h1>{props.data[ActivebannerIndex].Title}</h1>
                    <p>{props.data[ActivebannerIndex].Sub}</p>
                </BannerText>
                {props.data[ActivebannerIndex].Img!==""?<BannerImg><Image src={props.data[ActivebannerIndex].Img} alt="banner_img" fill={true} /></BannerImg>:<></>}
                <BannerSelectors isTextBlack={props.data[ActivebannerIndex].Color[0] * 0.299 + props.data[ActivebannerIndex].Color[1] * 0.587 + props.data[ActivebannerIndex].Color[2] * 0.114 > 186}><IoIosArrowBack onClick={()=>setActiveBannerIndex(ActivebannerIndex-1<0?props.data.length-1:ActivebannerIndex-1)}/> <p>{ActivebannerIndex+1}<b>/</b>{props.data.length}</p><IoIosArrowForward onClick={()=>setActiveBannerIndex(ActivebannerIndex+1>=props.data.length?0:ActivebannerIndex+1)}/></BannerSelectors>
            </BannerHolder>
        </BannerElem>
    )
}

const FilterHolder = styled.ul`
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    padding: 15px 0px;
    padding-bottom: 0;
    width: 100%;
    &::-webkit-scrollbar {
  display: none;
}

-ms-overflow-style: none;
scrollbar-width: none;
`
const ChevRon = styled.div<{ spin: number }>`
    rotate: ${props => props.spin}deg;
    color: ${props => props.theme.Body.TextColorLevels[3]};
`
const FilterLabel = styled.li<{ noBorder?: boolean }>`
    color: ${props => props.theme.Body.TextColorLevels[2]};
    font-size: 13px;
    background-color: ${props => props.noBorder ? "transparent" : props.theme.Header.BgColor};
    border-radius: 10px;
    height: 30px;
    display: flex;
    padding: 0px 10px;
    align-items: center;
    margin-right: 20px;
    width: 100px;
    white-space: nowrap;
    border: solid 1px ${props => props.noBorder ? "transparent" : props.theme.Body.ContainerBgLevels[0]};
    justify-content: space-between;
    cursor: pointer;
`

const Filter = styled.div`
    position: relative;
`

const ProblemArrangeHolder = styled.div`
    color: ${props => props.theme.Body.TextColorLevels[2]};
    font-size: 12px;
    width: 100%;
    height: 40px;
    top: 0px;
    margin: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    & .solved {
        width: 100px;
        cursor: pointer;
    }
    & .name {
        width: 100%;
        cursor: pointer;
    }
    & .solves{
        width: 100px;
        cursor: pointer;
    }
    & .difficulty{
        width: 100px;
        cursor: pointer;
    }
    border-bottom: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
`
const Dropped = styled.ul`
    list-style:none;
    position: absolute;
    top: 45px;
    background-color: ${props => props.theme.Header.BgColor};
    min-width: 50px;
    z-index: 1;
    padding: 0;
    width: 100px;
    border: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
    padding: 10px;
    left: 0;
    border-radius: 10px;
`

const DroppedElem = styled.li`
padding: 0;
display: flex;
color: ${props => props.theme.Body.TextColorLevels[2]};
font-size: 12px;
padding: 5px;
cursor: pointer;
border-radius: 5px;
align-items: center;
justify-content: space-between;
&:hover {
    background-color: ${props => props.theme.Body.ContainerBgLevels[1]};
}
`

const ExtraDropdown = styled.div`
    position: absolute;
    left: 110px;
    top: 90px;
    height: 50px;
    background-color: ${props => props.theme.Header.BgColor};
    border: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 10px;
    & input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
    & input[type=number]:focus {
        outline: none;
        background-color: ${props => props.theme.Body.ContainerBgLevels[0]};
    }
    & input[type=number] {
        border: none;
        width: 30px;
        height: 18px;
        border-radius: 5px;
        margin-right: 10px;
        font-size: 11px;
        background-color: ${props => props.theme.Body.ContainerBgLevels[2]};
        color: ${props => props.theme.Body.TextColorLevels[3]};
        text-align: center;
        caret-color: transparent;
        user-select: none;
        cursor: pointer;
        font-weight: 500;
    }
    white-space: nowrap;
    flex-direction: column;
    padding: 10px;
`

const Statement = styled.div`
    
`

const RangeParse: any = (range: string | Array<string>, returnAsObj?: boolean) => {
    if(typeof range=="undefined") {
        return returnAsObj?{gt:undefined,lt:undefined}:undefined
    }
    let r = typeof range == "object" ? range[0] : range
    let gtMatch = r.match(/gt(\d+)/);
    let ltMatch = r.match(/lt(\d+)/);

    let gt = gtMatch ? parseInt(gtMatch[1]) + " 이상 " : ""
    let lt = ltMatch ? parseInt(ltMatch[1]) + " 이하 " : ""

    if (returnAsObj) {
        let gt = gtMatch ? parseInt(gtMatch[1]) : ""
        let lt = ltMatch ? parseInt(ltMatch[1]) : ""
        return { gt: gt, lt: lt }
    }

    return gt + lt
}

const FilterElem = (props: { label: string, qkey: string, displayRange?: boolean, setRange: Function, elements: Array<{ label: string, onclick: Function, id: string }>, toggleExtend: Function, isExtended: boolean }) => {
    const [extraDrop, setExtraDrop] = useState(false)
    const lower_bound = useRef<any>()
    const upper_bound = useRef<any>()
    const router = useRouter()

    const removeParamFromUrl = (param: string, data?: string) => {
        const params = new URLSearchParams(encode(router.query));
        let param_copy = params.toString()
        params.delete(param, data);
        router.push("?" + params.toString(), undefined, { shallow: true });
        return param_copy !== params.toString()
    }


    return (
        <Filter>
            <FilterLabel onClick={(v) => props.toggleExtend(v)}>{props.label} <ChevRon spin={props.isExtended ? 180 : 0}><FiChevronDown /></ChevRon></FilterLabel>
            {props.isExtended ?
                <Dropped>
                    {props.elements.map((elem) => {
                        return (
                            <DroppedElem key={elem.label} onClick={() => { if (!removeParamFromUrl(props.qkey, elem.id)) { elem.onclick(props.qkey, elem.id) } }}>{elem.label}
                                {(typeof router.query[props.qkey] == "object" ?
                                    router.query[props.qkey] :
                                    [router.query[props.qkey]])?.includes(elem.id) ? <FiCheck /> : <></>}</DroppedElem>
                        )
                    })}
                    {props.displayRange ? <DroppedElem onMouseOver={() => setExtraDrop(true)} onMouseOut={() => setExtraDrop(false)}>범위 지정하기<ChevRon spin={-90}><FiChevronDown /></ChevRon>{props.isExtended && extraDrop ?
                        <ExtraDropdown>
                            <Statement>
                                <input type="number"
                                    defaultValue={RangeParse(router.query[props.qkey],true)["gt"]}
                                    min={0}
                                    ref={lower_bound}
                                    onClick={() => lower_bound.current.value = ""}
                                    onBlur={() => props.setRange(lower_bound.current.value, upper_bound.current.value)}
                                />
                                이상
                            </Statement>
                            <Statement>
                                <input type="number"
                                    defaultValue={RangeParse(router.query[props.qkey],true)["lt"]}
                                    min={0}
                                    ref={upper_bound}
                                    onClick={() => upper_bound.current.value = ""}
                                    onBlur={() => props.setRange(lower_bound.current.value, upper_bound.current.value)}
                                />
                                이하
                            </Statement>
                        </ExtraDropdown>
                        : <></>}</DroppedElem> : <></>}
                </Dropped> : <></>}
        </Filter>
    )
}

const Problem = styled.div<{noBorder?:boolean}>`
    width: 100%;
    border-bottom: solid 1px ${props => props.noBorder?"transparent":props.theme.Body.ContainerBgLevels[0]};
    height: 50px;
    display: flex;
    align-items: center;
    font-size: 13px;
    cursor: pointer;
    & .solved {
        width: 100px;
        cursor: pointer;
        color:green;
        font-size: 15px;
    }
    & .name {
        width: 100%;
        color: ${props => props.theme.Body.TextColorLevels[1]};
    }
    & .solves{
        width: 100px;
        color: ${props => props.theme.Body.TextColorLevels[3]};
    }
    & .difficulty{
        width: 100px;
        color: ${props => props.theme.Body.TextColorLevels[3]};
    }
    color: ${props => props.theme.Body.TextColorLevels[2]};
`

const ProblemElem = (props: { name: string, solves: number, difficulty: number, code: number, isSolved:boolean }) => {
    const FormatNum = (num: number) => {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + "만"
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "천"
        }
        return num
    }
    return (
        <Link href={`problems/${props.code}/description`}>
            <Problem>
            <div className="solved">
                {props.isSolved?<FiCheck />:<></>}
                </div>
                <div className="name">
                    {props.name}
                </div>

                <div className="solves">
                    {FormatNum(props.solves)}
                </div>
                <div className="difficulty">
                    {props.difficulty}
                </div>
            </Problem>
        </Link>
    )
}

const ProblemSkeleton = () => {
    return (
        <ThemeConsumer>
            {theme => <SkeletonTheme baseColor={theme.Container.backgroundColor} highlightColor={theme.Body.ContainerBgLevels[0]}>
                <Problem noBorder={true}>
                    <div className="name">
                        <Skeleton height={20} borderRadius={5} style={{ "width": "80%" }} />
                    </div>

                    <div className="solves">
                        <Skeleton height={20} borderRadius={5} style={{ "width": "80%" }} />
                    </div>
                    <div className="difficulty">
                        <Skeleton height={20} borderRadius={5} style={{ "width": "80%" }} />
                    </div>
                </Problem>
            </SkeletonTheme>}
        </ThemeConsumer>
    )
}


const ResizeHolder = styled.div`
display: flex;
overflow: scroll;
border: none;
margin: 0;
padding: 0;
&::-webkit-scrollbar {
  display: none;
}

-ms-overflow-style: none;
scrollbar-width: none;
`

const LeftBlurBorder = styled.div`
  height: 30px;
  position: absolute;
  left: 0;
  width: 30px;
  z-index: 10;
  background: linear-gradient(90deg, ${props => props.theme.Body.backgroundColor} 30%, rgba(0,0,0,0) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.Body.TextColorLevels[3]};
  padding-right: 20px;
  font-size: 15px;
  cursor: pointer;
  @media(max-width: 770px) {
    display: none;
  }
`
const RightBlurBorder = styled(LeftBlurBorder)`
  right: 0;
  left:auto;
  background: linear-gradient(90deg, rgba(0,0,0,0) 0%, ${props => props.theme.Body.backgroundColor} 70%);
  padding-right: 0;
  padding-left: 20px;
`

const ProblemSet = styled.div`
    display: flex;
    padding: 5px 10px;
    background-color:transparent;
    font-size: 13px;
    color: ${props => props.theme.Body.TextColorLevels[3]};
    border-radius: 20px;
    flex-shrink: 0;
    margin-right: 10px;
    cursor: pointer;
    &:hover {
        color:${props => props.theme.Body.TextColorLevels[1]};
    }
    & p {
        margin: 0;
        padding: 0px 5px;
        border-radius: 10px;
        background-color: ${props => props.theme.Body.ContainerBgLevels[0]};
        margin-left: 5px;
        font-size: 11px;
    }
`

const ProblemSeriesSelector = styled.div`
display: flex;
align-items: center;
margin-top: 30px;
width: 100%;
justify-content: flex-start;
`
const ProblemSeriesLabel = styled.div`
color: ${props => props.theme.Body.TextColorLevels[2]};

display: flex;
align-items: center;
font-size: 13px;
width: 100px;
flex-shrink: 0;
text-align: left;
`
const ProblemSeriesHolder = styled.div`
position: relative;
min-width: 0;
`

const ScrollableHolder = styled.div`
display: flex;
flex-direction: column;
overflow-x: scroll;
&::-webkit-scrollbar {
  display: none;
}

-ms-overflow-style: none;
scrollbar-width: none;
`

export default function ProblemIndex({
    banners,
  }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    console.log(banners)
    const router = useRouter()
    const [dropDown, setDropDown] = useState<string>()
    const [problemData, setProblemData] = useState<Array<object>>()

    const scrollRef = useRef<any>()
    const [isLeftArrowShown, setLeftArrowState] = useState(false)
    const [isRightArrowShown, setRightArrowState] = useState(true)
    const setQueryParam = (data:Array<{key: string, data: string}>) => {
        let arr = { ...router.query }
        data.forEach((elem)=>{
            arr[elem["key"]] = elem.data
        })

        router.push({ query: arr }, undefined, { shallow: true });
    }

    const setQueryParamArray = (key: string, data: string) => {

        let arr: any = { ...router.query }
        if (!(arr[key]?.includes(data))) {
            if (typeof arr[key] === "string") {
                arr[key] = [arr[key], data]
            } else if (typeof arr[key] === "object") {
                arr[key] = [...arr[key], data]
            } else {
                arr[key] = data
            }
            router.push({ query: arr }, undefined, { shallow: true });
        }
    }
    useEffect(() => {
        if (router.isReady) {
            let diff = typeof router.query.diff !== "undefined" ? RangeParse(router.query.diff, true) : {}
            let sol = typeof router.query.sol !== "undefined" ? RangeParse(router.query.sol, true) : {}
            let lang = typeof router.query.lang !== "undefined" ? router.query.lang : []

            let orderByObj:{[key:string]:string}={}
            let sortBy

            switch(router.query["sort"]) {
                case "sol":
                    sortBy="solved"
                    break
                case "name":
                    sortBy="ProblemName"
                    break
                case "diff":
                    sortBy="rating"
                    break
                default:
                    sortBy="ProblemName"
                    break

            }

            orderByObj[sortBy] = typeof router.query["dir"] == "string"?router.query["dir"]:"asc"

            fetch("/api/problems", {

                headers: {
                    'content-type': 'application/json',
                    'Authorization': window.localStorage.getItem("tk")!
                },
                body: JSON.stringify(
                    { diff: diff, lang: lang, sol: sol, orderBy:{...orderByObj} }
                ), method: "POST",
            }).then(resp => resp.json()).then((data) => {
                setProblemData(data)
            })
        }
    }, [router.isReady, router.query])
    const toggleDropDown = (dropdownElemId: string) => {
        if (dropDown == dropdownElemId) {
            setDropDown("")
        } else {
            setDropDown(dropdownElemId)
        }
    }
    const toggleSort = (key:string) =>{
        if(router.query["sort"] == key) {
            if(router.query["dir"] == "asc") {
                setQueryParam([{key:"dir",data:"desc"}])
            }else{
                setQueryParam([{key:"dir",data:"asc"}])
            }
        }else{
            setQueryParam([{key:"sort",data:key},{key:"dir",data:"asc"}])
        }
    }
    const moveCont = (isLeft: boolean) => {
        if (isLeft) {
            scrollRef.current.scrollBy({
                top: 0,
                left: -200,
                behavior: "smooth",
            })
        } else {
            scrollRef.current.scrollBy({
                top: 0,
                left: 200,
                behavior: "smooth",
            })
        }
    }
    const listner = () => {
        if (scrollRef.current.scrollLeft == 0) {
            setLeftArrowState(false)
        } else {
            setLeftArrowState(true)
        }
        if (scrollRef.current.offsetWidth + scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth - 5) {
            setRightArrowState(false)
        } else {
            setRightArrowState(true)
        }
    }
    useEffect(() => {
        let currentElem = scrollRef.current
        listner()
        currentElem.addEventListener('scroll', listner)
        return () => currentElem.removeEventListener('scroll', listner)
    }, [])
    return (
        <>
            <Head>
                <title>
                    문제 - 코이스터디
                </title>
            </Head>
            <GlobalStyle />
            <Header currentPage={"문제"} />
            <Banner data={banners}/>

            <Holder>
                <ProblemSeriesSelector>
                    <ProblemSeriesLabel>
                        문제 둘러보기
                    </ProblemSeriesLabel>
                    <ProblemSeriesHolder>
                        <ResizeHolder ref={scrollRef}>
                            {isLeftArrowShown ? <LeftBlurBorder onClick={() => moveCont(true)}><IoIosArrowBack /></LeftBlurBorder> : <></>}
                            {isRightArrowShown ? <RightBlurBorder onClick={() => moveCont(false)} ><IoIosArrowForward /></RightBlurBorder> : <></>}
                            <ProblemSet>기초 100제(Python)<p>100</p></ProblemSet>
                            <ProblemSet>기초 100제(C/C++)<p>100</p></ProblemSet>
                            <ProblemSet>기초 100제++<p>105</p></ProblemSet>
                            <ProblemSet>학생이 만든 문제<p>204</p></ProblemSet>
                            <ProblemSet>기초문법연습<p>30</p></ProblemSet>
                            <ProblemSet>USACO 연습<p>51</p></ProblemSet>
                            <ProblemSet>USACO 은동<p>22</p></ProblemSet>
                            <ProblemSet>USACO 금<p>8</p></ProblemSet>
                            <ProblemSet>KOI 초등<p>101</p></ProblemSet>
                            <ProblemSet>KOI 중등<p>122</p></ProblemSet>
                            <ProblemSet>KOI 고등<p>88</p></ProblemSet>
                        </ResizeHolder>
                    </ProblemSeriesHolder>
                </ProblemSeriesSelector>
                <ScrollableHolder>
                <FilterHolder>
                    <FilterElem label="난이도" qkey="diff" elements={
                        [
                            { label: "1 이하", id: "lt1", onclick: () => { setQueryParam([{key:"diff", data:"lt1"}]) } },
                            { label: "5 이하", id: "lt5", onclick: () => { setQueryParam([{key:"diff", data:"lt5"}]) } },
                            { label: "5 이상", id: "gt5", onclick: () => { setQueryParam([{key:"diff", data:"gt5"}]) } }
                        ]
                    } setRange={(lower_bound: number, upper_bound: number) => setQueryParam([{key:"diff", data:`gt${lower_bound}lt${upper_bound}`}])}
                        displayRange={true}
                        isExtended={dropDown == "diff"}
                        toggleExtend={() => toggleDropDown("diff")}></FilterElem>
                    <FilterElem label="언어" qkey="lang" elements={
                        [
                            { label: "Python", id: "python", onclick: () => { setQueryParamArray("lang", "python") } },
                            { label: "C++", id: "cpp", onclick: () => { setQueryParamArray("lang", "cpp") } },
                            { label: "Go", id: "go", onclick: () => { setQueryParamArray("lang", "go") } }
                        ]
                    } setRange={() => { }}
                        isExtended={dropDown == "lang"}
                        toggleExtend={() => toggleDropDown("lang")}></FilterElem>
                    <FilterElem label="풀이 수" qkey={"sol"} elements={
                        [
                            { label: "10 이하", id: "lt10", onclick: () => { setQueryParam([{key:"sol", data:"lt10"}]) } },
                            { label: "100 이하", id: "lt100", onclick: () => { setQueryParam([{key:"sol", data:"lt100"}]) } },
                            { label: "100 이상", id: "gt100", onclick: () => { setQueryParam([{key:"sol", data:"gt100"}]) } }
                        ]
                    } toggleExtend={() => toggleDropDown("sol")}
                        setRange={(lower_bound: number, upper_bound: number) => setQueryParam([{key:"sol", data:`gt${lower_bound}lt${upper_bound}`}])}
                        displayRange={true}
                        isExtended={dropDown == "sol"}></FilterElem>
                    <FilterLabel noBorder={true}>+ 태그 추가하기</FilterLabel>
                </FilterHolder>
                <ProblemHolder>
                    <ProblemArrangeHolder>
                        <div className="solved">
                            상태
                        </div>
                        <div className="name" onClick={() => toggleSort("name")}>
                            이름 {router.query["sort"]=="name"? router.query["dir"]=="desc"?<FiArrowDown />:<FiArrowUp />:<></>}
                        </div>
                        <div className="solves" onClick={() => toggleSort("sol")}>
                            풀이 수 {router.query["sort"]=="sol"? router.query["dir"]=="desc"?<FiArrowDown />:<FiArrowUp />:<></>}
                        </div>
                        <div className="difficulty" onClick={() => toggleSort("diff")}>
                            난이도 {router.query["sort"]=="diff"? router.query["dir"]=="desc"?<FiArrowDown />:<FiArrowUp />:<></>}
                        </div>
                    </ProblemArrangeHolder>
                    {typeof problemData == "undefined" ? <><ProblemSkeleton /><ProblemSkeleton /><ProblemSkeleton /></> : problemData.map((elem: any) => {
                        return (
                            <ProblemElem name={elem.ProblemName} solves={elem.solved} difficulty={elem.rating} key={elem.ProblemCode} code={elem.ProblemCode} isSolved={elem.isSolved} />
                        )
                    })}
                </ProblemHolder>
                </ScrollableHolder>
            </Holder>

        </>)
}

export const getServerSideProps = (async () => {
    if (
        typeof process.env.MONGOCONNSTR === "undefined"
    ) {
        console.log("DB Connection str not specified in .env");
        return {}
    }
    await mongoose.connect(process.env.MONGOCONNSTR)
    let banners = JSON.parse(JSON.stringify(await BannerSchema.find({},"-_id")))
    return { props: { banners } }
  }) satisfies GetServerSideProps<{ banners: Array<BannerData> }>