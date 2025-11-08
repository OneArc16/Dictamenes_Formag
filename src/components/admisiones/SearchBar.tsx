'use client';

export default function SearchBar({
  value, loading, onChange, onSearch, onClear,
}: {
  value: string;
  loading: boolean;
  onChange: (v: string) => void;
  onSearch: () => void;
  onClear: () => void;
}) {
  return (
    <div className="p-4 border shadow-sm rounded-2xl border-subtle bg-panel">
      <form
        onSubmit={(e) => { e.preventDefault(); onSearch(); }}
        className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Documento o nombre/apellido"
          className="px-4 py-3 border rounded-xl border-subtle bg-bg placeholder-muted focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-5 py-3 text-sm text-white border rounded-xl border-subtle bg-primary hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-5 py-3 text-sm border rounded-xl border-subtle bg-panel hover:bg-bg"
        >
          Limpiar
        </button>
      </form>
    </div>
  );
}
