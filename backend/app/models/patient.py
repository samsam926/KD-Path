from datetime import datetime, date
from typing import Optional

from sqlalchemy import Column, Date, DateTime, Float, SmallInteger, String
from sqlmodel import Field, SQLModel

# Patient model


class PatientBase(SQLModel):
    patient_deiden_id: str = Field(max_length=255)
    date_of_birth: date | None = Field(default=None)
    sex: str | None = Field(default=None, max_length=10)
    race: str | None = Field(default=None, max_length=50)
    ethnicity: str | None = Field(default=None, max_length=50)


class PatientVisits(SQLModel):
    patient_deiden_id: str = Field(max_length=255)
    number_of_visits: int = Field(default=0)
    first_visit_date: datetime | None = Field(default=None)
    last_visit_date: datetime | None = Field(default=None)


class Patient(PatientBase):
    id: str | None = None


# Response models for API
class PatientPublic(PatientBase):
    id: str


class PatientsPublic(SQLModel):
    data: list[PatientPublic]
    count: int


# Detailed response models for full patient profile
class BPPublic(SQLModel):
    id: int
    patient_deiden_id: str | None
    encounter_deiden_id: str | None
    deid_bp_measurement_datetime: datetime | None
    systolic: int | None
    diastolic: int | None


class DemographicsPublic(SQLModel):
    patient_deiden_id: str
    deid_date_of_birth: date | None
    sex: str | None
    race: str | None
    ethnicity: str | None


class ADIPublic(SQLModel):
    patient_deiden_id: str
    encounter_deiden_id: str | None
    deid_contact_date: date | None
    adi_national_rank: str | None


class LabsPublic(SQLModel):
    patient_deiden_id: str
    encounter_deiden_id: str | None
    lab_name: str | None
    loinc_code: str | None
    deid_inferred_specimen_datetime: datetime | None
    lab_result: str | None
    lab_unit: str | None


class CKDDataPublic(SQLModel):
    patient_deiden_id: str
    encounter_deiden_id: str | None
    deid_diagnosis_start_date: date | None
    diagnosis_code: str | None
    diagnosis_description: str | None


class VisitInfo(SQLModel):
    """Visit information aggregated from patient encounters."""
    number_of_visits: int = 0
    number_of_encounters: int = 0
    first_visit_date: date | None = None
    last_visit_date: date | None = None
    tracking_period_days: int | None = None


class FullPatientProfile(SQLModel):
    """Complete patient profile with all related data."""
    patient: PatientPublic
    visit_info: VisitInfo = Field(default_factory=VisitInfo)
    demographics: DemographicsPublic | None = None
    bp_records: list[BPPublic] = []
    adi_records: list[ADIPublic] = []
    lab_records: list[LabsPublic] = []
    ckd_data_records: list[CKDDataPublic] = []

# Generated from the database design


class BP(SQLModel, table=True):
    __tablename__ = "bp_raw"
    __table_args__ = {"schema": "staging"}
    patient_deiden_id: str = Field(
        sa_column=Column("patient_deiden_id", String, primary_key=True)
    )
    encounter_deiden_id: str | None = Field(
        default=None,
        sa_column=Column("encounter_deiden_id", String, primary_key=True),
    )
    deid_bp_measurement_datetime: datetime | None = Field(
        default=None,
        sa_column=Column("Deid BP Measurement Datetime", DateTime, primary_key=True),
    )
    systolic: int | None = Field(default=None, sa_column=Column("Systolic", SmallInteger))
    diastolic: int | None = Field(default=None, sa_column=Column("Diastolic", SmallInteger))


class Demographics(SQLModel, table=True):
    __tablename__ = "demographics_raw"
    __table_args__ = {"schema": "staging"}
    patient_deiden_id: str = Field(
        sa_column=Column("patient_deiden_id", String, primary_key=True)
    )
    deid_date_of_birth: date | None = Field(
        default=None, sa_column=Column("Deid Date of Birth", Date)
    )
    sex: str | None = Field(default=None, sa_column=Column("Sex", String))
    race: str | None = Field(default=None, sa_column=Column("Race", String))
    ethnicity: str | None = Field(default=None, sa_column=Column("Ethnicity", String))


