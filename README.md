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
