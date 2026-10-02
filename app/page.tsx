"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sources from "@/components/Sources";
import { useState } from "react";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { getSystemPrompt } from "@/utils/utils";
import Chat from "@/components/Chat";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [topic, setTopic] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [sources, setSources] = useState<
    { name: string; url: string; content: string }[]
  >([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState("College");
  const [context, setContext] = useState("Working Professional");

  // Triggered only by the explicit "Go" button in Chat, never on mere
  // dropdown selection, so scrolling through options doesn't fire requests.
  const applyProfileChange = async (newDepth: string, newContext: string) => {
    setDepth(newDepth);
    setContext(newContext);

    const updatedSystemMessage = {
      role: "system",
      content: getSystemPrompt(sources, newDepth, newContext),
    };
    const switchRequest = {
      role: "user",
      content: `Please switch to Depth: ${newDepth}, Context: ${newContext} and continue accordingly.`,
    };
    const updatedMessages = [
      updatedSystemMessage,
      ...messages.slice(1),
      switchRequest,
    ];
    setMessages(updatedMessages);
    await handleChat(updatedMessages);
  };

  const handleInitialChat = async () => {
    setShowResult(true);
    setLoading(true);
    setTopic(inputValue);
    setInputValue("");

    await handleSourcesAndChat(inputValue);

    setLoading(false);
  };

  const handleChat = async (messages?: { role: string; content: string }[]) => {
    setLoading(true);
    const chatRes = await fetch("/api/getChat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!chatRes.ok) {
      throw new Error(chatRes.statusText);
    }

    // This data is a ReadableStream
    const data = chatRes.body;
    if (!data) {
      return;
    }
    let fullAnswer = "";

    const onParse = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          fullAnswer += text;
          // Update messages with each chunk
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === "assistant") {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + text },
              ];
            } else {
              return [...prev, { role: "assistant", content: text }];
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    };

    // https://web.dev/streams/#the-getreader-and-read-methods
    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }
    setLoading(false);
  };

  async function handleSourcesAndChat(question: string) {
    setIsLoadingSources(true);
    let sourcesResponse = await fetch("/api/getSources", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    let sources: { name: string; url: string; content: string }[];
    if (sourcesResponse.ok) {
      sources = await sourcesResponse.json();

      setSources(sources);
    } else {
      sources = [];
      setSources(sources);
    }
    setIsLoadingSources(false);

    const initialMessage = [
      { role: "system", content: getSystemPrompt(sources, depth, context) },
      { role: "user", content: `${question}` },
    ];
    setMessages(initialMessage);
    await handleChat(initialMessage);
  }

  return (
    <>
      <Header />

      <main
        className={`flex grow flex-col px-4 pb-4 ${showResult ? "overflow-hidden" : ""}`}
      >
        {showResult ? (
          <div className="mt-2 flex w-full grow flex-col justify-between overflow-hidden">
            <div className="flex w-full grow flex-col space-y-2 overflow-hidden">
              <div className="mx-auto flex w-full max-w-7xl grow flex-col gap-4 overflow-hidden lg:flex-row lg:gap-10">
                <Chat
                  messages={messages}
                  disabled={loading}
                  loading={loading}
                  promptValue={inputValue}
                  setPromptValue={setInputValue}
                  setMessages={setMessages}
                  handleChat={handleChat}
                  topic={topic}
                  depth={depth}
                  context={context}
                  onApplyProfile={applyProfileChange}
                />
                <Sources sources={sources} isLoading={isLoadingSources} />
              </div>
            </div>
          </div>
        ) : (
          <Hero
            promptValue={inputValue}
            setPromptValue={setInputValue}
            handleChat={handleChat}
            depth={depth}
            setDepth={setDepth}
            context={context}
            setContext={setContext}
            handleInitialChat={handleInitialChat}
          />
        )}
      </main>
      {/* <Footer /> */}
    </>
  );
}