class ADI(SQLModel, table=True):
    __tablename__ = "adi_raw"
    __table_args__ = {"schema": "staging"}
    patient_deiden_id: str = Field(
        sa_column=Column("patient_deiden_id", String, primary_key=True)
    )
    encounter_deiden_id: str | None = Field(
        default=None,
        sa_column=Column("encounter_deiden_id", String, primary_key=True),
    )
    deid_contact_date: date | None = Field(default=None, sa_column=Column("Deid Contact Date", Date))
    adi_national_rank: str | None = Field(default=None, sa_column=Column("ADI (National Rank)", String))


class KidneyBiopsy(SQLModel, table=True):
    __tablename__ = "kidney_biopsy_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    patient_deiden_id: str | None = Field(default=None)
    encounter_deiden_id: str | None = Field(default=None)
    order_deiden_id: str | None = Field(default=None)
    deid_procedure_start_date: float | None = Field(default=None)
    cpt_code: int | None = Field(default=None)
    cpt_description: str | None = Field(default=None)


class HeightWeight(SQLModel, table=True):
    __tablename__ = "height_weight_raw"
    __table_args__ = {"schema": "staging"}
    patient_deiden_id: str = Field(
        sa_column=Column("patient_deiden_id", String, primary_key=True)
    )
    encounter_deiden_id: str | None = Field(
        default=None,
        sa_column=Column("encounter_deiden_id", String, primary_key=True),
    )
    deid_measurement_taken_datetime: datetime | None = Field(
        default=None,
        sa_column=Column(
            "Deid Measurement Taken Datetime", DateTime, primary_key=True
        ),
    )
    weight: float | None = Field(default=None, sa_column=Column("Weight (oz)", Float))
    height: float | None = Field(default=None, sa_column=Column("Height (in)", Float))


class Labs(SQLModel, table=True):
    __tablename__ = "labs_raw"
    __table_args__ = {"schema": "staging"}
    patient_deiden_id: str = Field(
        sa_column=Column("patient_deiden_id", String, primary_key=True)
    )
    encounter_deiden_id: str | None = Field(
        default=None,
        sa_column=Column("encounter_deiden_id", String, primary_key=True),
    )
    lab_name: str | None = Field(default=None, sa_column=Column("Lab Name", String))
    loinc_code: str | None = Field(default=None, sa_column=Column("LOINC Code", String))
    deid_inferred_specimen_datetime: datetime | None = Field(default=None, sa_column=Column("Deid Inferred Specimen Datetime", DateTime))
    lab_result: str | None = Field(default=None, sa_column=Column("Lab Result", String))
    lab_unit: str | None = Field(default=None, sa_column=Column("Lab Unit", String))


class PathReports(SQLModel, table=True):
    __tablename__ = "path_reports_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    patient_deiden_id: str | None = Field(default=None)
    encounter_deiden_id: str | None = Field(default=None)
    order_deiden_id: str | None = Field(default=None)
    proc_code: str | None = Field(default=None)
    proc_desc: str | None = Field(default=None)
    lab_name: str | None = Field(default=None)
    lab_id: float | None = Field(default=None)
    order_display_name: str | None = Field(default=None)
    line_num: int | None = Field(default=None)
    note_text: str | None = Field(default=None)


class CCI(SQLModel, table=True):
    __tablename__ = "cci_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    patient_deiden_id: str | None = Field(default=None)
    encounter_deiden_id: str | None = Field(default=None)
    deid_admit_date: date | None = Field(default=None)
    cci_original: int | None = Field(default=None)
    cci_adjusted: int | None = Field(default=None)


class MedAdmin(SQLModel, table=True):
    __tablename__ = "med_admin_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    patient_deiden_id: str | None = Field(default=None)
    encounter_deiden_id: str | None = Field(default=None)
    med_order_display_name: str | None = Field(default=None)
    discrete_dose: str | None = Field(default=None)
    dose_unit: str | None = Field(default=None)
    med_dispense_route: str | None = Field(default=None)
    med_frequency_description: str | None = Field(default=None)
    total_dose: str | None = Field(default=None)
    total_dose_numeric: str | None = Field(default=None)
    dose_unit_description: str | None = Field(default=None)
    infusion_rate: str | None = Field(default=None)
    infusion_rate_unit: str | None = Field(default=None)
    mar_status: str | None = Field(default=None)
    mar_action: str | None = Field(default=None)
    deid_med_taken_datetime: datetime | None = Field(default=None)
    mar_location: str | None = Field(default=None)
    therapy_class: str | None = Field(default=None)
    pharmacy_class: str | None = Field(default=None)
    pharmacy_subclass: str | None = Field(default=None)


