import styled from "styled-components"
import { createGlobalStyle } from 'styled-components'
import { DarkTheme } from "./theme"

export const GlobalStyle = createGlobalStyle<{ theme: typeof DarkTheme }>`
a {
	text-decoration: none;
}


  body,html {
    margin: 0;
    padding: 0;
    background-color: ${props => props.theme.Body.backgroundColor};
    overflow: auto;
    font-family: 'Noto Sans KR', sans-serif;
  }
  .cm-editor {
    background-color: transparent!important;
    width: 100%;
    flex-grow:1;
}
.cm-gutters {
  background-color: transparent!important;
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
 font-size: 24px;
}
& h2 {
  font-size: 14.72px;
  margin-top: 20px;
}
& h3 {
  font-size: 14.72px;
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

const AnsIndicator = styled.div<{ bgColor: string }>`
text-align: center;
border-radius: 5px;
background-color: ${props => props.bgColor};
width: 45px;
height: 20px;
font-size: 11px;
color: ${props => props.theme.Body.backgroundColor};
display: flex;
align-items: center;
justify-content: center;


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


