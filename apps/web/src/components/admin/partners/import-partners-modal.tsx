'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@/components/admin/ui/modal';
import { Button } from '@/components/admin/ui/button';
import type { ImportResponse } from '@/components/admin/partners/import-types';

interface ImportPartnersModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportPartnersModal({ open, onClose, onSuccess }: ImportPartnersModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

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
      if (json.data.summary.success > 0) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import Partners from Excel" maxWidth="max-w-4xl">
      {error && (
        <div className="mb-4 border border-red bg-red-light-5 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      {!result ? (
        <div className="space-y-6">
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
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Importing...
                  </span>
                ) : (
                  'Import Partners'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-stroke bg-white p-4">
              <p className="text-2xl font-bold text-dark">{result.summary.total}</p>
              <p className="text-sm text-dark-5">Total Rows</p>
            </div>
            <div className="border border-stroke bg-white p-4">
              <p className="text-2xl font-bold text-green">{result.summary.success}</p>
              <p className="text-sm text-dark-5">Successfully Imported</p>
            </div>
            <div className="border border-stroke bg-white p-4">
              <p className="text-2xl font-bold text-red">{result.summary.failed}</p>
              <p className="text-sm text-dark-5">Failed</p>
            </div>
          </div>

          {result.results.length > 0 && (
            <div className="max-h-96 overflow-y-auto border border-stroke">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-dark-5 uppercase">Row</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-dark-5 uppercase">Partner Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-dark-5 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-dark-5 uppercase">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {result.results.map((r, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm text-dark">{r.row}</td>
                      <td className="px-4 py-2 text-sm text-dark">{r.partnerCode}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-1 text-xs font-medium ${
                          r.status === 'success' ? 'bg-green-light-6 text-green' : 'bg-red-light-5 text-red'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-dark-5">{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
