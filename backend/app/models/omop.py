"""
SQLModel definitions for OMOP Common Data Model 5.4 Standard Schema
"""
from datetime import datetime, date
from typing import Optional

from sqlmodel import Field, SQLModel

from app.core.config import settings


OMOP_SCHEMA = settings.OMOP_CDM_SCHEMA


# Base models for OMOP Standard CDM

class ConceptBase(SQLModel):
    """Base concept lookup table"""
    concept_id: int = Field(primary_key=True)
    concept_name: str = Field(max_length=255)
    domain_id: str = Field(max_length=20)
    vocabulary_id: str = Field(max_length=20)
    concept_class_id: str = Field(max_length=20)
    standard_concept: Optional[str] = Field(default=None, max_length=1)
    concept_code: str = Field(max_length=50)
    valid_start_date: date
    valid_end_date: date
    invalid_reason: Optional[str] = Field(default=None, max_length=1)


class Concept(ConceptBase, table=True):
    """OMOP Concept table - maps concept IDs to descriptions"""
    __tablename__ = "concept"
    __table_args__ = {"schema": OMOP_SCHEMA}


class PersonBase(SQLModel):
    """Base person model"""
    gender_concept_id: int
    year_of_birth: int
    month_of_birth: Optional[int] = None
    day_of_birth: Optional[int] = None
    birth_datetime: Optional[datetime] = None
    race_concept_id: int
    ethnicity_concept_id: int
    location_id: Optional[int] = None
    provider_id: Optional[int] = None
    care_site_id: Optional[int] = None
    person_source_value: Optional[str] = Field(default=None, max_length=50)
    gender_source_value: Optional[str] = Field(default=None, max_length=50)
    gender_source_concept_id: Optional[int] = None
    race_source_value: Optional[str] = Field(default=None, max_length=50)
    race_source_concept_id: Optional[int] = None
    ethnicity_source_value: Optional[str] = Field(default=None, max_length=50)
    ethnicity_source_concept_id: Optional[int] = None


class Person(PersonBase, table=True):
    """OMOP Person table - core patient demographics"""
    __tablename__ = "person"
    __table_args__ = {"schema": OMOP_SCHEMA}
    person_id: int = Field(primary_key=True)


# Response models for API
class PersonPublic(PersonBase):
    person_id: int


class ConditionOccurrenceBase(SQLModel):
    """Base condition occurrence model"""
    person_id: int
    condition_concept_id: int
    condition_start_date: date
    condition_start_datetime: Optional[datetime] = None
    condition_end_date: Optional[date] = None
    condition_end_datetime: Optional[datetime] = None
    condition_type_concept_id: int
    condition_status_concept_id: Optional[int] = None
    stop_reason: Optional[str] = Field(default=None, max_length=20)
    provider_id: Optional[int] = None
    visit_occurrence_id: Optional[int] = None
    condition_source_value: Optional[str] = Field(default=None, max_length=50)
    condition_source_concept_id: Optional[int] = None
    condition_status_source_value: Optional[str] = Field(default=None, max_length=50)


class ConditionOccurrence(ConditionOccurrenceBase, table=True):
    """OMOP Condition Occurrence table"""
    __tablename__ = "condition_occurrence"
    __table_args__ = {"schema": OMOP_SCHEMA}
    condition_occurrence_id: int = Field(primary_key=True)


class ConditionOccurrencePublic(ConditionOccurrenceBase):
    condition_occurrence_id: int


class MeasurementBase(SQLModel):
    """Base measurement model"""
    person_id: int
    measurement_concept_id: int
    measurement_date: date
    measurement_datetime: Optional[datetime] = None
    measurement_time: Optional[str] = Field(default=None, max_length=10)
    measurement_type_concept_id: int
    operator_concept_id: Optional[int] = None
    value_as_number: Optional[float] = None
    value_as_concept_id: Optional[int] = None
    unit_concept_id: Optional[int] = None
    range_low: Optional[float] = None
    range_high: Optional[float] = None
    provider_id: Optional[int] = None
    visit_occurrence_id: Optional[int] = None
    measurement_source_value: Optional[str] = Field(default=None, max_length=50)
    measurement_source_concept_id: Optional[int] = None
    unit_source_value: Optional[str] = Field(default=None, max_length=50)
    unit_source_concept_id: Optional[int] = None
    value_source_value: Optional[str] = Field(default=None, max_length=50)


class Measurement(MeasurementBase, table=True):
    """OMOP Measurement table - lab values, vitals, etc."""
    __tablename__ = "measurement"
    __table_args__ = {"schema": OMOP_SCHEMA}
    measurement_id: int = Field(primary_key=True)


class MeasurementPublic(MeasurementBase):
    measurement_id: int


