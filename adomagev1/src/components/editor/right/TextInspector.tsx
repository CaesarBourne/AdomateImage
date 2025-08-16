
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

type Align = "left" | "center" | "right";
type Props = {
  fontFamily: string;
  fontSize: number;
  fontWeight: "Regular" | "Bold" | "Medium";
  color: string;
  opacity: number; // 0-100
  align: Align;
  multiline: boolean;
  onChange: (patch: Partial<Props>) => void;
};

export function TextInspector(props: Props) {
  const { fontFamily, fontSize, fontWeight, color, opacity, align, multiline, onChange } = props;

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-sm font-medium">Text</h3>

      {/* Font family */}
      <div className="space-y-2">
        <Label>Text</Label>
        <Select
          value={fontFamily}
          onValueChange={(v) => onChange({ fontFamily: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Geist">Geist</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Size + weight */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Font size</Label>
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Font weight</Label>
            <Select
            value={fontWeight}
            onValueChange={(v: "Regular" | "Bold" | "Medium") => onChange({ fontWeight: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Color + opacity */}
      <div className="space-y-2">
        <Label>Text color</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            className="h-9 w-9 rounded-md border"
            value={color}
            onChange={(e) => onChange({ color: e.target.value })}
          />
          <div className="flex-1">
            <Slider
              value={[opacity]}
              max={100}
              step={1}
              onValueChange={([v]) => onChange({ opacity: v })}
            />
            <div className="text-xs opacity-70 mt-1">{opacity}</div>
          </div>
        </div>
      </div>

      {/* Align + multiline */}
      <div className="space-y-2">
        <Label>Opacity</Label>
        <div className="space-y-3">
          <ToggleGroup
            type="single"
            value={align}
            onValueChange={(v: Align) => v && onChange({ align: v })}
            className="justify-start"
          >
            <ToggleGroupItem value="left">H</ToggleGroupItem>
            <ToggleGroupItem value="center">H</ToggleGroupItem>
            <ToggleGroupItem value="right">A</ToggleGroupItem>
          </ToggleGroup>

          <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
            <span className="text-sm">Multi-line editing</span>
            <Switch checked={multiline} onCheckedChange={(v) => onChange({ multiline: v })} />
          </div>
        </div>
      </div>
    </Card>
  );
}
