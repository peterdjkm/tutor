import { FC, KeyboardEvent } from "react";
import TypeAnimation from "./TypeAnimation";
import Image from "next/image";

type TInputAreaProps = {
  promptValue: string;
  setPromptValue: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
  handleChat: (messages?: { role: string; content: string }[]) => void;
  profile: string;
  setProfile: React.Dispatch<React.SetStateAction<string>>;
  handleInitialChat: () => void;
};

const InitialInputArea: FC<TInputAreaProps> = ({
  promptValue,
  setPromptValue,
  disabled,
  handleInitialChat,
  profile,
  setProfile,
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
      <div className="flex w-full rounded-lg border">
        <textarea
          placeholder="Teach me about..."
          className="block w-full resize-none rounded-l-lg border-r p-6 text-sm text-gray-900 placeholder:text-gray-400 sm:text-base"
          disabled={disabled}
          value={promptValue}
          required
          onKeyDown={handleKeyDown}
          onChange={(e) => setPromptValue(e.target.value)}
          rows={1}
        />
        <div className="flex items-center justify-center">
          <select
            id="profile"
            name="profile"
            className="ring-none h-full rounded-md rounded-r-lg border-0 bg-transparent px-2 text-sm font-medium text-black focus:ring-0 sm:text-base"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
          >
            <option>Mid-High School</option>
            <option>College</option>
            <option>Graduate</option>
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