class ObservationBase(SQLModel):
    """Base observation model"""
    person_id: int
    observation_concept_id: int
    observation_date: date
    observation_datetime: Optional[datetime] = None
    observation_type_concept_id: int
    value_as_number: Optional[float] = None
    value_as_string: Optional[str] = Field(default=None, max_length=60)
    value_as_concept_id: Optional[int] = None
    qualifier_concept_id: Optional[int] = None
    unit_concept_id: Optional[int] = None
    provider_id: Optional[int] = None
    visit_occurrence_id: Optional[int] = None
    observation_source_value: Optional[str] = Field(default=None, max_length=50)
    observation_source_concept_id: Optional[int] = None
    unit_source_value: Optional[str] = Field(default=None, max_length=50)
    qualifier_source_value: Optional[str] = Field(default=None, max_length=50)
    value_source_value: Optional[str] = Field(default=None, max_length=50)


class Observation(ObservationBase, table=True):
    """OMOP Observation table"""
    __tablename__ = "observation"
    __table_args__ = {"schema": OMOP_SCHEMA}
    observation_id: int = Field(primary_key=True)


class ObservationPublic(ObservationBase):
    observation_id: int


class DrugExposureBase(SQLModel):
    """Base drug exposure model"""
    person_id: int
    drug_concept_id: int
    drug_exposure_start_date: date
    drug_exposure_start_datetime: Optional[datetime] = None
    drug_exposure_end_date: date
    drug_exposure_end_datetime: Optional[datetime] = None
    verbatim_end_date: Optional[date] = None
    drug_type_concept_id: int
    stop_reason: Optional[str] = Field(default=None, max_length=20)
    refills: Optional[int] = None
    quantity: Optional[float] = None
    days_supply: Optional[int] = None
    sig: Optional[str] = None
    route_concept_id: Optional[int] = None
    lot_number: Optional[str] = Field(default=None, max_length=50)
    provider_id: Optional[int] = None
    visit_occurrence_id: Optional[int] = None
    drug_source_value: Optional[str] = Field(default=None, max_length=50)
    drug_source_concept_id: Optional[int] = None
    route_source_value: Optional[str] = Field(default=None, max_length=50)
    dose_unit_source_value: Optional[str] = Field(default=None, max_length=50)


class DrugExposure(DrugExposureBase, table=True):
    """OMOP Drug Exposure table"""
    __tablename__ = "drug_exposure"
    __table_args__ = {"schema": OMOP_SCHEMA}
    drug_exposure_id: int = Field(primary_key=True)


class DrugExposurePublic(DrugExposureBase):
    drug_exposure_id: int


class VisitOccurrenceBase(SQLModel):
    """Base visit occurrence model"""
    person_id: int
    visit_concept_id: int
    visit_start_date: date
    visit_start_datetime: Optional[datetime] = None
    visit_end_date: date
    visit_end_datetime: Optional[datetime] = None
    visit_type_concept_id: int
    provider_id: Optional[int] = None
    care_site_id: Optional[int] = None
    visit_source_value: Optional[str] = Field(default=None, max_length=50)
    visit_source_concept_id: Optional[int] = None
    admitted_from_concept_id: Optional[int] = None
    admitted_from_source_value: Optional[str] = Field(default=None, max_length=50)
    discharged_to_concept_id: Optional[int] = None
    discharged_to_source_value: Optional[str] = Field(default=None, max_length=50)
    preceding_visit_occurrence_id: Optional[int] = None


class VisitOccurrence(VisitOccurrenceBase, table=True):
    """OMOP Visit Occurrence table"""
    __tablename__ = "visit_occurrence"
    __table_args__ = {"schema": OMOP_SCHEMA}
    visit_occurrence_id: int = Field(primary_key=True)


class VisitOccurrencePublic(VisitOccurrenceBase):
    visit_occurrence_id: int


class ProcedureOccurrenceBase(SQLModel):
    """Base procedure occurrence model"""
    person_id: int
    procedure_concept_id: int
    procedure_date: date
    procedure_datetime: Optional[datetime] = None
    procedure_end_date: Optional[date] = None
    procedure_end_datetime: Optional[datetime] = None
    procedure_type_concept_id: int
    modifier_concept_id: Optional[int] = None
    quantity: Optional[int] = None
    provider_id: Optional[int] = None
    visit_occurrence_id: Optional[int] = None
    procedure_source_value: Optional[str] = Field(default=None, max_length=50)
    procedure_source_concept_id: Optional[int] = None
    modifier_source_value: Optional[str] = Field(default=None, max_length=50)


class ProcedureOccurrence(ProcedureOccurrenceBase, table=True):
    """OMOP Procedure Occurrence table"""
    __tablename__ = "procedure_occurrence"
    __table_args__ = {"schema": OMOP_SCHEMA}
    procedure_occurrence_id: int = Field(primary_key=True)


class ProcedureOccurrencePublic(ProcedureOccurrenceBase):
    procedure_occurrence_id: int
