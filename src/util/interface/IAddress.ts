import React from "react";

export interface IAddress {
    id?: string;
    userId?: string
    label: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    locationCoords?: string;
}

export interface AddressPopupProps {
  addressPopup: boolean;
  setAddressPopup: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAddress: IAddress | null;
  handleAddressConfirm: (address: IAddress, radius: number) => void;
  setShowAddAddress: React.Dispatch<React.SetStateAction<boolean>>;
  showAddAddress: boolean;
  newAddress: IAddress;
  setNewAddress: React.Dispatch<React.SetStateAction<any>>;
  handleAddAddress: (address: IAddress) => void;
  serviceId?: string;
}