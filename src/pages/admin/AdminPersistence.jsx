import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, RotateCcw, HardDrive, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  buildCatalogSnapshot,
  applyCatalogSnapshot,
  validateCatalogSnapshot,
  downloadCatalogBackupJson,
  clearAllCatalogKeys,
  getLastSavedDisplay,
  CATALOG_BACKUP_SCHEMA_VERSION,
} from '@/lib/catalogPersistence';
import { useToast } from '@/components/ui/use-toast';
import { useFirestoreData } from '@/config/appConfig';

export default function AdminPersistence() {
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const firestoreMode = useFirestoreData;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const [lastSaved, setLastSaved] = useState(() => getLastSavedDisplay());
  useEffect(() => {
    setLastSaved(getLastSavedDisplay());
  }, []);

  const onExport = () => {
    if (firestoreMode) {
      toast({ title: 'Firestore ativo', description: 'Use o script de seed/backup do Firestore para o catálogo global.' });
      return;
    }
    try {
      downloadCatalogBackupJson();
      toast({ title: 'Backup descarregado', description: 'Guarde o ficheiro JSON num local seguro.' });
    } catch (e) {
      toast({ title: 'Erro ao exportar', description: String(e.message || e), variant: 'destructive' });
    }
  };

  const onImportFile = (e) => {
    if (firestoreMode) {
      toast({ title: 'Firestore ativo', description: 'A importação local não altera o catálogo global.', variant: 'destructive' });
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const data = JSON.parse(text);
        const v = validateCatalogSnapshot(data);
        if (!v.ok) {
          toast({ title: 'Backup inválido', description: v.error, variant: 'destructive' });
          setBusy(false);
          return;
        }
        applyCatalogSnapshot(data);
        toast({
          title: 'Backup importado',
          description: 'A recarregar para aplicar o catálogo completo…',
        });
        window.setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        toast({ title: 'Erro ao ler JSON', description: String(err.message || err), variant: 'destructive' });
        setBusy(false);
      }
    };
    reader.onerror = () => {
      toast({ title: 'Falha na leitura do ficheiro', variant: 'destructive' });
      setBusy(false);
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const onReset = () => {
    if (firestoreMode) {
      toast({ title: 'Firestore ativo', description: 'A limpeza local não afeta o catálogo global.', variant: 'destructive' });
      return;
    }
    if (
      !window.confirm(
        'Isto apaga o catálogo e perfil guardados neste navegador (localStorage). ' +
          'Faça exportação de backup antes se precisar dos dados. Continuar?'
      )
    ) {
      return;
    }
    clearAllCatalogKeys();
    toast({ title: 'Armazenamento limpo', description: 'A recarregar…' });
    window.setTimeout(() => window.location.reload(), 300);
  };

  const snapPreview = () => {
    try {
      const s = buildCatalogSnapshot();
      return `${Object.keys(s.keys).length} chaves · schema v${s.schemaVersion}`;
    } catch {
      return '—';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-20 md:pt-24 px-4 md:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/Admin" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Backup do catálogo</h1>
            <p className="text-gray-400 text-sm mt-1">Persistência local segura · KIDSPlay demo</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#141414] p-5 space-y-3">
            <div className="flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-[#E50914] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Estado atual</p>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="text-gray-300">Origem:</span>{' '}
                  <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded">{origin}</code>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="text-gray-300">Último salvamento registado:</span>{' '}
                  {lastSaved ? new Date(lastSaved).toLocaleString('pt-BR') : '—'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="text-gray-300">Resumo:</span> {snapPreview()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-100/95 leading-relaxed">
              Cada combinação de URL + porta tem o seu próprio armazenamento. Use sempre{' '}
              <strong className="text-amber-50">http://localhost:4173</strong> para desenvolvimento e preview
              (porta fixa no Vite). Modo anónimo ou limpar dados do site apaga o catálogo deste origem.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5 space-y-4">
            <p className="text-sm text-gray-300">
              {firestoreMode ? (
                <>
                  O catálogo global está a usar <code className="text-xs bg-black/30 px-1">Firestore</code>.
                  Este painel mantém apenas ferramentas locais legadas; para produção use os scripts
                  <code className="text-xs bg-black/30 px-1 ml-1">npm run firestore:seed</code> e as regras do Firestore.
                </>
              ) : (
                <>
                  Em <code className="text-xs bg-black/30 px-1">npm run dev</code>, o catálogo também é gravado
                  automaticamente em <code className="text-xs bg-black/30 px-1">data/catalog-backup.json</code>{' '}
                  (debounce após alterações). Pode copiar esse ficheiro para cópia de segurança fora do projeto.
                </>
              )}
            </p>
            <p className="text-xs text-gray-500">
              Versão do formato de backup: <strong>{CATALOG_BACKUP_SCHEMA_VERSION}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Button
              type="button"
              onClick={onExport}
              className="bg-[#E50914] hover:bg-[#FF3D3D]"
              disabled={busy}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar backup (JSON)
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={onImportFile}
            />
            <Button
              type="button"
              variant="outline"
              className="border-white/20"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar backup
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="bg-red-900/80 hover:bg-red-800"
              disabled={busy}
              onClick={onReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar catálogo local
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
