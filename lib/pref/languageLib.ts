export type AcceptableLanguage = "cpp" | "python" | "go" | "javascript" | "swift" | "php" | "rust" | "r"

export class LanguageHandler {
    name: AcceptableLanguage
    containerName: string
    constructor(name: AcceptableLanguage, containerName: string) {
        this.name = name
        this.containerName = containerName
    }
    getLangFullName = () => {
        switch (this.name) {
            case "python":
                return "Python3"
            case "go":
                return "Go"
            case "javascript":
                return "JavaScript"
            case "swift":
                return "Swift"
            case "cpp":
                return "C++"
            case "php":
                return "PHP"
            case "rust":
                return "Rust"
            case "r":
                return "R"
        }
    }
    getPrefix = () => {
        switch (this.name) {
            case "python":
                return "py"
            case "go":
                return "go"
            case "javascript":
                return "js"
            case "swift":
                return "swift"
            case "cpp":
                return "cpp"
            case "php":
                return "php"
            case "rust":
                return "rs"
            case "r":
                return "R"
        }
    }
    getImage = () => {
        switch (this.name) {
            case "python":
                return "python:alpine3.17"
            case "go":
                return "golang:alpine3.17"
            case "javascript":
                return "node"
            case "swift":
                return "swift"
            case "cpp":
                return "gcc"
            case "php":
                return "php"
            case "rust":
                return "rust"
            case "r":
                return "r-base"
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
            case "rust":
                return `rustc ${containerName}.rs -o ${containerName}`
            case "php":
            case "python":
            case "r":
            case "javascript":
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
            case "rust":
                return `./${containerName}`
            case "python":
                return `python3 ${containerName}.py`
            case "javascript":
                return `node ${containerName}.js`
            case "php":
                return `php ${containerName}.php`
            case "r":
                return `Rscript ${containerName}.R`
            default:
                throw new Error(`Unsupported language`);
        }
    }
}