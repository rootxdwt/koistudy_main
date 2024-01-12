import { GlobalStyle } from "@/lib/ui/DefaultComponent"
import styled from "styled-components"
import { Header } from "@/lib/ui/component/header"
import { FiChevronDown, FiArrowDown, FiX } from "react-icons/fi"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import { encode } from 'querystring'
import Link from "next/link"

const Holder = styled.div`
    background-color: ${props => props.theme.Body.backgroundColor};
    display: flex;
    flex-direction: column;
    width: 95vw;
    margin-left: auto;
    margin-right: auto;
    height: auto;
`

const ProblemHolder = styled.div`
    margin-top: 40px;
    width: 1300px;
    height: auto;
`
const Banner = styled.div`
    width:100vw;
    height:250px;
    background-color: #43d16e;
    margin-top: 60px;
`

const FilterHolder = styled.ul`
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    padding: 20px 0px;
    padding-bottom: 0;
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
    height: 35px;
    display: flex;
    padding: 0px 10px;
    align-items: center;
    margin-right: 20px;
    width: 100px;
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
    height: 30px;
    top: 0px;
    margin: 0;
    display: flex;
    flex-direction: row;
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
    top: 50px;
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
const FilterElem = (props: { label: string, displayRange?: boolean, setRange: Function, elements: Array<{ label: string, onclick: Function }>, toggleExtend: Function, isExtended: boolean }) => {
    const [extraDrop, setExtraDrop] = useState(false)
    const lower_bound = useRef<any>()
    const upper_bound = useRef<any>()
    return (
        <Filter>
            <FilterLabel onClick={(v) => props.toggleExtend(v)}>{props.label} <ChevRon spin={props.isExtended ? 180 : 0}><FiChevronDown /></ChevRon></FilterLabel>
            {props.isExtended ?
                <Dropped>
                    {props.elements.map((elem) => {
                        return (
                            <DroppedElem key={elem.label} onClick={(g) => elem.onclick(g)}>{elem.label}</DroppedElem>
                        )
                    })}
                    {props.displayRange ? <DroppedElem onMouseOver={() => setExtraDrop(true)} onMouseOut={() => setExtraDrop(false)}>범위 지정하기<ChevRon spin={-90}><FiChevronDown /></ChevRon>{props.isExtended && extraDrop ?
                        <ExtraDropdown>
                            <Statement>
                                <input type="number"
                                    defaultValue={0}
                                    min={0}
                                    ref={lower_bound}
                                    onClick={() => lower_bound.current.value = ""}
                                    onBlur={() => props.setRange(lower_bound.current.value, upper_bound.current.value)}
                                />
                                이상
                            </Statement>
                            <Statement>
                                <input type="number"
                                    defaultValue={1}
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

const Problem = styled.div`
    width: 100%;
    border-bottom: solid 1px ${props => props.theme.Body.ContainerBgLevels[0]};
    height: 50px;
    display: flex;
    align-items: center;
    font-size: 13px;
    cursor: pointer;
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

