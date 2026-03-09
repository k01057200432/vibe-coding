"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  useCreateStrategy,
  useUpdateStrategy,
  type Strategy,
} from "@/lib/queries/strategies";

interface StrategyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: Strategy | null;
}

interface FormValues {
  name: string;
  type: string;
  broker: string;
  symbols: string;
  params: string;
  mode: string;
  enabled: boolean;
  schedule: string;
  capitalPct: string;
}

const STRATEGY_TYPES = [
  { value: "swing", label: "ETF Swing" },
  { value: "stock_momentum", label: "Stock Momentum" },
  { value: "vwap_reversion", label: "VWAP Reversion" },
  { value: "orderbook_scalp", label: "Order Book Scalp" },
  { value: "futures_scalp", label: "Futures Scalp" },
];

const BROKERS = [
  { value: "alpaca", label: "Alpaca" },
  { value: "paper-broker", label: "Paper Broker" },
];

export function StrategyForm({
  open,
  onOpenChange,
  editData,
}: StrategyFormProps) {
  const isEdit = !!editData;
  const create = useCreateStrategy();
  const update = useUpdateStrategy();

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<FormValues>({
      defaultValues: editData
        ? {
            name: editData.name,
            type: editData.type,
            broker: editData.broker,
            symbols: editData.symbols.join(", "),
            params: JSON.stringify(editData.params, null, 2),
            mode: editData.mode,
            enabled: editData.enabled,
            schedule: editData.schedule,
            capitalPct: editData.capitalPct,
          }
        : {
            name: "",
            type: "swing",
            broker: "paper-broker",
            symbols: "TQQQ",
            params: "{}",
            mode: "paper",
            enabled: false,
            schedule: "1s",
            capitalPct: "0.1000",
          },
    });

  const onSubmit = async (values: FormValues) => {
    const symbols = values.symbols
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    let params: Record<string, unknown> = {};
    try {
      params = JSON.parse(values.params);
    } catch {
      // keep empty
    }

    const payload = {
      name: values.name,
      type: values.type,
      broker: values.broker,
      symbols,
      params,
      mode: values.mode,
      enabled: values.enabled,
      schedule: values.schedule,
      capitalPct: values.capitalPct,
    };

    if (isEdit) {
      await update.mutateAsync({ id: editData.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "전략 편집" : "새 전략"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="my-swing-strategy"
              {...register("name", { required: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>유형</Label>
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>브로커</Label>
              <Select
                value={watch("broker")}
                onValueChange={(v) => setValue("broker", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BROKERS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="symbols">심볼 (쉼표 구분)</Label>
            <Input
              id="symbols"
              placeholder="TQQQ, SQQQ"
              {...register("symbols", { required: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>모드</Label>
              <Select
                value={watch("mode")}
                onValueChange={(v) => setValue("mode", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paper">가상</SelectItem>
                  <SelectItem value="live">실전</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schedule">스케줄</Label>
              <Input id="schedule" {...register("schedule")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="capitalPct">자본 %</Label>
              <Input
                id="capitalPct"
                type="number"
                step="0.0001"
                min="0"
                max="1"
                {...register("capitalPct")}
              />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <Switch
                checked={watch("enabled")}
                onCheckedChange={(v) => setValue("enabled", v)}
              />
              <Label>활성화</Label>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="params">파라미터 (JSON)</Label>
            <Textarea
              id="params"
              rows={4}
              className="font-mono text-xs"
              {...register("params")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={create.isPending || update.isPending}
            >
              {create.isPending || update.isPending
                ? "저장중..."
                : isEdit
                  ? "수정"
                  : "생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
