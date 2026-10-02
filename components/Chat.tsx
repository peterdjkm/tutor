import ReactMarkdown from "react-markdown";
import FinalInputArea from "./FinalInputArea";
import { useEffect, useRef, useState } from "react";
import simpleLogo from "../public/simple-logo.png";
import Image from "next/image";
import { depthOptions, contextOptions } from "@/utils/utils";

export default function Chat({
  messages,
  disabled,
  loading,
  promptValue,
  setPromptValue,
  setMessages,
  handleChat,
  topic,
  depth,
  setDepth,
  context,
  setContext,
}: {
  messages: { role: string; content: string }[];
  disabled: boolean;
  loading: boolean;
  promptValue: string;
  setPromptValue: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: string; content: string }[]>
  >;
  handleChat: () => void;
  topic: string;
  depth: string;
  setDepth: React.Dispatch<React.SetStateAction<string>>;
  context: string;
  setContext: React.Dispatch<React.SetStateAction<string>>;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [didScrollToBottom, setDidScrollToBottom] = useState(true);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (loading || didScrollToBottom) {
      scrollToBottom();
    }
  }, [didScrollToBottom, messages, loading]);

  useEffect(() => {
    let el = scrollableContainerRef.current;
    if (!el) {
      return;
    }

    function handleScroll() {
      if (scrollableContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollableContainerRef.current;
        setDidScrollToBottom(scrollTop + clientHeight >= scrollHeight);
      }
    }

    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex grow flex-col gap-4 overflow-hidden">
      <div className="flex grow flex-col overflow-hidden lg:p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 uppercase text-gray-900">
          <p>
            <b>Topic: </b>
            {topic}
          </p>
          <span className="normal-case text-gray-400">|</span>
          <label className="flex items-center gap-1">
            <b>Depth:</b>
            <select
              className="rounded border border-gray-300 bg-white px-1 py-0.5 text-xs font-medium normal-case text-gray-900 sm:text-sm"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
            >
              {depthOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <span className="normal-case text-gray-400">|</span>
          <label className="flex items-center gap-1">
            <b>Context:</b>
            <select
              className="rounded border border-gray-300 bg-white px-1 py-0.5 text-xs font-medium normal-case text-gray-900 sm:text-sm"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            >
              {contextOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
        <div
          ref={scrollableContainerRef}
          className="mt-2 overflow-y-scroll rounded-lg border border-solid border-[#C2C2C2] bg-white px-5 lg:p-7"
        >
          {messages.length > 2 ? (
            <div className="prose-sm max-w-5xl lg:prose lg:max-w-full">
              {messages.slice(2).map((message, index) =>
                message.role === "assistant" ? (
                  <div className="relative w-full" key={index}>
                    <Image
                      src={simpleLogo}
                      alt=""
                      className="absolute left-0 top-0 !my-0 size-7"
                    />
                    <ReactMarkdown className="w-full pl-10">
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p
                    key={index}
                    className="ml-auto w-fit rounded-xl bg-blue-500 p-4 font-medium text-white"
                  >
                    {message.content}
                  </p>
                ),
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4 py-5">
              {Array.from(Array(10).keys()).map((i) => (
                <div
                  key={i}
                  className={`${i < 5 && "hidden sm:block"} h-10 animate-pulse rounded-md bg-gray-300`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white lg:p-4">
        <FinalInputArea
          disabled={disabled}
          promptValue={promptValue}
          setPromptValue={setPromptValue}
          handleChat={handleChat}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </div>
  );
}