class AllDiagnoses(SQLModel, table=True):
    __tablename__ = "all_diagnoses_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    patient_deiden_id: str | None = Field(default=None)
    deid_diagnosis_start_date: date | None = Field(default=None)
    diagnosis_code: str | None = Field(default=None)
    diagnosis_description: str | None = Field(default=None)


class PathReportOrdNar(SQLModel, table=True):
    __tablename__ = "path_report_ord_nar_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    order_deiden_id: str | None = Field(default=None)
    report: str | None = Field(default=None)


class MedOrders(SQLModel, table=True):
    __tablename__ = "med_orders_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    patient_deiden_id: str | None = Field(default=None)
    encounter_deiden_id: str | None = Field(default=None)
    deid_med_order_datetime: datetime | None = Field(default=None)
    med_order_display_name: str | None = Field(default=None)
    discrete_dose: str | None = Field(default=None)
    dose_unit: str | None = Field(default=None)
    med_dispense_route: str | None = Field(default=None)
    med_frequency_desc: str | None = Field(default=None)
    med_order_sig: str | None = Field(default=None)
    med_order_qty: str | None = Field(default=None)
    therapy_class: str | None = Field(default=None)
    pharmacy_class: str | None = Field(default=None)
    pharmacy_subclass: str | None = Field(default=None)


class USImageMetadata(SQLModel, table=True):
    __tablename__ = "us_image_metadata_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    patient_deiden_id: str | None = Field(default=None)
    encounter_deiden_id: str | None = Field(default=None)
    order_deiden_id: str | None = Field(default=None)
    accession_deiden_id: str | None = Field(default=None)
    deid_study_date: date | None = Field(default=None)
    study_description: str | None = Field(default=None)
    modalities: str | None = Field(default=None)
    deid_study_instance_uid: str | None = Field(default=None)
    image_count: int | None = Field(default=None)
    retrieved: int | None = Field(default=None)
    diff: int | None = Field(default=None)


class CKDData(SQLModel, table=True):
    __tablename__ = "ckd_data_raw"
    __table_args__ = {"schema": "staging"}
    patient_deiden_id: str = Field(
        sa_column=Column("patient_deiden_id", String, primary_key=True)
    )
    encounter_deiden_id: str | None = Field(
        default=None,
        sa_column=Column("encounter_deiden_id", String, primary_key=True),
    )
    deid_diagnosis_start_date: date | None = Field(default=None, sa_column=Column("Deid Diagnosis Start Date", Date))
    diagnosis_code: str | None = Field(default=None, sa_column=Column("Diagnosis Code", String))
    diagnosis_description: str | None = Field(default=None, sa_column=Column("Diagnosis Description", String))


class ClinicalNotes(SQLModel, table=True):
    __tablename__ = "clinical_notes_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    note_deiden_id: str | None = Field(default=None)
    report: str | None = Field(default=None)


class NoteMetadata(SQLModel, table=True):
    __tablename__ = "note_metadata_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    patient_deiden_id: str | None = Field(default=None)
    encounter_deiden_id: str | None = Field(default=None)
    note_deiden_id: str | None = Field(
        default=None, foreign_key="staging.clinical_notes_raw.note_deiden_id")
    contact_number: int | None = Field(default=None)
    deid_contact_date: datetime | None = Field(default=None)
    deid_created_datetime: datetime | None = Field(default=None)
    deid_service_datetime: datetime | None = Field(default=None)
    deid_encounter_date: datetime | None = Field(default=None)
    note_type: str | None = Field(default=None)
    inpatient_note_type: str | None = Field(default=None)


class APOL1(SQLModel, table=True):
    __tablename__ = "apol1_raw"
    __table_args__ = {"schema": "staging"}
    id: int = Field(primary_key=True)
    patient_deiden_id: str | None = Field(default=None)
    encounter_deiden_id: str | None = Field(default=None)
    lab_id: str | None = Field(default=None)
    lab_name: str | None = Field(default=None)
    lab_result: str | None = Field(default=None)
