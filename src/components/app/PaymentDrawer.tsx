import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { GhostButton, PrimaryButton, paymentLabel } from "@/components/app/ui-bits";
import { useStore } from "@/lib/store";
import { brl } from "@/lib/format";
import type { PaymentMethod, ServiceOrder } from "@/lib/types";

// Agendado: finaliza registrando o pagamento. Finalizado "a receber": registra o pagamento.
export function PaymentDrawer({
  order,
  onClose,
}: {
  order: ServiceOrder | null;
  onClose: () => void;
}) {
  const { setOrderStatus } = useStore();
  // Guarda o atendimento aberto para o conteúdo não mudar durante a animação de fechar.
  const [shown, setShown] = useState<ServiceOrder | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [saving, setSaving] = useState(false);
  const finalizing = shown?.status !== "FINALIZADO";

  useEffect(() => {
    if (!order) return;
    setShown(order);
    setMethod(order.paymentMethod ?? null);
  }, [order]);

  const save = async (paid: boolean) => {
    if (!shown) return;
    setSaving(true);
    try {
      await setOrderStatus(shown.id, "FINALIZADO", { paymentMethod: method, paid });
      toast.success(
        !finalizing
          ? "Pagamento registrado"
          : paid
            ? "Atendimento finalizado e pago"
            : "Atendimento finalizado — fica a receber",
      );
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={!!order} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DrawerContent className="mx-auto max-w-[430px]">
        <DrawerHeader>
          <DrawerTitle>{finalizing ? "Finalizar atendimento" : "Registrar pagamento"}</DrawerTitle>
          <DrawerDescription>
            {shown ? `${shown.code} · ${brl(shown.price)}` : ""}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Forma de pagamento</p>
          <div role="radiogroup" aria-label="Forma de pagamento" className="grid grid-cols-4 gap-2">
            {(Object.keys(paymentLabel) as PaymentMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={method === m}
                onClick={() => setMethod(m)}
                className={`rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                  method === m
                    ? "bg-secondary text-secondary-foreground"
                    : "border border-border bg-card text-muted-foreground"
                }`}
              >
                {paymentLabel[m]}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-2.5">
            <PrimaryButton disabled={saving || !method} onClick={() => void save(true)}>
              {finalizing ? "Recebido agora" : "Confirmar pagamento"}
            </PrimaryButton>
            {finalizing ? (
              <GhostButton disabled={saving} onClick={() => void save(false)}>
                Fica a receber
              </GhostButton>
            ) : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
