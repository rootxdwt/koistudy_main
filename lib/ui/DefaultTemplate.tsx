import styled from "styled-components"
import { createGlobalStyle } from 'styled-components'
import { DarkTheme } from "./theme"

export const GlobalStyle = createGlobalStyle<{ theme: typeof DarkTheme }>`
  body,html {
    background-color: ${props => props.theme.Body.backgroundColor};
  }
  .cm-editor {
    background-color: transparent!important;
    width: 100%;
    flex-grow:1;
}
  .cm-activeLine {
    background-color: ${props => props.theme.Button.backgroundColor}!important;
}
  .cm-scroller {
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
        width: 5px;
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
`

export const Holder = styled.div`
display:flex;
flex-direction: column;
width: 800px;
padding-top: 100px;
color: ${props => props.theme.Title.textColor};
margin-left:auto;
margin-right:auto;
@media(max-width: 1300px) {
  width: 700px;
}
@media(max-width: 900px) {
  width: 80%;
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
background-color: ${props => props.isBorder ? "#000" : props.theme.Button.backgroundColor};
color: ${props => props.theme.Button.textColor};
cursor:pointer;
display:flex;
align-items:center;
justify-content:center;
width: 100px;
height: 35px;
border-radius: 10px;
border: solid 3px ${props => props.theme.Button.backgroundColor};
margin-right: 20px;

& p {
    font-weight: bold;
    color: rgb(200,200,200);
}
`