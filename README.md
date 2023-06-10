### Library Features

- Secure: Creates an individual docker container for every code submission. Every containers are sandboxed from the main server.

- Ease-of-use: Promisified judging library with modern syntax

```js
import { Judge } from '@/lib/judge/runjudge';

const judge = async () => {
	const JudgeInstance = new Judge('python', memoryLimit);
	const container = await JudgeInstance.CreateRunEnv("print('Hello World')");

	await judgeInstance.compileCode(container);
	var matchedTestCase = await judgeInstance.testCode(container, TestProgress);
};
```

- Scalability: Since the judging process is done in a docker container, every language compiler/interpreter available as a docker image can be used in the submission process. this provides the ability to extend the languages available with only a small change to the library.

- Easy testing: The testing process can be written in a single JSON file.

```js
TestProgress: {
	Tests: [
		{
			tl: 1000, // You can apply a different time limit for all test case
			in: ['1 2 3'],
			out: ['6'],
		},
		{
			tl: 2000,
			in: ['4 5 6'],
			out: ['15'],
		},
		{
			tl: 1111,
			in: ['30 40 50'],
			out: ['120'],
		},
		{
			tl: 900,
			in: ['12 31 54'],
			out: ['97'],
		},
	];
	Disallow: ['for', 'while', 'goto'];
}
```

### Service Features

- Intuitive user interface: Focused on simplicity, Supports Dark Mode

### Language Addition Guide

1. Create a Dockerfile and place it in the `dockerfiles/{your-language}-koi` directory. The base image of your language should be Alpine linux.
2. Add a reference to your Dockerfile in the `docker-compose.yml` file. You can define a custom image name, or the image name will be automatically set to `dockerfile-{your-language}-koi` if a custom name is not specified.
3. edit the `lib/pref/languageLib.ts` file. Define the Docker Image used, `Compilecommand` and `Runcommand` in the lib/pref/languageLib.ts file. A more detailed explanation is given below:
   - `getLangFullName`: indicates the user the language's real full name. You need to add your case, and make it return the full name of your language (for instance, Golang for go, JavaScript for javascript)
   - `getPrefix`: returns the file prefix of your language. Add the proper file prefix(for instance, py for python)
   - `getImage`: returns the image name of the judging container. It should be dockerfile-{your-language}-koi by default, if a custom image name isn't defined on step 2 above.
   - `getCompileCommand`: returns the compile command whch will be executed in the compile progress. The temporary filename is identical to the containerName variable. If your language doesn't require compilling, return a blank string("").
   - `getRunCodeCommand`: returns the run command.

```ts
export type AcceptableLanguage = "cpp" | "go" ... "python" | "r" //add your language here
class LanguageHandler {
	name: AcceptableLanguage

	getLangFullName =() => {
		switch(this.name){
			...
			case "python":
				return "Python"
			...
		}
	}

	getPrefix = () =>{
        switch (this.name) {
			...
            case "python":
                return "py"
			...
		}
	}

	getImage = () =>{
		switch (this.name) {
			...
			case "python":
				return "dockerfiles-py-koi"
			...
		}
	}

	getCompileCommand = () => {
		switch(this.name) {
			case "rust":
				return `rustc ${containerName}.rs -o ${containerName}`
			case "python":
			case "javascript":
				return ""
		}
	}

	getRunCodeCommand = () => {
		switch (this.name) {
			case "cpp":
            case "go":
            case "rust":
                return `./${containerName}`
            case "python":
                return `python3 ${containerName}.py`
		}
	}
}
```
