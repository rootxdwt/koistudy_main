import styled from "styled-components"
import { useEffect, useRef, memo, useState } from "react"
const RearrangeX = styled.span<{isDragging:boolean}>`
position:fixed;
height: calc(100vh - 40px);
bottom:0;
z-index:999;
width:10px;
margin-left:-11px;
cursor:col-resize;
display:flex;
font-size: 20px;
align-items:center;
justify-content:center;
background-color: ${props => props.isDragging?props.theme.Button.backgroundColor:props.theme.Header.BgColor};
border-left: solid 1px ${props => props.theme.Body.ContainerBgLevels[2]};
border-right: solid 1px ${props => props.theme.Body.ContainerBgLevels[2]};
color: ${props => props.theme.Body.TextColorLevels[2]};
@media (max-width: 770px) {
    display:none;
}
`

const RearrangeY = styled.span<{isDragging:boolean}>`
position:absolute;
height: 10px;
right:0;
z-index:1000;
width:100%;
margin-left:-11px;
cursor:row-resize;
align-items:center;
justify-content:center;
background-color: ${props => props.isDragging?props.theme.Button.backgroundColor:props.theme.Header.BgColor};
border-top: solid 1px ${props => props.theme.Body.ContainerBgLevels[2]};
color: ${props => props.theme.Body.TextColorLevels[2]};

@media (max-width: 770px) {
    display:none;
}
`

export const ResizeY = memo(function ResizeY(props: { setStateFunction: Function, defaultHeight: number }) {
    const previousHeight = useRef(props.defaultHeight)
    const currentHeight = useRef(props.defaultHeight)
    const [startingYpos, setStartingYpos] = useState<number | null>(null)
    const [isDragging,setIsDragging]= useState(false)

    useEffect(() => {
        console.log(props.defaultHeight)
        window.addEventListener('mousemove', mouseMoveHandler)
        window.addEventListener('touchmove', touchMoveHandler)
        window.addEventListener('mouseup', ResetPos)
        window.addEventListener('touchend', ResetPos)

        return () => {
            window.removeEventListener('mousemove', mouseMoveHandler)
            window.removeEventListener('touchmove', touchMoveHandler)
            window.removeEventListener('mouseup', ResetPos)
            window.removeEventListener('touchend', ResetPos)
        }
    }, [startingYpos])

    const mouseMoveHandler = (e: MouseEvent) => {
        if (startingYpos !== null) {
            e.preventDefault()
            props.setStateFunction(previousHeight.current + startingYpos - e.pageY)
            currentHeight.current = previousHeight.current + startingYpos - e.pageY
        }
    }

    const touchMoveHandler = (e: TouchEvent) => {
        if (startingYpos !== null) {
            props.setStateFunction(previousHeight.current + startingYpos - e.touches[0].pageY)
            currentHeight.current = previousHeight.current + startingYpos - e.touches[0].pageY
        }
    }
    const ResetPos = () => {
        previousHeight.current = currentHeight.current
        setStartingYpos(null)
        setIsDragging(false)
    }

    return (
        <RearrangeY
            onMouseDown={(e) => {setStartingYpos(e.pageY);setIsDragging(true)}}
            onTouchStart={(e) => {setStartingYpos(e.touches[0].pageY);setIsDragging(true)}}
            onMouseUp={ResetPos}
            onTouchEnd={ResetPos}
            isDragging={isDragging}
        />
    )
})

export const ResizeX = memo(function ResizeX(props: { setStateFunction: Function, parentWidth: Function }) {
    const previousWidth = useRef(500)
    const currentWidth = useRef(500)
    const [startingXpos, setStartingXpos] = useState<number | null>(null)
    const [isDragging,setIsDragging]= useState(false)

    useEffect(() => {
        window.addEventListener('mousemove', mouseMoveHandler)
        window.addEventListener('touchmove', touchMoveHandler)
        window.addEventListener('mouseup', ResetPos)
        window.addEventListener('touchend', ResetPos)

        return () => {
            window.removeEventListener('mousemove', mouseMoveHandler)
            window.removeEventListener('touchmove', touchMoveHandler)
            window.removeEventListener('mouseup', ResetPos)
            window.removeEventListener('touchend', ResetPos)
        }
    }, [startingXpos])

    useEffect(() => {
        previousWidth.current = props.parentWidth() / 2
        props.setStateFunction(previousWidth.current)
    }, [])


    const mouseMoveHandler = (e: MouseEvent) => {
        if (startingXpos !== null) {
            e.preventDefault()
            props.setStateFunction(previousWidth.current + startingXpos - e.pageX)
            currentWidth.current = previousWidth.current + startingXpos - e.pageX
        }
    }

    const touchMoveHandler = (e: TouchEvent) => {
        if (startingXpos !== null) {
            props.setStateFunction(previousWidth.current + startingXpos - e.touches[0].pageX)
            currentWidth.current = previousWidth.current + startingXpos - e.touches[0].pageX
        }
    }
    const ResetPos = () => {
        previousWidth.current = currentWidth.current
        setStartingXpos(null)
        setIsDragging(false)
    }

    return (
        <RearrangeX
            onMouseDown={(e) => {setStartingXpos(e.pageX);setIsDragging(true)}}
            onTouchStart={(e) => {setStartingXpos(e.touches[0].pageX);setIsDragging(true)}}
            onMouseUp={ResetPos}
            onTouchEnd={ResetPos}
            isDragging={isDragging}
        />
    )
})
