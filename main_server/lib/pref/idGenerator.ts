const first = ["당당한", "똑똑한", "멋있는", "뛰어난", "친절한", "우아한", "화려한", "훌륭한", "즐거운", "진정한", "단호한", "영리한", "특별한", "활기찬", "당당한", "힘찬", "열정적인"]
const second = ["펭귄", "북극여우", "북극토끼", "다람쥐", "곰", "토끼", "여우", "사슴", "고라니"]


export const genId = () => {
    return `${first[Math.floor(first.length * (Math.random()))]}${second[Math.floor(second.length * (Math.random()))]}${Math.floor(100 * (Math.random()))}`
}