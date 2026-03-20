import {
  Monitor, Wifi, Smartphone, Tablet, Key, Package, CreditCard, HardDrive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "date" | "select" | "textarea";
  options?: string[];
  required?: boolean;
  table: "asset" | "spec";
}

export interface CategoryConfig {
  icon: LucideIcon;
  color: string;
  assetFields: FieldDef[];
  specsFields: FieldDef[];
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Computadores: {
    icon: HardDrive,
    color: "from-green-500 to-green-600",
    assetFields: [
      { key: "tipo", label: "Tipo de equipo", type: "select", options: ["Portátil", "Torre"], required: true, table: "asset" },
      { key: "marca", label: "Marca", placeholder: "Ej: Dell, HP, Lenovo", table: "asset" },
      { key: "modelo", label: "Modelo", placeholder: "Ej: Latitude 5420", table: "asset" },
      { key: "numeroSerie", label: "Número de Serie", placeholder: "Ej: SN-ABC-12345", table: "asset" },
      { key: "sedeZona", label: "Sede / Zona", type: "select", required: true, table: "asset" },
      { key: "responsable", label: "Responsable", placeholder: "Nombre del responsable", table: "asset" },
      { key: "estado", label: "Estado", type: "select", required: true, table: "asset" },
      { key: "observacion", label: "Observación", type: "textarea", placeholder: "Notas adicionales...", table: "asset" },
    ],
    specsFields: [
      { key: "ram", label: "RAM", placeholder: "Ej: 16 GB", table: "spec" },
      { key: "procesador", label: "Procesador", placeholder: "Ej: Intel i7-11th", table: "spec" },
      { key: "sistemaOperativo", label: "Sistema Operativo", placeholder: "Ej: Windows 11 Pro", table: "spec" },
      { key: "capacidadDisco", label: "Capacidad Disco", placeholder: "Ej: 512 GB SSD", table: "spec" },
      { key: "direccionIp", label: "Dirección IP", placeholder: "192.168.1.100", table: "spec" },
      { key: "macWifi", label: "MAC WiFi", placeholder: "AA:BB:CC:DD:EE:FF", table: "spec" },
    ],
  },

  Monitores: {
    icon: Monitor,
    color: "from-blue-500 to-blue-600",
    assetFields: [
      { key: "marca", label: "Marca", placeholder: "Ej: LG, Samsung, Dell", table: "asset" },
      { key: "modelo", label: "Modelo", placeholder: "Ej: UltraSharp U2722D", table: "asset" },
      { key: "numeroSerie", label: "Número de Serie", placeholder: "Ej: SN-MON-001", table: "asset" },
      { key: "sedeZona", label: "Sede / Zona", type: "select", required: true, table: "asset" },
      { key: "responsable", label: "Responsable", placeholder: "Nombre del responsable", table: "asset" },
      { key: "estado", label: "Estado", type: "select", required: true, table: "asset" },
      { key: "observacion", label: "Observación", type: "textarea", placeholder: "Notas adicionales...", table: "asset" },
    ],
    specsFields: [
      { key: "pulgadas", label: "Pulgadas", placeholder: "Ej: 27\"", table: "spec" },
      { key: "soporte", label: "Soporte", placeholder: "Ej: VESA 100x100, base ajustable", table: "spec" },
    ],
  },

  Redes: {
    icon: Wifi,
    color: "from-cyan-500 to-cyan-600",
    assetFields: [
      { key: "tipo", label: "Tipo de dispositivo", type: "select", options: ["Switch", "Router", "AP", "Antena", "Firewall", "Patch Panel", "Otro"], required: true, table: "asset" },
      { key: "marca", label: "Marca", placeholder: "Ej: Cisco, TP-Link, Ubiquiti", table: "asset" },
      { key: "modelo", label: "Modelo", placeholder: "Ej: SG110-16", table: "asset" },
      { key: "sedeZona", label: "Sede / Zona", type: "select", required: true, table: "asset" },
      { key: "estado", label: "Estado", type: "select", required: true, table: "asset" },
      { key: "observacion", label: "Observación", type: "textarea", placeholder: "Notas adicionales...", table: "asset" },
    ],
    specsFields: [
      { key: "wifiBackup", label: "WiFi / Backup", placeholder: "Ej: WiFi o Backup", table: "spec" },
      { key: "red", label: "Red", placeholder: "Ej: 192.168.1.0/24", table: "spec" },
      { key: "contrasena", label: "Contraseña", placeholder: "Contraseña del dispositivo", table: "spec" },
      { key: "ubicacion", label: "Ubicación", placeholder: "Ej: Rack Piso 2 - Slot 3", table: "spec" },
    ],
  },

