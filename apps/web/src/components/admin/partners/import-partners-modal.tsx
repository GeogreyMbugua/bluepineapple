'use client';

import { useMemo, useState, useCallback } from 'react';
import { Modal } from '@/components/admin/ui/modal';
import { Button } from '@/components/admin/ui/button';
import type {
  ImportResponse,
  PartnerImportPreviewResponse,
  PartnerImportPreviewRow,
  PartnerImportReviewStatus,
} from '@/components/admin/partners/import-types';

interface ImportPartnersModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ImportStep = 'upload' | 'preview' | 'result';

const STATUS_LABELS: Record<PartnerImportReviewStatus, string> = {
  ready: 'Ready',
  review: 'Needs review',
  blocked: 'Blocked',
};

const STATUS_CLASSES: Record<PartnerImportReviewStatus, string> = {
  ready: 'bg-green-light-6 text-green',
  review: 'bg-yellow-light-4 text-yellow-dark',
  blocked: 'bg-red-light-5 text-red',
};

function defaultSelectedRows(rows: PartnerImportPreviewRow[]) {
  return new Set(rows.filter((row) => row.reviewStatus === 'ready').map((row) => row.rowNumber));
}

export function ImportPartnersModal({ open, onClose, onSuccess }: ImportPartnersModalProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PartnerImportPreviewResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isWorking, setIsWorking] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWarningsOnly, setShowWarningsOnly] = useState(false);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(null);
      setResult(null);
      setError(null);
      setStep('upload');
      setSelectedRows(new Set());
    }
  }, []);

  const handlePreview = async () => {
    if (!file) return;

    setIsWorking(true);
    setError(null);
    setPreview(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/partners/import/preview', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Preview failed');
      }

      const json = await res.json();
      const previewData = json.data as PartnerImportPreviewResponse;
      setPreview(previewData);
      setSelectedRows(defaultSelectedRows(previewData.rows));
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsWorking(false);
    }
  };

  const handleImport = async () => {
    if (!file || selectedRows.size === 0) return;

    setIsWorking(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('approvedRowNumbers', JSON.stringify([...selectedRows]));

      const res = await fetch('/api/admin/partners/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Import failed');
      }

      const json = await res.json();
      setResult(json.data);
      setStep('result');
      if (json.data.summary.success > 0) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsWorking(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStep('upload');
    setSelectedRows(new Set());
    setShowWarningsOnly(false);
    setShowErrorsOnly(false);
    onClose();
  };

  const visiblePreviewRows = useMemo(() => {
    if (!preview) return [];
    return preview.rows.filter((row) => {
      if (showWarningsOnly && row.warnings.length === 0) return false;
      return true;
    });
  }, [preview, showWarningsOnly]);

  const visibleResultRows = useMemo(() => {
    if (!result) return [];
    return showErrorsOnly
      ? result.results.filter((entry) => entry.status === 'error')
      : result.results;
  }, [result, showErrorsOnly]);

  const toggleRow = (rowNumber: number, reviewStatus: PartnerImportReviewStatus) => {
    if (reviewStatus === 'blocked') return;
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  };

  const selectByStatus = (status: PartnerImportReviewStatus) => {
    if (!preview) return;
    setSelectedRows(new Set(
      preview.rows.filter((row) => row.reviewStatus === status).map((row) => row.rowNumber),
    ));
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import Partners from Excel" maxWidth="max-w-6xl">
      {error && (
        <div className="mb-4 border border-red bg-red-light-5 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      {step === 'upload' && (
        <div className="space-y-6">
          <div className="border border-stroke bg-muted/40 p-4 text-sm text-dark-6">
            <p className="font-medium text-dark">Review before import</p>
            <p className="mt-1">
              The spreadsheet is not trusted blindly. We classify emails, phone numbers, and names across
              every column, flag misplaced values, and require you to approve rows before anything is created.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Emails found under WhatsApp columns are moved automatically and flagged</li>
              <li>Section headings and placeholder rows are blocked by default</li>
              <li>Rows missing names or contact details require explicit approval</li>
            </ul>
          </div>

          <div className="border border-dashed border-stroke p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <div className="text-sm text-dark-5">
                {file ? (
                  <span className="font-medium text-dark">{file.name}</span>
                ) : (
                  <>
                    <span className="text-primary-deep">Click to upload</span> or drag and drop
                    <br />
                    Excel file (.xlsx, .xls)
                  </>
                )}
              </div>
            </label>
          </div>

          {file && (
            <div className="flex justify-end">
              <Button onClick={handlePreview} disabled={isWorking}>
                {isWorking ? 'Analyzing spreadsheet…' : 'Review import'}
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'preview' && preview && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard label="Parsed rows" value={preview.summary.total} />
            <SummaryCard label="Ready" value={preview.summary.ready} accent="green" />
            <SummaryCard label="Needs review" value={preview.summary.review} accent="yellow" />
            <SummaryCard label="Blocked" value={preview.summary.blocked} accent="red" />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-dark-6">{selectedRows.size} row(s) selected for import</span>
            <button type="button" className="text-primary-deep hover:underline" onClick={() => selectByStatus('ready')}>
              Select ready
            </button>
            <button type="button" className="text-primary-deep hover:underline" onClick={() => selectByStatus('review')}>
              Select needs review
            </button>
            <button type="button" className="text-primary-deep hover:underline" onClick={() => setSelectedRows(new Set())}>
              Clear selection
            </button>
            <label className="ml-auto flex items-center gap-2 text-dark-6">
              <input
                type="checkbox"
                checked={showWarningsOnly}
                onChange={(event) => setShowWarningsOnly(event.target.checked)}
              />
              Show rows with warnings only
            </label>
          </div>

          <div className="max-h-[28rem] overflow-auto border border-stroke">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Import</th>
                  <th className="px-3 py-2 text-left">Row</th>
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-left">Company</th>
                  <th className="px-3 py-2 text-left">Contact</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {visiblePreviewRows.map((row) => (
                  <tr key={row.rowNumber} className={row.warnings.length > 0 ? 'bg-yellow-50/40' : undefined}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.rowNumber)}
                        disabled={row.reviewStatus === 'blocked'}
                        onChange={() => toggleRow(row.rowNumber, row.reviewStatus)}
                      />
                    </td>
                    <td className="px-3 py-2 text-dark">{row.rowNumber}</td>
                    <td className="px-3 py-2 text-dark">{row.partnerCode}</td>
                    <td className="px-3 py-2 text-dark">{row.name || '—'}</td>
                    <td className="px-3 py-2 text-dark">{row.contactName || '—'}</td>
                    <td className="px-3 py-2 text-dark-5">
                      {row.email || '—'}
                      {row.fieldSources.email && row.fieldSources.email !== 'Email address' && (
                        <span className="mt-0.5 block text-xs text-yellow-dark">
                          from {row.fieldSources.email}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-dark-5">
                      {row.phone || '—'}
                      {row.fieldSources.phone && !row.fieldSources.phone.includes('WhatsApp no') && (
                        <span className="mt-0.5 block text-xs text-yellow-dark">
                          from {row.fieldSources.phone}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium ${STATUS_CLASSES[row.reviewStatus]}`}>
                        {STATUS_LABELS[row.reviewStatus]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-dark-5">
                      {row.warnings.length > 0 ? (
                        <ul className="space-y-1">
                          {row.warnings.map((warning) => (
                            <li key={`${row.rowNumber}-${warning.code}`}>{warning.message}</li>
                          ))}
                        </ul>
                      ) : (
                        'Clean'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.issues.length > 0 && (
            <div className="border border-red/30 bg-red-light-5 px-4 py-3 text-sm text-red">
              {preview.issues.length} row(s) could not be parsed ({preview.issues[0]?.message}
              {preview.issues.length > 1 ? ', …' : ''})
            </div>
          )}

          <div className="flex justify-between gap-2">
            <Button variant="secondary" onClick={() => setStep('upload')} disabled={isWorking}>
              Back
            </Button>
            <Button onClick={handleImport} disabled={isWorking || selectedRows.size === 0}>
              {isWorking ? 'Importing…' : `Import selected (${selectedRows.size})`}
            </Button>
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Processed" value={result.summary.total} />
            <SummaryCard label="Imported" value={result.summary.success} accent="green" />
            <SummaryCard label="Failed" value={result.summary.failed} accent="red" />
          </div>

          {result.results.length > 0 && (
            <>
              {result.summary.failed > 0 && (
                <label className="flex items-center gap-2 text-sm text-dark-6">
                  <input
                    type="checkbox"
                    checked={showErrorsOnly}
                    onChange={(event) => setShowErrorsOnly(event.target.checked)}
                  />
                  Show failed rows only
                </label>
              )}
              <div className="max-h-96 overflow-y-auto border border-stroke">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-dark-5">Row</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-dark-5">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-dark-5">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-dark-5">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {visibleResultRows.map((entry, idx) => (
                      <tr key={`${entry.row}-${entry.partnerCode}-${idx}`}>
                        <td className="px-4 py-2 text-sm text-dark">{entry.row}</td>
                        <td className="px-4 py-2 text-sm text-dark">{entry.partnerCode}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium ${
                            entry.status === 'success' ? 'bg-green-light-6 text-green' : 'bg-red-light-5 text-red'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-dark-5">{entry.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setStep('preview'); setResult(null); }}>
              Review again
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'green' | 'yellow' | 'red';
}) {
  const accentClass = {
    green: 'text-green',
    yellow: 'text-yellow-dark',
    red: 'text-red',
    undefined: 'text-dark',
  }[String(accent)];

  return (
    <div className="border border-stroke bg-white p-4">
      <p className={`text-2xl font-bold ${accentClass ?? 'text-dark'}`}>{value}</p>
      <p className="text-sm text-dark-5">{label}</p>
    </div>
  );
}
