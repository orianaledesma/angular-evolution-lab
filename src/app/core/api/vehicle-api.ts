import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  Country,
  Dealer,
  FuelType,
  TestDriveConfirmation,
  TestDriveRequest,
  Vehicle,
} from '../models/vehicle';

export interface VehicleQuery {
  readonly q?: string;
  readonly fuel?: FuelType | '';
  readonly simulate?: 'error' | 'empty' | 'slow' | '';
}

function toParams(query: VehicleQuery): Record<string, string> {
  return Object.fromEntries(
    Object.entries(query).filter(([, v]) => typeof v === 'string' && v !== ''),
  );
}

@Injectable({ providedIn: 'root' })
export class VehicleApi {
  private readonly http = inject(HttpClient);

  search(query: VehicleQuery = {}): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>('api/vehicles', { params: toParams(query) });
  }

  byId(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`api/vehicles/${encodeURIComponent(id)}`);
  }

  countries(): Observable<Country[]> {
    return this.http.get<Country[]>('api/countries');
  }

  dealers(cityId: string): Observable<Dealer[]> {
    return this.http.get<Dealer[]>('api/dealers', { params: { cityId } });
  }

  bookTestDrive(request: TestDriveRequest): Observable<TestDriveConfirmation> {
    return this.http.post<TestDriveConfirmation>('api/test-drives', request);
  }
}
