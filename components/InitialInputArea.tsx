import { FC, KeyboardEvent } from "react";
import TypeAnimation from "./TypeAnimation";
import Image from "next/image";

type TInputAreaProps = {
  promptValue: string;
  setPromptValue: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
  handleChat: (messages?: { role: string; content: string }[]) => void;
  depth: string;
  setDepth: React.Dispatch<React.SetStateAction<string>>;
  context: string;
  setContext: React.Dispatch<React.SetStateAction<string>>;
  handleInitialChat: () => void;
};

const InitialInputArea: FC<TInputAreaProps> = ({
  promptValue,
  setPromptValue,
  disabled,
  handleInitialChat,
  depth,
  setDepth,
  context,
  setContext,
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleInitialChat();
      }
    }
  };

  return (
    <form
      className="mx-auto flex w-full flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0"
      onSubmit={(e) => {
        e.preventDefault();
        handleInitialChat();
      }}
    >
      <div className="flex w-full flex-col rounded-lg border sm:flex-row">
        <textarea
          placeholder="Teach me about..."
          className="block w-full resize-none rounded-t-lg border-b p-6 text-sm text-gray-900 placeholder:text-gray-400 sm:rounded-l-lg sm:rounded-tr-none sm:border-b-0 sm:border-r sm:text-base"
          disabled={disabled}
          value={promptValue}
          required
          onKeyDown={handleKeyDown}
          onChange={(e) => setPromptValue(e.target.value)}
          rows={1}
        />
        <div className="flex items-center justify-center border-b sm:border-b-0 sm:border-r">
          <select
            id="depth"
            name="depth"
            title="Depth: how much to assume you already know"
            className="ring-none h-full rounded-md border-0 bg-transparent px-2 text-sm font-medium text-black focus:ring-0 sm:text-base"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
          >
            <option>Mid-High School</option>
            <option>College</option>
            <option>Graduate</option>
            <option>General Adult</option>
          </select>
        </div>
        <div className="flex items-center justify-center">
          <select
            id="context"
            name="context"
            title="Context: what kind of examples resonate"
            className="ring-none h-full rounded-md rounded-b-lg border-0 bg-transparent px-2 text-sm font-medium text-black focus:ring-0 sm:rounded-b-none sm:rounded-r-lg sm:text-base"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          >
            <option>Student</option>
            <option>Technical & DIY</option>
            <option>Home Maker</option>
            <option>Working Professional</option>
          </select>
        </div>
      </div>
      <button
        disabled={disabled}
        type="submit"
        className="relative flex size-[72px] w-[358px] shrink-0 items-center justify-center rounded-md bg-[linear-gradient(154deg,#2A8EF9_23.37%,#175CB6_91.91%)] disabled:pointer-events-none disabled:opacity-75 sm:ml-3 sm:w-[72px]"
      >
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <TypeAnimation />
          </div>
        )}

        <Image
          unoptimized
          src={"/up-arrow.svg"}
          alt="search"
          width={24}
          height={24}
          className={disabled ? "invisible" : ""}
        />
        <span className="ml-2 font-bold text-white sm:hidden">Search</span>
      </button>
    </form>
  );
};

export default InitialInputArea;
