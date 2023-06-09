export type AcceptableLanguage = "cpp" | "python" | "go" | "javascript" | "php" | "rust" | "r"

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
                return "dockerfiles-py-koi"
            case "go":
                return "dockerfiles-golang-koi"
            case "javascript":
                return "dockerfiles-node-koi"
            case "cpp":
                return "dockerfiles-gcc-koi"
            case "php":
                return "dockerfiles-php-koi"
            case "rust":
                return "dockerfiles-rust-koi"
            case "r":
                return "dockerfiles-r-koi"
        }
    }
    getCompileCommand = () => {
        const containerName = this.containerName
        switch (this.name) {
            case "cpp":
                return `g++ -o ${containerName} ${containerName}.cpp`
            case "go":
                return `go build -o ${containerName} ${containerName}.go`
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
            case "rust":
                return [`./${containerName}`]
            case "python":
                return ['python3', `${containerName}.py`]
            case "javascript":
                return ['node', `${containerName}.js`]
            case "php":
                return ['php', `${containerName}.php`]
            case "r":
                return ['Rscript', `${containerName}.R`]
            default:
                throw new Error(`Unsupported language`);
        }
    }
}