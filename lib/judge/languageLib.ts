export type AcceptableLanguage = "cpp" | "python" | "go" | "typescript" | "swift"

export class LanguageHandler {
    name: AcceptableLanguage
    containerName: string
    constructor(name: AcceptableLanguage, containerName: string) {
        this.name = name
        this.containerName = containerName
    }
    getPrefix = () => {
        switch (this.name) {
            case "python":
                return "py"
            case "go":
                return "go"
            case "typescript":
                return "ts"
            case "swift":
                return "swift"
            case "cpp":
                return "cpp"
        }
    }
    getImage = () => {
        switch (this.name) {
            case "python":
                return "python:alpine3.17"
            case "go":
                return "golang:alpine3.17"
            case "typescript":
                return "node"
            case "swift":
                return "swift"
            case "cpp":
                return "gcc"
        }
    }
    getCompileCommand = () => {
        const containerName = this.containerName
        switch (this.name) {
            case "cpp":
                return `g++ -o ${containerName} ${containerName}.cpp`
            case "go":
                return `go build -o ${containerName} ${containerName}.go`
            case "swift":
                return `swiftc ${containerName}.swift`
            case "python":
            case "typescript":
                return ""
            default:
                throw new Error(`Unsupported language`);
        }
    }
    getRunCodeCommand = () => {
        const containerName = this.containerName
        switch (this.name) {
            case "cpp":
            case "go":
            case "swift":
                return `./${containerName}`
            case "python":
                return `python3 ${containerName}.py`
            case "typescript":
                return `node ${containerName}.${containerName}`
            default:
                throw new Error(`Unsupported language`);
        }
    }
}