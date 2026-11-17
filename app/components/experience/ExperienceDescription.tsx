export default function ExperienceDescription({ text, className = "" }: { text: string; className?: string }) {
  return <p className={`text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${className}`}>{text}</p>;
}
