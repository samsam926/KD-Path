import { createContext, useContext, useState, ReactNode } from 'react';

export interface ClinicalVisit {
  visitDate: Date;
  visitNumber: number;
  EGFR: number; // mL/min/1.73m²
  BP_SYSTOLIC: number; // mmHg
  BP_DIASTOLIC: number; // mmHg
  HBA1C: number; // %
  HEMOGLOBIN: number; // g/dL
  ALKALINE_PHOSPHATASE: number; // U/L
  ALT_SGPT: number; // U/L
  AST_SGOT: number; // U/L
  CHOLESTEROL: number; // mg/dL
  LDL: number; // mg/dL
  HDL: number; // mg/dL
  TRIGLYCERIDES: number; // mg/dL
  INR: number; // no unit
  TBIL: number; // mg/dL
  WT: number; // kg
  CREATINE_KINASE: number; // U/L
  TROPONIN: number; // ng/L
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  race: string;
  ward: string;
  status?: 'CKD' | 'CKD uncertainty' | 'Fast Progression CKD' | 'FastCKD uncertainty' | 'Healthy' | 'Healthy uncertainty' | 'discharged';
  vitals?: {
    heartRate: number;
    bloodPressureSys: number;
    bloodPressureDia: number;
    temperature: number;
    oxygenSat: number;
    eGFR?: number; // estimated Glomerular Filtration Rate (mL/min/1.73m²)
    acr?: number; // Albumin-to-Creatinine Ratio (mg/g Cr)
    twoYearRisk?: number; // 2-year kidney failure risk percentage
    fiveYearRisk?: number; // 5-year kidney failure risk percentage
  };
  visits?: ClinicalVisit[];
  createdAt: Date;
  updatedAt: Date;
  dischargedAt?: Date;
}

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePatient: (id: string, updates: Partial<Omit<Patient, 'id' | 'createdAt'>>) => void;
  getPatient: (id: string) => Patient | undefined;
  deletePatient: (id: string) => void;
  addVisit: (patientId: string, visit: Omit<ClinicalVisit, 'visitNumber'>) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Initial mock data
