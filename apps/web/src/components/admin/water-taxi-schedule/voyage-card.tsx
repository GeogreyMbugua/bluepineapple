'use client';

import { ShipIcon } from '@/components/admin/icons';
import type { Voyage } from './types';
import { getVoyageStatusColor } from './helpers';

interface VoyageCardProps {
  voyage: Voyage;
}

export function VoyageCard({ voyage }: VoyageCardProps) {
  return (
    <div className="border border-stroke bg-white shadow-1 rounded-lg overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShipIcon className="size-4 text-dark-5" />
            <span className="text-sm font-bold text-dark">{voyage.voyageNumber}</span>
            <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${getVoyageStatusColor(voyage.status)}`}>
              {voyage.status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-dark">{voyage.vessel}</p>
            {!voyage.readinessPassed && (
              <p className="text-xs text-red-600">Readiness checks incomplete</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