  Celulares: {
    icon: Smartphone,
    color: "from-purple-500 to-purple-600",
    assetFields: [
      { key: "marca", label: "Marca", placeholder: "Ej: Samsung, Apple, Motorola", table: "asset" },
      { key: "modelo", label: "Modelo", placeholder: "Ej: Galaxy S23", table: "asset" },
      { key: "numeroSerie", label: "Número de Serie", placeholder: "Ej: IMEI o S/N", table: "asset" },
      { key: "sedeZona", label: "Sede / Zona", type: "select", required: true, table: "asset" },
      { key: "responsable", label: "Responsable", placeholder: "Nombre del responsable", table: "asset" },
      { key: "estado", label: "Estado", type: "select", required: true, table: "asset" },
      { key: "observacion", label: "Observación", type: "textarea", placeholder: "Notas adicionales...", table: "asset" },
    ],
    specsFields: [
      { key: "imei1", label: "IMEI 1", placeholder: "15 dígitos", table: "spec" },
      { key: "imei2", label: "IMEI 2", placeholder: "15 dígitos (dual SIM)", table: "spec" },
      { key: "numeroSim", label: "SIM", placeholder: "Número de la SIM", table: "spec" },
      { key: "macWifi", label: "MAC WiFi", placeholder: "AA:BB:CC:DD:EE:FF", table: "spec" },
      { key: "cargador", label: "Cargador", placeholder: "Ej: 25W USB-C", table: "spec" },
      { key: "correoGmail", label: "Correo Gmail", placeholder: "equipo@gmail.com", table: "spec" },
    ],
  },

  Tablets: {
    icon: Tablet,
    color: "from-orange-500 to-orange-600",
    assetFields: [
      { key: "marca", label: "Marca", placeholder: "Ej: Apple, Samsung, Lenovo", table: "asset" },
      { key: "modelo", label: "Modelo", placeholder: "Ej: iPad Air 5", table: "asset" },
      { key: "numeroSerie", label: "Número de Serie", placeholder: "Ej: SN-TAB-001", table: "asset" },
      { key: "sedeZona", label: "Sede / Zona", type: "select", required: true, table: "asset" },
      { key: "responsable", label: "Responsable", placeholder: "Nombre del responsable", table: "asset" },
      { key: "estado", label: "Estado", type: "select", required: true, table: "asset" },
      { key: "observacion", label: "Observación", type: "textarea", placeholder: "Notas adicionales...", table: "asset" },
    ],
    specsFields: [
      { key: "imei1", label: "IMEI", placeholder: "15 dígitos", table: "spec" },
      { key: "cargador", label: "Cargador", placeholder: "Ej: 20W USB-C", table: "spec" },
      { key: "correoGmail", label: "Correo Gmail", placeholder: "equipo@gmail.com", table: "spec" },
    ],
  },

  Licencias: {
    icon: Key,
    color: "from-pink-500 to-pink-600",
    assetFields: [
      { key: "marca", label: "Nombre del Software", placeholder: "Ej: Microsoft Office 365", required: true, table: "asset" },
      { key: "tipo", label: "Tipo de Licencia", type: "select", options: ["Perpetua", "Suscripción", "OEM", "Volumen", "Freeware", "Otro"], table: "asset" },
      { key: "numeroSerie", label: "Número de Serie / Clave", placeholder: "XXXXX-XXXXX-XXXXX", table: "asset" },
      { key: "fechaCompra", label: "Fecha de Compra", type: "date", table: "asset" },
      { key: "responsable", label: "Responsable", placeholder: "Nombre del responsable", table: "asset" },
      { key: "estado", label: "Estado", type: "select", required: true, table: "asset" },
      { key: "observacion", label: "Observación", type: "textarea", placeholder: "Notas adicionales...", table: "asset" },
    ],
    specsFields: [
      { key: "fechaVencimiento", label: "Fecha de Vencimiento", type: "date", table: "spec" },
    ],
  },

  Otros: {
    icon: Package,
    color: "from-gray-500 to-gray-600",
    assetFields: [
      { key: "tipo", label: "Tipo de Dispositivo", type: "select", options: ["AP", "Router", "Switch", "Antena", "UPS", "Teclado", "Mouse", "Impresora", "Otro"], required: true, table: "asset" },
      { key: "marca", label: "Marca", placeholder: "Ej: TP-Link, Logitech", table: "asset" },
      { key: "modelo", label: "Modelo", placeholder: "Ej: TL-WR940N", table: "asset" },
      { key: "sedeZona", label: "Sede / Zona", type: "select", required: true, table: "asset" },
      { key: "estado", label: "Estado", type: "select", required: true, table: "asset" },
      { key: "observacion", label: "Observación", type: "textarea", placeholder: "Notas adicionales...", table: "asset" },
    ],
    specsFields: [],
  },

  SIM: {
    icon: CreditCard,
    color: "from-indigo-500 to-indigo-600",
    assetFields: [
      { key: "numeroSerie", label: "Número Celular", placeholder: "Ej: 3001234567", required: true, table: "asset" },
      { key: "sedeZona", label: "De qué empresa", type: "select", required: true, table: "asset" },
      { key: "responsable", label: "Responsable", placeholder: "Nombre del responsable", table: "asset" },
      { key: "estado", label: "Estado", type: "select", required: true, table: "asset" },
      { key: "observacion", label: "Observación", type: "textarea", placeholder: "Notas adicionales...", table: "asset" },
    ],
    specsFields: [],
  },
};

export const CATEGORY_NAMES = Object.keys(CATEGORY_CONFIG);

export const ESTADOS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "baja", label: "Dado de baja" },
];

export const ESTADO_BADGE: Record<string, string> = {
  activo: "bg-green-500/20 text-green-400 border-green-500/30",
  inactivo: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  mantenimiento: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  baja: "bg-red-500/20 text-red-400 border-red-500/30",
};
