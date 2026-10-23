import Tag from "../../ui/Tag";
import "./TopicList.css";

export default function TopicList({ topics }: { topics: string[] }) {
  return (
    <div className="ws-topics">
      {topics.map((t) => (
        <Tag key={t} className="ws-topic">
          {t}
        </Tag>
      ))}
    </div>
  );
}
