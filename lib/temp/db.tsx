export const Problems = [
    {
        ProblemName: "Hello World 출력하기",
        ProblemCode: 1,
        solved: 0,
        rating: 1,
        SupportedLang: ["python", "golang", "cpp"],
        Script: "## Background \n 가장 기본적인 명령은 출력문이다. C++/Python/Go를 사용해 \"Hello World\"를 출력하시오. \n Python에서 Hello World를 출력하는 방법은 아래와 같다. \n ```python\n print('Hello World') \n``` \n\n ## IO Example \n ### Input\n None \n### Output\n Hello World",
        Mem: 256000000,
        TestProgress: {
            Tests:
                [
                    {
                        tl: 1000,
                        in: [""],
                        out: ["Hello World"]
                    }
                ],
            Disallow:
                ["for", "while", "goto"]
        }
    },
    {
        ProblemCode: 2,
        ProblemName: "세 숫자의 합 구하기",
        rating: 1,
        SupportedLang: ["python", "cpp", "golang"],
        Script: "## Background \n 세 숫자의 합을 구해라 C++/Python/Go를 사용해 \"공백문자로 구분되는 세 숫자의 합\"을 출력하시오. \n ## IO Example \n ### Input\n 1 1 1 \n### Output\n 3",
        Mem: 256000000,
        TestProgress: {
            Tests:
                [
                    {
                        tl: 1000,
                        in: ["1 2 3"],
                        out: ["6"]
                    },
                    {
                        tl: 1000,
                        in: ["4 5 6"],
                        out: ["15"]
                    },
                    {
                        tl: 1000,
                        in: ["30 40 50"],
                        out: ["120"]
                    },
                    {
                        tl: 1000,
                        in: ["12 31 54"],
                        out: ["97"]
                    },
                ],
            Disallow:
                ["for", "while", "goto"]
        }


    }, {
        ProblemCode: 3,
        ProblemName: "문자열 입력받아 출력하기",
        rating: 1,
        SupportedLang: ["python", "cpp"],
        Script: "## Background \n 문자열이 주어졌을 때 해당 문자열을 출력하는 프로그램을 작성하시오. C++/Python/Go를 사용해 입력되는 문자열을 그대로 출력하시오. \n ## IO Example \n ### Input\n Hello \n### Output\n Hello",
        Mem: 256000000,
        TestProgress: {
            Tests:
                [
                    {
                        tl: 1000,
                        in: ["ABCDEFG"],
                        out: ["ABCDEFG"]
                    },
                    {
                        tl: 1000,
                        in: ["Hello"],
                        out: ["Hello"]
                    },
                    {
                        tl: 1000,
                        in: ["P9IhjNhxjKL"],
                        out: ["P9IhjNhxjKL"]
                    },
                ],
            Disallow: []

        }


    }, {
        ProblemCode: 4,
        ProblemName: "찍어서 맞춰라?",
        rating: 5,
        SupportedLang: ["python", "cpp"],
        Script: "## Background \n 숫자를 찍어서 맞춰보세요 \n ## IO Example \n ### Input\n None \n### Output\n <알려줄수 없음 ㅋ>",
        Mem: 256000000,
        TestProgress: {
            Tests:
                [
                    {
                        tl: 1000,
                        in: [""],
                        out: ["3697"]
                    }],
            Disallow: []
        }
    }
]