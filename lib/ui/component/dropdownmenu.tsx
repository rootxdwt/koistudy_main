import styled from "styled-components"
import { useEffect, useState } from "react"
import { FiChevronDown } from "react-icons/fi"
const ParentHolder = styled.div<{ isDown: boolean }>`
z-index:3;
display:flex;
align-items:center;
flex-direction:column;
position:absolute;
bottom: ${props => props.isDown ? "auto" : "40px"};
top: ${props => props.isDown ? "40px" : "auto"};
overflow:hidden;
user-select:none;
max-height: 150px;
overflow-y:scroll;
overflow-x:hidden;
background-color: ${props => props.theme.Button.backgroundColor};
border-radius: 5px;
padding: 6px;
-ms-overflow-style: none;
scrollbar-width: none;  
&::-webkit-scrollbar {
  display: none;
}
`

const DButton = styled.div<{ isActive: boolean }>`
padding-left: 10px;
display:flex;
align-items:center;
justify-content:flex-start;
width: 90px;
height: 32px;
flex-shrink:0;
font-family: 'Noto Sans KR', sans-serif;
font-size:12px;
color: ${props => props.theme.Body.TextColorLevels[3]};
z-index:1;
cursor:pointer;
border-radius: 5px;
&:hover {
  background-color: ${props => props.theme.Body.ContainerBgLevels[0]};
}
`
const Current = styled.div`
user-select: none;
background-color: ${props => props.theme.Button.backgroundColor};
padding:3px 10px;
font-family: 'Noto Sans KR', sans-serif;
font-size:12px;
display:flex;
align-items:center;
justify-content:center;
color: ${props => props.theme.Body.TextColorLevels[3]};
border-radius: 5px;
cursor:pointer;
border: solid 2px ${props=>props.theme.Body.backgroundColor};
&:hover {
  border: solid 2px ${props => props.theme.Body.ContainerBgLevels[0]};
}
`

const DropDown = styled.div`
display:flex;
flex-direction:column;
position:relative;
margin-left: 0px;
`

const DropArrow = styled.div<{ isDropped: boolean, defaultPosDown: boolean }>`
display:flex;
justify-content: center;
align-items: center;
transform: rotate(${props => props.isDropped ? props.defaultPosDown ? "180" : "0" : props.defaultPosDown ? "0" : "180"}deg);
margin-left: 10px;
`

export const DropDownMenu = (props: { active: string, items: Array<string>, clickEventHandler: any, displayName: Array<{ name: any, displayName: string }>, dropType: "up" | "down" }) => {
  const [isDropped, setDropped] = useState(false)
  const [nowActive, setNowActive] = useState<string>()
  useEffect(() => {
    setNowActive(props.displayName.filter(elem => elem.name == props.active)[0].displayName)
  }, [props.active])
  return (
    <DropDown>
      <Current onClick={() => setDropped(!isDropped)}>
        {nowActive}
        <DropArrow isDropped={isDropped}
          defaultPosDown={props.dropType == "down"}
        >
          <FiChevronDown />
        </DropArrow>
      </Current>
      {isDropped ? <ParentHolder isDown={props.dropType == "down"}>
        {props.items.map((item, index) => {
          return (
            <DButton key={index}
              isActive={item == props.active}
              onClick={() => { props.clickEventHandler(item); setDropped(false) }}>
              {props.displayName[index].displayName}
            </DButton>
          )
        })}
      </ParentHolder> : <></>}
    </DropDown>
  )
}