const initialPatients: Patient[] = [
  {
    id: 'PT001',
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    race: 'Caucasian',
    ward: 'Cardiology',
    status: 'Healthy',
    vitals: {
      heartRate: 72,
      bloodPressureSys: 120,
      bloodPressureDia: 80,
      temperature: 98.2,
      oxygenSat: 98,
      eGFR: 85,
      acr: 15,
      twoYearRisk: 0.5,
      fiveYearRisk: 1.2
    },
    visits: [
      {
        visitDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        visitNumber: 1,
        EGFR: 88,
        BP_SYSTOLIC: 125,
        BP_DIASTOLIC: 82,
        HBA1C: 5.4,
        HEMOGLOBIN: 14.2,
        ALKALINE_PHOSPHATASE: 65,
        ALT_SGPT: 28,
        AST_SGOT: 32,
        CHOLESTEROL: 195,
        LDL: 110,
        HDL: 55,
        TRIGLYCERIDES: 125,
        INR: 1.0,
        TBIL: 0.8,
        WT: 78,
        CREATINE_KINASE: 145,
        TROPONIN: 5,
        notes: 'Initial baseline assessment'
      },
      {
        visitDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        visitNumber: 2,
        EGFR: 86,
        BP_SYSTOLIC: 122,
        BP_DIASTOLIC: 81,
        HBA1C: 5.5,
        HEMOGLOBIN: 14.0,
        ALKALINE_PHOSPHATASE: 68,
        ALT_SGPT: 26,
        AST_SGOT: 30,
        CHOLESTEROL: 188,
        LDL: 105,
        HDL: 58,
        TRIGLYCERIDES: 118,
        INR: 1.0,
        TBIL: 0.7,
        WT: 77.5,
        CREATINE_KINASE: 138,
        TROPONIN: 4,
        notes: 'Follow-up - showing slight improvement'
      },
      {
        visitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        visitNumber: 3,
        EGFR: 85,
        BP_SYSTOLIC: 120,
        BP_DIASTOLIC: 80,
        HBA1C: 5.3,
        HEMOGLOBIN: 14.3,
        ALKALINE_PHOSPHATASE: 66,
        ALT_SGPT: 25,
        AST_SGOT: 29,
        CHOLESTEROL: 180,
        LDL: 98,
        HDL: 60,
        TRIGLYCERIDES: 110,
        INR: 1.0,
        TBIL: 0.7,
        WT: 77,
        CREATINE_KINASE: 142,
        TROPONIN: 4,
        notes: 'Stable, continue current regimen'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date()
  },
  {
    id: 'PT002',
    name: 'Sarah Johnson',
    age: 62,
    gender: 'Female',
    race: 'African American',
    ward: 'ICU',
    status: 'CKD',
    vitals: {
      heartRate: 110,
      bloodPressureSys: 160,
      bloodPressureDia: 95,
      temperature: 101.5,
      oxygenSat: 88,
      eGFR: 42,
      acr: 185,
      twoYearRisk: 12.5,
      fiveYearRisk: 28.3
    },
    visits: [
      {
        visitDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        visitNumber: 1,
        EGFR: 58,
        BP_SYSTOLIC: 145,
        BP_DIASTOLIC: 88,
        HBA1C: 7.2,
        HEMOGLOBIN: 11.8,
        ALKALINE_PHOSPHATASE: 95,
        ALT_SGPT: 35,
        AST_SGOT: 42,
        CHOLESTEROL: 245,
        LDL: 155,
        HDL: 42,
        TRIGLYCERIDES: 185,
        INR: 1.2,
        TBIL: 1.2,
        WT: 72,
        CREATINE_KINASE: 180,
        TROPONIN: 12,
        notes: 'Initial CKD diagnosis'
      },
      {
        visitDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        visitNumber: 2,
        EGFR: 52,
        BP_SYSTOLIC: 152,
        BP_DIASTOLIC: 90,
        HBA1C: 7.5,
        HEMOGLOBIN: 11.2,
        ALKALINE_PHOSPHATASE: 102,
        ALT_SGPT: 38,
        AST_SGOT: 45,
        CHOLESTEROL: 252,
        LDL: 162,
        HDL: 40,
        TRIGLYCERIDES: 195,
        INR: 1.3,
        TBIL: 1.3,
        WT: 71.5,
        CREATINE_KINASE: 195,
        TROPONIN: 15,
        notes: 'Declining kidney function, medication adjusted'
      },
      {
        visitDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        visitNumber: 3,
        EGFR: 48,
        BP_SYSTOLIC: 158,
        BP_DIASTOLIC: 92,
        HBA1C: 7.8,
        HEMOGLOBIN: 10.8,
        ALKALINE_PHOSPHATASE: 108,
        ALT_SGPT: 42,
        AST_SGOT: 48,
        CHOLESTEROL: 258,
        LDL: 168,
        HDL: 38,
        TRIGLYCERIDES: 205,
        INR: 1.4,
        TBIL: 1.4,
        WT: 71,
        CREATINE_KINASE: 205,
        TROPONIN: 18,
        notes: 'Progressive decline, close monitoring required'
      },
      {
        visitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        visitNumber: 4,
        EGFR: 45,
        BP_SYSTOLIC: 162,
        BP_DIASTOLIC: 94,
        HBA1C: 8.0,
        HEMOGLOBIN: 10.5,
        ALKALINE_PHOSPHATASE: 115,
        ALT_SGPT: 45,
        AST_SGOT: 52,
        CHOLESTEROL: 262,
        LDL: 172,
        HDL: 36,
        TRIGLYCERIDES: 215,
        INR: 1.5,
        TBIL: 1.5,
        WT: 70.5,
        CREATINE_KINASE: 215,
        TROPONIN: 22,
        notes: 'Stage 3B CKD, nephrology referral'
      },
      {
        visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        visitNumber: 5,
        EGFR: 42,
        BP_SYSTOLIC: 160,
        BP_DIASTOLIC: 95,
        HBA1C: 8.2,
        HEMOGLOBIN: 10.2,
        ALKALINE_PHOSPHATASE: 118,
        ALT_SGPT: 48,
        AST_SGOT: 55,
        CHOLESTEROL: 268,
        LDL: 175,
        HDL: 35,
        TRIGLYCERIDES: 225,
        INR: 1.5,
        TBIL: 1.6,
        WT: 70,
        CREATINE_KINASE: 225,
        TROPONIN: 25,
        notes: 'Urgent care required, ICU admission'
      }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date()
  },
  {
    id: 'PT003',
    name: 'Michael Chen',
    age: 38,
    gender: 'Male',
    race: 'Asian',
    ward: 'General',
    status: 'Healthy uncertainty',
    vitals: {
      heartRate: 65,
      bloodPressureSys: 115,
      bloodPressureDia: 75,
      temperature: 97.8,
      oxygenSat: 99,
      eGFR: 95,
      acr: 22,
      twoYearRisk: 0.8,
      fiveYearRisk: 2.1
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date()
  },
  {
    id: 'PT004',
    name: 'Emily Davis',
    age: 28,
    gender: 'Female',
    race: 'Caucasian',
    ward: 'Maternity',
    status: 'discharged',
    vitals: {
      heartRate: 68,
      bloodPressureSys: 118,
      bloodPressureDia: 78,
      temperature: 98.4,
      oxygenSat: 99,
      eGFR: 105,
      acr: 12,
      twoYearRisk: 0.3,
      fiveYearRisk: 0.7
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updatedAt: new Date(),
    dischargedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // discharged yesterday
  },
  {
    id: 'PT005',
    name: 'Robert Williams',
    age: 71,
    gender: 'Male',
    race: 'Caucasian',
    ward: 'ICU',
    status: 'Fast Progression CKD',
    vitals: {
      heartRate: 125,
      bloodPressureSys: 170,
      bloodPressureDia: 100,
      temperature: 102.1,
      oxygenSat: 85,
      eGFR: 35,
      acr: 420,
      twoYearRisk: 35.7,
      fiveYearRisk: 68.4
    },
    createdAt: new Date(), // today
    updatedAt: new Date()
  },
  {
    id: 'PT006',
    name: 'Lisa Martinez',
    age: 55,
    gender: 'Female',
    race: 'Hispanic',
    ward: 'Orthopedics',
    status: 'discharged',
    vitals: {
      heartRate: 70,
      bloodPressureSys: 125,
      bloodPressureDia: 82,
      temperature: 98.1,
      oxygenSat: 97,
      eGFR: 72,
      acr: 45,
      twoYearRisk: 2.4,
      fiveYearRisk: 6.8
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(),
    dischargedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // discharged 2 days ago
  },
  {
    id: 'PT007',
    name: 'Jennifer Davis',
    age: 52,
    gender: 'Female',
    race: 'Caucasian',
    ward: 'Nephrology',
    status: 'CKD uncertainty',
    vitals: {
      heartRate: 82,
      bloodPressureSys: 142,
      bloodPressureDia: 88,
      temperature: 98.9,
      oxygenSat: 94,
      eGFR: 54,
      acr: 95,
      twoYearRisk: 4.8,
      fiveYearRisk: 12.3
    },
    visits: [
      {
        visitDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        visitNumber: 1,
        EGFR: 62,
        BP_SYSTOLIC: 138,
        BP_DIASTOLIC: 86,
        HBA1C: 6.8,
        HEMOGLOBIN: 12.5,
        ALKALINE_PHOSPHATASE: 78,
        ALT_SGPT: 32,
        AST_SGOT: 36,
        CHOLESTEROL: 218,
        LDL: 128,
        HDL: 48,
        TRIGLYCERIDES: 162,
        INR: 1.1,
        TBIL: 0.9,
        WT: 68,
        CREATINE_KINASE: 165,
        TROPONIN: 8,
        notes: 'Borderline kidney function, requires monitoring'
      },
      {
        visitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        visitNumber: 2,
        EGFR: 58,
        BP_SYSTOLIC: 140,
        BP_DIASTOLIC: 87,
        HBA1C: 7.0,
        HEMOGLOBIN: 12.2,
        ALKALINE_PHOSPHATASE: 82,
        ALT_SGPT: 34,
        AST_SGOT: 38,
        CHOLESTEROL: 222,
        LDL: 132,
        HDL: 46,
        TRIGLYCERIDES: 168,
        INR: 1.1,
        TBIL: 1.0,
        WT: 67.5,
        CREATINE_KINASE: 172,
        TROPONIN: 9,
        notes: 'Slight decline in eGFR, continue monitoring'
      },
      {
        visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        visitNumber: 3,
        EGFR: 54,
        BP_SYSTOLIC: 142,
        BP_DIASTOLIC: 88,
        HBA1C: 7.1,
        HEMOGLOBIN: 12.0,
        ALKALINE_PHOSPHATASE: 85,
        ALT_SGPT: 35,
        AST_SGOT: 40,
        CHOLESTEROL: 225,
        LDL: 135,
        HDL: 45,
        TRIGLYCERIDES: 172,
        INR: 1.2,
        TBIL: 1.0,
        WT: 67,
        CREATINE_KINASE: 178,
        TROPONIN: 10,
        notes: 'Uncertain CKD progression, increased monitoring frequency'
      }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: 'PT008',
    name: 'David Thompson',
    age: 67,
    gender: 'Male',
    race: 'African American',
    ward: 'Cardiology',
    status: 'FastCKD uncertainty',
    vitals: {
      heartRate: 95,
      bloodPressureSys: 155,
      bloodPressureDia: 92,
      temperature: 99.2,
      oxygenSat: 91,
      eGFR: 48,
      acr: 145,
      twoYearRisk: 8.6,
      fiveYearRisk: 19.2
    },
    visits: [
      {
        visitDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        visitNumber: 1,
        EGFR: 68,
        BP_SYSTOLIC: 148,
        BP_DIASTOLIC: 89,
        HBA1C: 7.5,
        HEMOGLOBIN: 11.8,
        ALKALINE_PHOSPHATASE: 88,
        ALT_SGPT: 38,
        AST_SGOT: 44,
        CHOLESTEROL: 238,
        LDL: 148,
        HDL: 42,
        TRIGLYCERIDES: 188,
        INR: 1.2,
        TBIL: 1.1,
        WT: 85,
        CREATINE_KINASE: 192,
        TROPONIN: 14,
        notes: 'Initial assessment'
      },
      {
        visitDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        visitNumber: 2,
        EGFR: 58,
        BP_SYSTOLIC: 152,
        BP_DIASTOLIC: 90,
        HBA1C: 7.8,
        HEMOGLOBIN: 11.4,
        ALKALINE_PHOSPHATASE: 94,
        ALT_SGPT: 42,
        AST_SGOT: 48,
        CHOLESTEROL: 245,
        LDL: 155,
        HDL: 40,
        TRIGLYCERIDES: 195,
        INR: 1.3,
        TBIL: 1.2,
        WT: 84.5,
        CREATINE_KINASE: 205,
        TROPONIN: 16,
        notes: 'Rapid decline in kidney function observed'
      },
      {
        visitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        visitNumber: 3,
        EGFR: 52,
        BP_SYSTOLIC: 153,
        BP_DIASTOLIC: 91,
        HBA1C: 8.0,
        HEMOGLOBIN: 11.0,
        ALKALINE_PHOSPHATASE: 98,
        ALT_SGPT: 45,
        AST_SGOT: 52,
        CHOLESTEROL: 252,
        LDL: 162,
        HDL: 38,
        TRIGLYCERIDES: 202,
        INR: 1.3,
        TBIL: 1.3,
        WT: 84,
        CREATINE_KINASE: 215,
        TROPONIN: 18,
        notes: 'Concerning rate of decline'
      },
      {
        visitDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        visitNumber: 4,
        EGFR: 48,
        BP_SYSTOLIC: 155,
        BP_DIASTOLIC: 92,
        HBA1C: 8.2,
        HEMOGLOBIN: 10.8,
        ALKALINE_PHOSPHATASE: 102,
        ALT_SGPT: 48,
        AST_SGOT: 55,
        CHOLESTEROL: 258,
        LDL: 168,
        HDL: 36,
        TRIGLYCERIDES: 210,
        INR: 1.4,
        TBIL: 1.4,
        WT: 83.5,
        CREATINE_KINASE: 225,
        TROPONIN: 20,
        notes: 'Uncertain fast CKD progression, intensive monitoring initiated'
      }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: 'PT009',
    name: 'Patricia Anderson',
    age: 58,
    gender: 'Female',
    race: 'Hispanic',
    ward: 'General',
    status: 'CKD uncertainty',
    vitals: {
      heartRate: 78,
      bloodPressureSys: 138,
      bloodPressureDia: 85,
      temperature: 98.5,
      oxygenSat: 95,
      eGFR: 56,
      acr: 88,
      twoYearRisk: 4.2,
      fiveYearRisk: 10.8
    },
    visits: [
      {
        visitDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        visitNumber: 1,
        EGFR: 64,
        BP_SYSTOLIC: 135,
        BP_DIASTOLIC: 83,
        HBA1C: 6.5,
        HEMOGLOBIN: 12.8,
        ALKALINE_PHOSPHATASE: 72,
        ALT_SGPT: 30,
        AST_SGOT: 34,
        CHOLESTEROL: 205,
        LDL: 122,
        HDL: 50,
        TRIGLYCERIDES: 152,
        INR: 1.0,
        TBIL: 0.9,
        WT: 72,
        CREATINE_KINASE: 158,
        TROPONIN: 7,
        notes: 'Routine checkup'
      },
      {
        visitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        visitNumber: 2,
        EGFR: 56,
        BP_SYSTOLIC: 138,
        BP_DIASTOLIC: 85,
        HBA1C: 6.8,
        HEMOGLOBIN: 12.5,
        ALKALINE_PHOSPHATASE: 76,
        ALT_SGPT: 32,
        AST_SGOT: 36,
        CHOLESTEROL: 212,
        LDL: 128,
        HDL: 48,
        TRIGLYCERIDES: 158,
        INR: 1.1,
        TBIL: 0.9,
        WT: 71.5,
        CREATINE_KINASE: 165,
        TROPONIN: 8,
        notes: 'Borderline kidney function detected, needs follow-up'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: 'PT010',
    name: 'Thomas Rodriguez',
    age: 49,
    gender: 'Male',
    race: 'Hispanic',
    ward: 'Emergency',
    status: 'CKD',
    vitals: {
      heartRate: 88,
      bloodPressureSys: 148,
      bloodPressureDia: 90,
      temperature: 99.8,
      oxygenSat: 93,
      eGFR: 51,
      acr: 125,
      twoYearRisk: 7.5,
      fiveYearRisk: 16.8
    },
    visits: [
      {
        visitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        visitNumber: 1,
        EGFR: 58,
        BP_SYSTOLIC: 142,
        BP_DIASTOLIC: 88,
        HBA1C: 7.2,
        HEMOGLOBIN: 12.0,
        ALKALINE_PHOSPHATASE: 88,
        ALT_SGPT: 36,
        AST_SGOT: 42,
        CHOLESTEROL: 228,
        LDL: 145,
        HDL: 44,
        TRIGLYCERIDES: 175,
        INR: 1.1,
        TBIL: 1.0,
        WT: 82,
        CREATINE_KINASE: 185,
        TROPONIN: 11,
        notes: 'Emergency admission - baseline assessment at 8:00 AM'
      },
      {
        visitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Same day - 15 days ago
        visitNumber: 2,
        EGFR: 56,
        BP_SYSTOLIC: 145,
        BP_DIASTOLIC: 89,
        HBA1C: 7.3,
        HEMOGLOBIN: 11.8,
        ALKALINE_PHOSPHATASE: 90,
        ALT_SGPT: 38,
        AST_SGOT: 44,
        CHOLESTEROL: 230,
        LDL: 147,
        HDL: 43,
        TRIGLYCERIDES: 178,
        INR: 1.2,
        TBIL: 1.1,
        WT: 81.8,
        CREATINE_KINASE: 192,
        TROPONIN: 13,
        notes: 'Follow-up test after medication at 2:00 PM - showing decline'
      },
      {
        visitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Same day - 15 days ago
        visitNumber: 3,
        EGFR: 54,
        BP_SYSTOLIC: 148,
        BP_DIASTOLIC: 90,
        HBA1C: 7.4,
        HEMOGLOBIN: 11.6,
        ALKALINE_PHOSPHATASE: 92,
        ALT_SGPT: 40,
        AST_SGOT: 46,
        CHOLESTEROL: 232,
        LDL: 149,
        HDL: 42,
        TRIGLYCERIDES: 180,
        INR: 1.2,
        TBIL: 1.2,
        WT: 81.6,
        CREATINE_KINASE: 198,
        TROPONIN: 15,
        notes: 'Evening check at 8:00 PM - continuing deterioration, urgent intervention needed'
      },
      {
        visitDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        visitNumber: 4,
        EGFR: 53,
        BP_SYSTOLIC: 146,
        BP_DIASTOLIC: 89,
        HBA1C: 7.3,
        HEMOGLOBIN: 11.7,
        ALKALINE_PHOSPHATASE: 91,
        ALT_SGPT: 39,
        AST_SGOT: 45,
        CHOLESTEROL: 230,
        LDL: 148,
        HDL: 43,
        TRIGLYCERIDES: 178,
        INR: 1.2,
        TBIL: 1.1,
        WT: 81.5,
        CREATINE_KINASE: 195,
        TROPONIN: 14,
        notes: 'Post-intervention assessment - slight stabilization'
      },
      {
        visitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        visitNumber: 5,
        EGFR: 51,
        BP_SYSTOLIC: 148,
        BP_DIASTOLIC: 90,
        HBA1C: 7.4,
        HEMOGLOBIN: 11.5,
        ALKALINE_PHOSPHATASE: 93,
        ALT_SGPT: 41,
        AST_SGOT: 47,
        CHOLESTEROL: 233,
        LDL: 150,
        HDL: 42,
        TRIGLYCERIDES: 182,
        INR: 1.3,
        TBIL: 1.2,
        WT: 81.2,
        CREATINE_KINASE: 202,
        TROPONIN: 16,
        notes: 'Current status - moderate CKD progression, close monitoring continues'
      }
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
];

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [nextId, setNextId] = useState(10);

  const addPatient = (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const newId = `PT${String(nextId).padStart(3, '0')}`;
    const newPatient: Patient = {
      ...patient,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPatients(prev => [...prev, newPatient]);
    setNextId(prev => prev + 1);
    return newId;
  };

  const updatePatient = (id: string, updates: Partial<Omit<Patient, 'id' | 'createdAt'>>) => {
    setPatients(prev => prev.map(patient => 
      patient.id === id 
        ? { ...patient, ...updates, updatedAt: new Date() }
        : patient
    ));
  };

  const getPatient = (id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  };

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(patient => patient.id !== id));
  };

  const addVisit = (patientId: string, visit: Omit<ClinicalVisit, 'visitNumber'>) => {
    setPatients(prev => prev.map(patient => 
      patient.id === patientId 
        ? { ...patient, visits: [...(patient.visits || []), { ...visit, visitNumber: (patient.visits?.length || 0) + 1 }] }
        : patient
    ));
  };

  return (
    <PatientContext.Provider value={{ patients, addPatient, updatePatient, getPatient, deletePatient, addVisit }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
}