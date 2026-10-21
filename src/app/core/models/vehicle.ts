export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';

export interface Vehicle {
  readonly id: string;
  readonly brand: string;
  readonly model: string;
  readonly year: number;
  readonly fuel: FuelType;
  readonly powerKw: number;
  readonly priceEur: number;
}

export interface City {
  readonly id: string;
  readonly name: string;
}

export interface Country {
  readonly code: 'DE' | 'AT' | 'CH';
  readonly name: string;
  readonly cities: readonly City[];
}

export interface Dealer {
  readonly id: string;
  readonly name: string;
  readonly cityId: string;
}

export interface TestDriveRequest {
  readonly fullName: string;
  readonly email: string;
  readonly vehicleId: string;
  readonly date: string;
  readonly consent: boolean;
}

export interface TestDriveConfirmation extends TestDriveRequest {
  readonly reference: string;
}
