// import llama3Tokenizer from "llama3-tokenizer-js";

export const cleanedText = (text: string) => {
  let newText = text
    .trim()
    .replace(/(\n){4,}/g, "\n\n\n")
    .replace(/\n\n/g, " ")
    .replace(/ {3,}/g, "  ")
    .replace(/\t/g, "")
    .replace(/\n+(\s*\n)*/g, "\n")
    .substring(0, 100000);

  // console.log(llama3Tokenizer.encode(newText).length);

  return newText;
};

export async function fetchWithTimeout(
  url: string,
  options = {},
  timeout = 3000,
) {
  // Create an AbortController
  const controller = new AbortController();
  const { signal } = controller;

  // Set a timeout to abort the fetch
  const fetchTimeout = setTimeout(() => {
    controller.abort();
  }, timeout);

  // Start the fetch request with the abort signal
  return fetch(url, { ...options, signal })
    .then((response) => {
      clearTimeout(fetchTimeout); // Clear the timeout if the fetch completes in time
      return response;
    })
    .catch((error) => {
      if (error.name === "AbortError") {
        throw new Error("Fetch request timed out");
      }
      throw error; // Re-throw other errors
    });
}

type suggestionType = {
  id: number;
  name: string;
  icon: string;
};

export const suggestions: suggestionType[] = [
  {
    id: 1,
    name: "Basketball",
    icon: "/basketball-new.svg",
  },
  {
    id: 2,
    name: "Machine Learning",
    icon: "/light-new.svg",
  },
  {
    id: 3,
    name: "Personal Finance",
    icon: "/finance.svg",
  },
  {
    id: 4,
    name: "U.S History",
    icon: "/us.svg",
  },
];

export const getSystemPrompt = (
  finalResults: { content: string }[],
  ageGroup: string,
) => {
  return `
  You are a professional interactive personal tutor who is an expert at explaining topics. Given a topic and the information to teach, please educate the user about it at a ${ageGroup} level.

  This system message stays attached to the conversation for every turn, but the instructions below about greeting and giving an overview apply ONLY to your very first reply. Check the conversation history: if you have already sent a message, you are mid-lesson, not starting over.
  - First reply only: greet the learner, give a short overview of the topic, and ask what they want to learn about (in markdown numbers). Keep it short and concise. Do not quiz them in this first message.
  - Every reply after that: never repeat the greeting, overview, or the numbered menu of topics. Directly answer the user's question or teach the specific sub-topic they picked, building on what has already been said. Be interactive and quiz the user occasionally once you've actually taught some material.

  Here is the information to teach:

  <teaching_info>
  ${"\n"}
   ${finalResults
     .slice(0, 7)
     .map((result, index) => `## Webpage #${index}:\n ${result.content} \n\n`)}
  </teaching_info>

  Here's the age group to teach at:

  <age_group>
  ${ageGroup}
  </age_group>

  Please return answer in markdown. It is very important for my career that you follow these instructions. Here is the topic to educate on:
    `;
};
