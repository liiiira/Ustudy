import Button from "./button";

type ComposerProps = {
  value: string;
  name: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  placeholder: string;
  charLimit: number;
  submitLabel: string;
  inputError: string[];
};

export default function Composer({
  name,
  value,
  handleChange,
  onSubmit,
  placeholder,
  charLimit,
  submitLabel,
  inputError,
}: ComposerProps) {

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }


  return (
  <div className="flex flex-col h-max w-full">
      <form
        className="flex flex-col items-start gap-3 px-4 py-2 w-full h-max border-2 rounded-2xl border-gray-400 bg-white"
        onSubmit={onSubmit}>

        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={charLimit}
          rows={1}
          className="flex-1 w-full resize-none rounded-md focus:outline-none"
        />

     
        <div className="flex w-full h-max flex-row justify-end"> 
          <Button
            variant="Primary"
            type="button"
            onClick={onSubmit}
            disabled={!value.trim()} // if not value disabled
          >
            {submitLabel}
          </Button>
        </div>
      </form>

      <div className="flex flex-row-reverse">
        <div className="text-sm text-gray-500 font-medium">{value.length}/{charLimit}</div>
        <div className=" min-h-5 text-red-500 text-xs">{value.length > 0 && inputError[0]}</div>
      </div>
    </div>
  );
}
