"use client";
import * as React from "react";
import { ProdutoDTO, SupplierDTO } from "@/services/estoque";

export type ItemRow = {
  id: string;
  produto: ProdutoDTO;
  produtoId: string;
  unit: string;
  quantity: number;
  unitCost: number;
};

export type SupplierState = {
  value: SupplierDTO | null;
  query: string;
  options: SupplierDTO[];
  openCreate: boolean;
  setValue: React.Dispatch<React.SetStateAction<SupplierDTO | null>>;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  setOptions: React.Dispatch<React.SetStateAction<SupplierDTO[]>>;
  setOpenCreate: React.Dispatch<React.SetStateAction<boolean>>;
};

export type ProductSearchState = {
  query: string;
  options: ProdutoDTO[];
  openCreate: boolean;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  setOptions: React.Dispatch<React.SetStateAction<ProdutoDTO[]>>;
  setOpenCreate: React.Dispatch<React.SetStateAction<boolean>>;
};