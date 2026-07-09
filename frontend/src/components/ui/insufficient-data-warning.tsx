interface InsufficientDataWarningProps {
  visible: boolean;
  routeId?: string;
}

export function InsufficientDataWarning({ visible, routeId }: InsufficientDataWarningProps) {
  if (!visible) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <strong>⚠ Dados insuficientes</strong>
      {routeId && <span> para a rota {routeId}.</span>}
      <span> A quantidade de pings disponíveis é muito baixa para calcular métricas confiáveis de regularidade. Consulte o painel de qualidade de dados para detalhes.</span>
    </div>
  );
}
