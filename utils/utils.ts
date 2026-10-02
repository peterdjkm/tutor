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

type topicCategory = {
  id: number;
  icon: string;
  topics: string[];
};

// One pool of topics per category; a random one from each is shown as a
// homepage suggestion chip, re-rolled on every page load.
export const topicCategories: topicCategory[] = [
  {
    id: 1,
    icon: "/light-new.svg",
    topics: [
      "AI Prompt Engineering",
      "Neural Networks",
      "Large Language Models",
      "Computer Vision",
      "Reinforcement Learning",
      "Generative Adversarial Networks",
      "Natural Language Processing",
      "Machine Learning Basics",
      "Transformer Architecture",
      "AI Ethics and Safety",
      "Deep Learning",
      "Recommendation Systems",
      "Speech Recognition",
      "Diffusion Models",
      "Autonomous Vehicles",
      "Data Science Fundamentals",
    ],
  },
  {
    id: 2,
    icon: "/history.svg",
    topics: [
      "French Revolution",
      "Roman Empire",
      "Cold War",
      "Industrial Revolution",
      "Ancient Egypt",
      "World War II",
      "Renaissance",
      "American Revolution",
      "Silk Road",
      "Byzantine Empire",
      "Fall of the Berlin Wall",
      "Age of Exploration",
      "Mongol Empire",
      "Civil Rights Movement",
      "Ottoman Empire",
      "Russian Revolution",
    ],
  },
  {
    id: 3,
    icon: "/energy.svg",
    topics: [
      "Wind Energy",
      "Solar Power",
      "Nuclear Fission",
      "Battery Storage",
      "Hydroelectric Power",
      "Carbon Capture",
      "Geothermal Energy",
      "Oil Refining",
      "Natural Gas",
      "Hydrogen Fuel Cells",
      "Electric Grid Modernization",
      "Nuclear Fusion",
      "Biofuels",
      "Rare Earth Minerals",
      "Energy Storage Economics",
      "Climate Change Mitigation",
    ],
  },
  {
    id: 4,
    icon: "/finance.svg",
    topics: [
      "Interest-Rate Swaps",
      "Stock Market Basics",
      "Venture Capital",
      "Mergers and Acquisitions",
      "Cryptocurrency",
      "Behavioral Economics",
      "Supply Chain Management",
      "Startup Valuation",
      "Bond Markets",
      "Derivatives Trading",
      "Corporate Tax Strategy",
      "Private Equity",
      "Inflation and Monetary Policy",
      "Business Model Innovation",
      "Real Estate Investment",
      "ESG Investing",
    ],
  },
];

// Deterministic first pick per category — used for the server-rendered
// initial state so there's no hydration mismatch; randomized client-side
// right after mount (see Hero.tsx).
export const defaultSuggestions: suggestionType[] = topicCategories.map(
  (category) => ({
    id: category.id,
    name: category.topics[0],
    icon: category.icon,
  }),
);

export function getRandomSuggestions(): suggestionType[] {
  return topicCategories.map((category) => ({
    id: category.id,
    name: category.topics[Math.floor(Math.random() * category.topics.length)],
    icon: category.icon,
  }));
}

export const depthOptions = [
  "Mid-High School",
  "College",
  "Graduate",
  "General Adult",
];

export const contextOptions = [
  "Technical & DIY",
  "Everyday Life",
  "Working Professional",
];

// How much to assume the learner already knows, and how formal to be.
const depthGuidance: Record<string, string> = {
  "Mid-High School": `
  The learner is in middle or high school (roughly ages 12-18). Use simple, everyday vocabulary and short sentences, and define any unfamiliar term the moment you use it. Break concepts into small, concrete steps before building up to anything abstract. Keep an upbeat, encouraging tone, and check for understanding often with simple questions.`,
  College: `
  The learner has a general high-school education and is studying toward a specific major. Assume basic academic literacy, but introduce technical vocabulary deliberately and define it on first use. Structure explanations logically: definition, then mechanism, then a concrete example, then why it matters. You can reference common intro-course concepts (basic math, biology, economics, etc.) without re-teaching them from scratch. Prompt critical thinking with follow-up questions.`,
  Graduate: `
  The learner holds an undergraduate degree and has a strong foundation in this field, possibly doing research. Use precise technical and academic language and standard notation freely — do not define common field terminology. Connect the topic to current research, open problems, or competing theoretical frameworks where relevant. Engage critically: surface nuance, edge cases, and the limitations of the standard textbook explanation rather than oversimplifying. Keep the tone collegial and rigorous, like a conversation between peers.`,
  "General Adult": `
  The learner is an adult with general literacy but no assumed academic background in this specific field. Explain things in plain language without being childish — avoid both unexplained jargon and condescension. Assume life experience and common sense, not coursework.`,
};

// What kind of examples, analogies, and framing will actually resonate.
const contextGuidance: Record<string, string> = {
  "Technical & DIY": `
  Frame explanations around how things work and how to build or fix them: mechanisms, materials, tools, and hands-on experimentation. Favor examples a hobbyist builder or tinkerer would care about — specs, trade-offs, "why it's designed this way" — over abstract theory.`,
  "Everyday Life": `
  Frame explanations around ordinary daily life: household budgeting, routines, cooking, family life, errands — concrete things anyone deals with day to day. Favor simple, relatable, non-technical analogies over abstract theory; this is the option for someone who wants things grounded in plain, everyday experience, not a specific profession or role.`,
  "Working Professional": `
  Frame explanations around workplace and career relevance: decisions, efficiency, ROI, and real job scenarios. Lead with the "so what" and be concise — respect that this person has limited time and wants the practical takeaway, not theory for its own sake.`,
};

export const getSystemPrompt = (
  finalResults: { content: string }[],
  depth: string,
  context: string,
) => {
  const depthNotes = depthGuidance[depth] ?? depthGuidance["College"];
  const contextNotes =
    contextGuidance[context] ?? contextGuidance["Working Professional"];

  return `
  You are a professional interactive personal tutor who is an expert at explaining topics. Given a topic and the information to teach, please educate the user about it, tuned specifically to the learner profile described below.

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

  Here's the learner profile to tune every response to — two independent dimensions, apply both together:

  <learner_profile>
  Depth (how much to assume they know, and how formal to be): ${depth}
  ${depthNotes}

  Context (what kind of examples and framing will resonate): ${context}
  ${contextNotes}
  </learner_profile>

  Please return answer in markdown. For any mathematical notation, always wrap it in double dollar signs — $$...$$ — for both inline and block equations, rather than plain-text/Unicode approximations; the renderer supports proper LaTeX. Never use a single $ for math — a single $ is reserved for plain currency amounts (e.g. "$88 million") and must NOT be treated as a math delimiter. It is very important for my career that you follow these instructions. Here is the topic to educate on:
    `;
};
