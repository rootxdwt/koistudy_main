import styled from "styled-components"
import { createGlobalStyle } from 'styled-components'
import { DarkTheme } from "./theme"
import { FiChevronDown } from 'react-icons/fi'
import { useState } from "react"

export const GlobalStyle = createGlobalStyle<{ theme: typeof DarkTheme }>`
  body,html {
    background-color: ${props => props.theme.Body.backgroundColor};
  }
  .cm-editor {
    background-color: transparent!important;
    width: 100%;
    flex-grow:1;
}
.cm-gutters {
  background-color: ${props => props.theme.Body.backgroundColor}!important;
}
  .cm-activeLine {
    background-color: ${props => props.theme.Button.backgroundColor}!important;
}
  .cm-scroller {
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
      
      ::-webkit-scrollbar-track {
        background: ${props => props.theme.Body.backgroundColor}; 
      }
       
      ::-webkit-scrollbar-thumb {
        background: #888; 
        border-radius: 2.5px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #555; 
      }
}
.cm-focused {
  outline:none!important;
}
`

export const Holder = styled.div`
display:flex;
flex-direction: column;
width: 1300px;
padding-top: 70px;
color: ${props => props.theme.Title.textColor};
margin-left:auto;
margin-right:auto;
@media(max-width: 1800px) {
  width: 1200px;
}
@media(max-width: 1700px) {
  width: 1100px;
}
@media(max-width: 1500px) {
  width: 1000px;
}
@media(max-width: 1300px) {
  width: 900px;
}
@media(max-width: 1200px) {
  width: 800px;
}
@media(max-width: 900px) {
  width: 100%;
  margin-left:auto;
  margin-right:auto;
}
& h1 {
  margin:0;
  margin-top:20px;
}
& p {
  color: ${props => props.theme.Title.subColor};
}
`

export const Button = styled.button<{ isBorder?: boolean }>`
border: none;
background-color: ${props => props.theme.Container.backgroundColor};
color: ${props => props.theme.Body.TextColorLevels[3]};
cursor:pointer;
display:flex;
align-items:center;
justify-content:center;
width: 85px;
height: 30px;
border-radius: 5px;
margin-right: 20px;
font-weight:bold;
&:hover{
  color: ${props => props.theme.Body.TextColorLevels[2]};
}

`

const ParentHolder = styled.div`
z-index:3;
display:flex;
align-items:center;
flex-direction:column;
position:absolute;
top: 40px;
overflow:hidden;
user-select:none;
height: 150px;
overflow-y:scroll;
overflow-x:hidden;
-ms-overflow-style: none;
background-color: ${props => props.theme.Body.backgroundColor}; 
::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  
  ::-webkit-scrollbar-track {
    background-color: ${props => props.theme.Body.backgroundColor}; 
  }
   
  ::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.Container.backgroundColor};
    border-radius: 2.5px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.Button.backgroundColor};
  }
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
border-left: solid 2px ${props => props.theme.Container.backgroundColor};
background-color: ${props => props.theme.Body.backgroundColor};
color: ${props => props.theme.Body.TextColorLevels[3]};
z-index:1;
cursor:pointer;
&:hover {
  color: ${props => props.theme.Body.TextColorLevels[2]};
  border-left: solid 2px ${props => props.theme.Body.TextColorLevels[2]};
}
`
const Current = styled.div`
padding: 6px 10px;
font-family: 'Poppins',sans-serif;
font-size:12px;
display:flex;
align-items:center;
justify-content:center;
background-color: ${props => props.theme.Container.backgroundColor};
color: ${props => props.theme.Body.TextColorLevels[3]};
border-radius: 5px;
cursor:pointer;
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

const AnsIndicator = styled.div<{ bgColor: string }>`
text-align: center;
border-radius: 5px;
background-color: ${props => props.bgColor};
padding: 2px 10px;
font-size: 11px;
color: ${props => props.theme.Body.backgroundColor};
width: 25px;

`

export const AW = () => {
  return <AnsIndicator bgColor="rgb(175,80,76)">AW</AnsIndicator>
}

export const TLE = () => {
  return <AnsIndicator bgColor="rgb(175, 155, 76)">TLE</AnsIndicator>
}

export const AC = () => {
  return <AnsIndicator bgColor="rgb(106,187,105)">AC</AnsIndicator>
}

export const DropDownMenu = (props: { active: string, items: Array<string>, clickEventHandler: any }) => {
  const [isDropped, setDropped] = useState(false)
  return (
    <DropDown>
      <Current onClick={() => setDropped(!isDropped)}>
        {props.active}
        <DropArrow isDropped={isDropped}>
          <FiChevronDown />
        </DropArrow>
      </Current>
      {isDropped ? <ParentHolder>
        {props.items.map((item, index) => {
          return (
            <DButton key={index} isActive={item == props.active} onClick={() => { props.clickEventHandler(item); setDropped(false) }}>
              {item}
            </DButton>
          )
        })}
      </ParentHolder> : <></>}
    </DropDown>
  )
}