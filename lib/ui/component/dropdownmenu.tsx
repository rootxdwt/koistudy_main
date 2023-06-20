import styled from "styled-components"
import { useState } from "react"
import { FiChevronDown } from "react-icons/fi"
const ParentHolder = styled.div`
z-index:3;
display:flex;
align-items:center;
flex-direction:column;
position:absolute;
top: 40px;
overflow:hidden;
user-select:none;
max-height: 150px;
overflow-y:scroll;
overflow-x:hidden;
-ms-overflow-style: none;
background-color: ${props => props.theme.Button.backgroundColor};
border-radius: 10px;
padding: 10px;
`

const DButton = styled.div<{ isActive: boolean }>`
padding-left: 10px;
display:flex;
align-items:center;
justify-content:flex-start;
width: 90px;
height: 30px;
flex-shrink:0;
font-family: 'Poppins',sans-serif;
font-size:12px;
color: ${props => props.theme.Body.TextColorLevels[3]};
z-index:1;
cursor:pointer;
border-radius: 10px;
&:hover {
  background-color: ${props => props.theme.Body.ContainerBgLevels[0]};
}
`
const Current = styled.div`
background-color: ${props => props.theme.Button.backgroundColor};
padding:3px 10px;
font-family: 'Poppins',sans-serif;
font-size:12px;
display:flex;
align-items:center;
justify-content:center;
color: ${props => props.theme.Body.TextColorLevels[3]};
border-radius: 5px;
cursor:pointer;
border: solid 2px transparent;
&:hover {
  border: solid 2px ${props => props.theme.Body.ContainerBgLevels[0]};
}
`

const DropDown = styled.div`
display:flex;
flex-direction:column;
position:relative;
margin-left: 5px;
`

const DropArrow = styled.div<{ isDropped: boolean }>`
display:flex;
justify-content: center;
align-items: center;
transform: rotate(${props => props.isDropped ? "180" : "0"}deg);
margin-left: 10px;
`

export const DropDownMenu = (props: { active: string, items: Array<string>, clickEventHandler: any, displayName: Array<{ name: any, displayName: string }> }) => {
  const [isDropped, setDropped] = useState(false)
  return (
    <DropDown>
      <Current onClick={() => setDropped(!isDropped)}>
        {props.displayName.filter(elem => elem.name == props.active)[0].displayName}
        <DropArrow isDropped={isDropped}>
          <FiChevronDown />
        </DropArrow>
      </Current>
      {isDropped ? <ParentHolder>
        {props.items.map((item, index) => {
          return (
            <DButton key={index} isActive={item == props.active} onClick={() => { props.clickEventHandler(item); setDropped(false) }}>
              {props.displayName[index].displayName}
            </DButton>
          )
        })}
      </ParentHolder> : <></>}
    </DropDown>
  )
}
