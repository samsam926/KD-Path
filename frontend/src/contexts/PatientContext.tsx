import { createContext, useContext, useState, ReactNode } from 'react'

export interface ClinicalVisit {
  visitDate: Date
  visitNumber: number
  EGFR: number // mL/min/1.73m²
  BP_SYSTOLIC: number // mmHg
  BP_DIASTOLIC: number // mmHg
  HBA1C: number // %
  HEMOGLOBIN: number // g/dL
  ALKALINE_PHOSPHATASE: number // U/L
  ALT_SGPT: number // U/L
  AST_SGOT: number // U/L
  CHOLESTEROL: number // mg/dL
  LDL: number // mg/dL
  HDL: number // mg/dL
  TRIGLYCERIDES: number // mg/dL
  INR: number // no unit
  TBIL: number // mg/dL
  WT: number // kg
  CREATINE_KINASE: number // U/L
  TROPONIN: number // ng/L
  notes?: string
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  race: string
  ward: string
  status?:
    | 'CKD'
    | 'CKD uncertainty'
    | 'Fast Progression CKD'
    | 'FastCKD uncertainty'
    | 'Healthy'
    | 'Healthy uncertainty'
    | 'discharged'
  vitals?: {
    heartRate: number
    bloodPressureSys: number
    bloodPressureDia: number
    temperature: number
    oxygenSat: number
    eGFR?: number // estimated Glomerular Filtration Rate (mL/min/1.73m²)
    acr?: number // Albumin-to-Creatinine Ratio (mg/g Cr)
    twoYearRisk?: number // 2-year kidney failure risk percentage
    fiveYearRisk?: number // 5-year kidney failure risk percentage
  }
  visits?: ClinicalVisit[]
  createdAt: Date
  updatedAt: Date
  dischargedAt?: Date
}

interface PatientContextType {
  patients: Patient[]
  addPatient: (
    patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
  ) => string
  updatePatient: (
    id: string,
    updates: Partial<Omit<Patient, 'id' | 'createdAt'>>
  ) => void
  getPatient: (id: string) => Patient | undefined
  deletePatient: (id: string) => void
  addVisit: (
    patientId: string,
    visit: Omit<ClinicalVisit, 'visitNumber'>
  ) => void
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

// Initial mock data
const initialPatients: Patient[] = [
  {
    id: '67493',
    name: '67493',
    age: 43,
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
    id: '67475',
    name: '67475',
    age: 65,
    gender: 'Female',
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
        notes:
          'Evening check at 8:00 PM - continuing deterioration, urgent intervention needed'
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
        notes:
          'Current status - moderate CKD progression, close monitoring continues'
      }
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
]

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [nextId, setNextId] = useState(10)

  const addPatient = (
    patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
  ): string => {
    const newId = `PT${String(nextId).padStart(3, '0')}`
    const newPatient: Patient = {
      ...patient,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setPatients((prev) => [...prev, newPatient])
    setNextId((prev) => prev + 1)
    return newId
  }

  const updatePatient = (
    id: string,
    updates: Partial<Omit<Patient, 'id' | 'createdAt'>>
  ) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === id
          ? { ...patient, ...updates, updatedAt: new Date() }
          : patient
      )
    )
  }

  const getPatient = (id: string): Patient | undefined => {
    return patients.find((patient) => patient.id === id)
  }

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((patient) => patient.id !== id))
  }

  const addVisit = (
    patientId: string,
    visit: Omit<ClinicalVisit, 'visitNumber'>
  ) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId
          ? {
              ...patient,
              visits: [
                ...(patient.visits || []),
                { ...visit, visitNumber: (patient.visits?.length || 0) + 1 }
              ]
            }
          : patient
      )
    )
  }

  return (
    <PatientContext.Provider
      value={{
        patients,
        addPatient,
        updatePatient,
        getPatient,
        deletePatient,
        addVisit
      }}
    >
      {children}
    </PatientContext.Provider>
  )
}

export function usePatients() {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider')
  }
  return context
}
