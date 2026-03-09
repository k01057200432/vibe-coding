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
import { useCreateSimulation } from "@/lib/queries/simulations";

interface SimulationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  name: string;
  strategyType: string;
  strategyParams: string;
  brokerType: string;
  symbols: string;
  tradeSymbol: string;
  startDate: string;
  endDate: string;
  speedMultiplier: string;
  initialCash: string;
}

const STRATEGY_TYPES = [
  { value: "swing", label: "ETF Swing" },
  { value: "stock_momentum", label: "Stock Momentum" },
  { value: "vwap_reversion", label: "VWAP Reversion" },
];

const BROKER_TYPES = [
  { value: "alpaca", label: "Alpaca" },
  { value: "ibkr", label: "IBKR" },
];

export function SimulationForm({ open, onOpenChange }: SimulationFormProps) {
  const create = useCreateSimulation();
  const { register, handleSubmit, setValue, watch, reset } =
    useForm<FormValues>({
      defaultValues: {
        name: "",
        strategyType: "swing",
        strategyParams: "{}",
        brokerType: "alpaca",
        symbols: "TQQQ",
        tradeSymbol: "TQQQ",
        startDate: "",
        endDate: "",
        speedMultiplier: "10000",
        initialCash: "100000",
      },
    });

  const onSubmit = async (values: FormValues) => {
    const symbols = values.symbols
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    let strategyParams: Record<string, unknown> = {};
    try {
      strategyParams = JSON.parse(values.strategyParams);
    } catch {
      // keep empty
    }

    await create.mutateAsync({
      name: values.name,
      strategyType: values.strategyType,
      strategyParams,
      brokerType: values.brokerType,
      symbols,
      tradeSymbol: values.tradeSymbol,
      startDate: values.startDate,
      endDate: values.endDate,
      speedMultiplier: values.speedMultiplier,
      initialCash: values.initialCash,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 시뮬레이션</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sim-name">이름</Label>
            <Input
              id="sim-name"
              placeholder="swing-backtest-2026-Q1"
              {...register("name", { required: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>전략 유형</Label>
              <Select
                value={watch("strategyType")}
                onValueChange={(v) => setValue("strategyType", v)}
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
              <Label>브로커 유형</Label>
              <Select
                value={watch("brokerType")}
                onValueChange={(v) => setValue("brokerType", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BROKER_TYPES.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sim-symbols">심볼</Label>
              <Input
                id="sim-symbols"
                placeholder="TQQQ"
                {...register("symbols", { required: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sim-trade-symbol">매매 심볼</Label>
              <Input
                id="sim-trade-symbol"
                placeholder="TQQQ"
                {...register("tradeSymbol", { required: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sim-start">시작일</Label>
              <Input
                id="sim-start"
                type="date"
                {...register("startDate", { required: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sim-end">종료일</Label>
              <Input
                id="sim-end"
                type="date"
                {...register("endDate", { required: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sim-speed">속도 배수</Label>
              <Input
                id="sim-speed"
                type="number"
                {...register("speedMultiplier")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sim-cash">초기 자본 ($)</Label>
              <Input
                id="sim-cash"
                type="number"
                {...register("initialCash")}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sim-params">전략 파라미터 (JSON)</Label>
            <Textarea
              id="sim-params"
              rows={3}
              className="font-mono text-xs"
              {...register("strategyParams")}
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
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "생성중..." : "생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