const ProblemElem = (props: { name: string, solves: number, difficulty: number,code:number }) => {
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


const Tags = styled.ul`
list-style-type: none;
display: flex;
padding:0;
margin:0;
align-items:center;
padding: 10px 0px;
margin-top: 5px;
`

const TagItm = styled.li<{ color?: string }>`
font-size: 11px;
padding: 4px 11px;
margin-right: 7px;
border-radius: 12px;
background-color: ${props => props.color ? props.color + "19" : props.theme.Body.ContainerBgLevels[2]};
color: ${props => props.color ? props.color : props.theme.Body.TextColorLevels[3]};
position: relative;
display:flex;
align-items:center;
justify-content: center;
`
const RemoveBtn = styled.div`
    cursor: pointer;
    margin-left: 5px;
    display:flex;
align-items:center;
justify-content: center;

`

const RangeParse:any = (range: string | Array<string>, returnAsObj?: boolean) => {

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
const CurrentFilters = () => {
    const router = useRouter()

    const removeParamFromUrl = (param: string, data?: string) => {
        const params = new URLSearchParams(encode(router.query));
        params.delete(param, data);
        router.replace({
            query: { ...Object.fromEntries(params) },
        });
    }
    if (typeof router.query === "undefined") {
        return <></>
    }
    return (
        <Tags>
            {Object.values(router.query).map((elem, index) => {
                var key = Object.keys(router.query)
                if (typeof elem === "undefined" || elem == "") {
                    return <></>
                }
                if (key[index] == "diff") {
                    return (
                        <TagItm key={index}>난이도: {RangeParse(elem)}<RemoveBtn onClick={() => removeParamFromUrl("diff")}><FiX /></RemoveBtn></TagItm>
                    )
                }
                if (key[index] == "sol") {
                    return (
                        <TagItm key={index}>풀이 수: {RangeParse(elem)}<RemoveBtn onClick={() => removeParamFromUrl("sol")}><FiX /></RemoveBtn></TagItm>
                    )
                }
                if (key[index] == "lang") {
                    return (typeof elem == "string" ? [elem] : elem).map((lang_tag, index) => {
                        return (
                            <TagItm key={lang_tag + index}>{lang_tag}<RemoveBtn onClick={(v) => removeParamFromUrl("lang", lang_tag)}><FiX /></RemoveBtn></TagItm>
                        )
                    })
                }
            })}
        </Tags>
    )
}
export default function ProblemIndex() {
    const router = useRouter()
    const [dropDown, setDropDown] = useState<string>()
    const [problemData, setProblemData] = useState<Array<object>>()
    const setQueryParam = (key: string, data: string) => {
        let arr = { ...router.query }
        arr[key] = data

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
        setProblemData(undefined)
        let diff=typeof router.query.diff!=="undefined"?RangeParse(router.query.diff,true):{}
        let sol=typeof router.query.sol!=="undefined"?RangeParse(router.query.sol,true):{}
        let lang=typeof router.query.lang!=="undefined"?router.query.lang:[]

        fetch("/api/problems", {
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(
                { diff: diff, lang: lang,sol:sol }
            ), method: "POST",
        }).then(resp => resp.json()).then((data) => {
            setProblemData(data)
        })
    }, [router.query])
    const toggleDropDown = (dropdownElemId: string) => {
        if (dropDown == dropdownElemId) {
            setDropDown("")
        } else {
            setDropDown(dropdownElemId)
        }
    }
    return (
        <>
            <GlobalStyle />
            <Header currentPage={"문제"} />
            <Banner></Banner>
            <Holder>
                <FilterHolder>
                    <FilterElem label="난이도" elements={
                        [
                            { label: "1 이하", onclick: () => { setQueryParam("diff", "lt1") } },
                            { label: "5 이하", onclick: () => { setQueryParam("diff", "lt5") } },
                            { label: "5 이상", onclick: () => { setQueryParam("diff", "gt5") } }
                        ]
                    } setRange={(lower_bound: number, upper_bound: number) => setQueryParam("diff", `gt${lower_bound}lt${upper_bound}`)}
                        displayRange={true}
                        isExtended={dropDown == "diff"}
                        toggleExtend={() => toggleDropDown("diff")}></FilterElem>
                    <FilterElem label="언어" elements={
                        [
                            { label: "aa", onclick: () => { setQueryParamArray("lang", "aa") } },
                            { label: "bb", onclick: () => { setQueryParamArray("lang", "bb") } }
                        ]
                    } setRange={() => { }}
                        isExtended={dropDown == "lang"}
                        toggleExtend={() => toggleDropDown("lang")}></FilterElem>
                    <FilterElem label="풀이 수" elements={
                        [
                            { label: "10 이하", onclick: () => { setQueryParam("sol", "lt10") } },
                            { label: "100 이하", onclick: () => { setQueryParam("sol", "lt100") } },
                            { label: "100 이상", onclick: () => { setQueryParam("sol", "gt100") } }
                        ]
                    } toggleExtend={() => toggleDropDown("sol")}
                        setRange={(lower_bound: number, upper_bound: number) => setQueryParam("sol", `gt${lower_bound}lt${upper_bound}`)}
                        displayRange={true}
                        isExtended={dropDown == "sol"}></FilterElem>
                    <FilterLabel noBorder={true}>+ 필터 추가하기</FilterLabel>
                </FilterHolder>
                <CurrentFilters></CurrentFilters>

                <ProblemHolder>
                    <ProblemArrangeHolder>
                        <div className="name">
                            이름<FiArrowDown />
                        </div>
                        <div className="solves">
                            풀이 수<FiArrowDown />
                        </div>
                        <div className="difficulty">
                            난이도<FiArrowDown />
                        </div>
                    </ProblemArrangeHolder>
                    {typeof problemData == "undefined"?<></>:problemData.map((elem:any)=>{
                        return (
                            <ProblemElem name={elem.ProblemName} solves={elem.solved} difficulty={elem.rating} key={elem.ProblemCode} code={elem.ProblemCode}/>
                        )
                    })}
                </ProblemHolder>
            </Holder>

        </>)
}