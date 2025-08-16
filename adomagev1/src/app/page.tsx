import EditorPage from "@/components/editor/EditorPage";
import { ModeToggle } from "@/components/modeToggle";

export default function Home() {
  return (
    <div>
    <div>
      <ModeToggle/>
      <EditorPage/>
    </div>
    </div>
  );
}
