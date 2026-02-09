"""
CRUD operations for OMOP Standard CDM data
"""
from typing import Any, List, Optional
from datetime import date
from sqlmodel import Session, select, func

from app.models.omop import (
    Person,
    ConditionOccurrence,
    Measurement,
    Observation,
    DrugExposure,
    VisitOccurrence,
    ProcedureOccurrence,
    Concept,
)


class PersonCRUD:
    """CRUD operations for Person table"""
    
    @staticmethod
    def get_person(session: Session, person_id: int) -> Optional[Person]:
        """Get a person by ID"""
        statement = select(Person).where(Person.person_id == person_id)
        return session.exec(statement).first()
    
    @staticmethod
    def get_persons(
        session: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None
    ) -> List[Person]:
        """Get paginated list of persons with optional search"""
        statement = select(Person)
        
        if search:
            # Search by person_id, person_source_value, or source values
            search_filter = (
                Person.person_source_value.ilike(f"%{search}%")
                | Person.gender_source_value.ilike(f"%{search}%")
                | Person.race_source_value.ilike(f"%{search}%")
                | Person.ethnicity_source_value.ilike(f"%{search}%")
            )
            # Try to search by person_id if search is numeric
            try:
                person_id = int(search)
                search_filter = search_filter | (Person.person_id == person_id)
            except ValueError:
                pass
            
            statement = statement.where(search_filter)
        
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()
    
    @staticmethod
    def count_persons(session: Session, search: Optional[str] = None) -> int:
        """Count total number of persons with optional search filter"""
        statement = select(func.count()).select_from(Person)
        
        if search:
            search_filter = (
                Person.person_source_value.ilike(f"%{search}%")
                | Person.gender_source_value.ilike(f"%{search}%")
                | Person.race_source_value.ilike(f"%{search}%")
                | Person.ethnicity_source_value.ilike(f"%{search}%")
            )
            try:
                person_id = int(search)
                search_filter = search_filter | (Person.person_id == person_id)
            except ValueError:
                pass
            
            statement = statement.where(search_filter)
        
        return session.exec(statement).one()


class ConditionOccurrenceCRUD:
    """CRUD operations for Condition Occurrence table"""
    
    @staticmethod
    def get_condition(session: Session, condition_id: int) -> Optional[ConditionOccurrence]:
        """Get a condition occurrence by ID"""
        statement = select(ConditionOccurrence).where(
            ConditionOccurrence.condition_occurrence_id == condition_id
        )
        return session.exec(statement).first()
    
    @staticmethod
    def get_conditions_for_person(
        session: Session, person_id: int, skip: int = 0, limit: int = 100
    ) -> List[ConditionOccurrence]:
        """Get all conditions for a specific person"""
        statement = (
            select(ConditionOccurrence)
            .where(ConditionOccurrence.person_id == person_id)
            .offset(skip)
            .limit(limit)
        )
        return session.exec(statement).all()
    
    @staticmethod
    def count_conditions_for_person(session: Session, person_id: int) -> int:
        """Count conditions for a person"""
        statement = (
            select(func.count())
            .select_from(ConditionOccurrence)
            .where(ConditionOccurrence.person_id == person_id)
        )
        return session.exec(statement).one()
    
    @staticmethod
    def get_conditions_by_concept(
        session: Session, concept_id: int, skip: int = 0, limit: int = 100
    ) -> List[ConditionOccurrence]:
        """Get all condition occurrences for a specific concept"""
        statement = (
            select(ConditionOccurrence)
            .where(ConditionOccurrence.condition_concept_id == concept_id)
            .offset(skip)
            .limit(limit)
        )
        return session.exec(statement).all()


class MeasurementCRUD:
    """CRUD operations for Measurement table"""
    
    @staticmethod
    def get_measurement(session: Session, measurement_id: int) -> Optional[Measurement]:
        """Get a measurement by ID"""
        statement = select(Measurement).where(Measurement.measurement_id == measurement_id)
        return session.exec(statement).first()
    
    @staticmethod
    def get_measurements_for_person(
        session: Session, person_id: int, skip: int = 0, limit: int = 100
    ) -> List[Measurement]:
        """Get all measurements for a specific person"""
        statement = (
            select(Measurement)
            .where(Measurement.person_id == person_id)
            .order_by(Measurement.measurement_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return session.exec(statement).all()
    
    @staticmethod
    def count_measurements_for_person(session: Session, person_id: int) -> int:
        """Count measurements for a person"""
        statement = (
            select(func.count())
            .select_from(Measurement)
            .where(Measurement.person_id == person_id)
        )
        return session.exec(statement).one()
    
    @staticmethod
    def get_measurements_by_concept(
        session: Session,
        concept_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Measurement]:
        """Get measurements for a specific concept with optional date range"""
        statement = select(Measurement).where(
            Measurement.measurement_concept_id == concept_id
        )
        
        if start_date:
            statement = statement.where(Measurement.measurement_date >= start_date)
        if end_date:
            statement = statement.where(Measurement.measurement_date <= end_date)
        
        statement = statement.order_by(Measurement.measurement_date.desc()).offset(skip).limit(limit)
        return session.exec(statement).all()
    
    @staticmethod
    def get_latest_measurement_for_person(
        session: Session, person_id: int, concept_id: int
    ) -> Optional[Measurement]:
        """Get the most recent measurement of a specific type for a person"""
        statement = (
            select(Measurement)
            .where(
                (Measurement.person_id == person_id)
                & (Measurement.measurement_concept_id == concept_id)
            )
            .order_by(Measurement.measurement_date.desc())
            .limit(1)
        )
        return session.exec(statement).first()


class ObservationCRUD:
    """CRUD operations for Observation table"""
    
    @staticmethod
    def get_observation(session: Session, observation_id: int) -> Optional[Observation]:
        """Get an observation by ID"""
        statement = select(Observation).where(Observation.observation_id == observation_id)
        return session.exec(statement).first()
    
    @staticmethod
    def get_observations_for_person(
        session: Session, person_id: int, skip: int = 0, limit: int = 100
    ) -> List[Observation]:
        """Get all observations for a specific person"""
        statement = (
            select(Observation)
            .where(Observation.person_id == person_id)
            .order_by(Observation.observation_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return session.exec(statement).all()


class DrugExposureCRUD:
    """CRUD operations for Drug Exposure table"""
    
    @staticmethod
    def get_drug_exposure(session: Session, drug_exposure_id: int) -> Optional[DrugExposure]:
        """Get a drug exposure by ID"""
        statement = select(DrugExposure).where(
            DrugExposure.drug_exposure_id == drug_exposure_id
        )
        return session.exec(statement).first()
    
    @staticmethod
    def get_drug_exposures_for_person(
        session: Session, person_id: int, skip: int = 0, limit: int = 100
    ) -> List[DrugExposure]:
        """Get all drug exposures for a specific person"""
        statement = (
            select(DrugExposure)
            .where(DrugExposure.person_id == person_id)
            .order_by(DrugExposure.drug_exposure_start_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return session.exec(statement).all()
    
    @staticmethod
    def count_drug_exposures_for_person(session: Session, person_id: int) -> int:
        """Count drug exposures for a person"""
        statement = (
            select(func.count())
            .select_from(DrugExposure)
            .where(DrugExposure.person_id == person_id)
        )
        return session.exec(statement).one()
    
    @staticmethod
    def get_active_medications(
        session: Session, person_id: int, as_of_date: Optional[date] = None
    ) -> List[DrugExposure]:
        """Get currently active medications for a person"""
        if as_of_date is None:
            as_of_date = date.today()
        
        statement = select(DrugExposure).where(
            (DrugExposure.person_id == person_id)
            & (DrugExposure.drug_exposure_start_date <= as_of_date)
            & (DrugExposure.drug_exposure_end_date >= as_of_date)
        )
        return session.exec(statement).all()


class VisitOccurrenceCRUD:
    """CRUD operations for Visit Occurrence table"""
    
    @staticmethod
    def get_visit(session: Session, visit_id: int) -> Optional[VisitOccurrence]:
        """Get a visit by ID"""
        statement = select(VisitOccurrence).where(VisitOccurrence.visit_occurrence_id == visit_id)
        return session.exec(statement).first()
    
    @staticmethod
    def get_visits_for_person(
        session: Session, person_id: int, skip: int = 0, limit: int = 100
    ) -> List[VisitOccurrence]:
        """Get all visits for a specific person"""
        statement = (
            select(VisitOccurrence)
            .where(VisitOccurrence.person_id == person_id)
            .order_by(VisitOccurrence.visit_start_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return session.exec(statement).all()
    
    @staticmethod
    def count_visits_for_person(session: Session, person_id: int) -> int:
        """Count visits for a person"""
        statement = (
            select(func.count())
            .select_from(VisitOccurrence)
            .where(VisitOccurrence.person_id == person_id)
        )
        return session.exec(statement).one()


class ProcedureOccurrenceCRUD:
    """CRUD operations for Procedure Occurrence table"""
    
    @staticmethod
    def get_procedure(
        session: Session, procedure_id: int
    ) -> Optional[ProcedureOccurrence]:
        """Get a procedure by ID"""
        statement = select(ProcedureOccurrence).where(
            ProcedureOccurrence.procedure_occurrence_id == procedure_id
        )
        return session.exec(statement).first()
    
    @staticmethod
    def get_procedures_for_person(
        session: Session, person_id: int, skip: int = 0, limit: int = 100
    ) -> List[ProcedureOccurrence]:
        """Get all procedures for a specific person"""
        statement = (
            select(ProcedureOccurrence)
            .where(ProcedureOccurrence.person_id == person_id)
            .order_by(ProcedureOccurrence.procedure_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return session.exec(statement).all()


class ConceptCRUD:
    """CRUD operations for Concept lookup table"""
    
    @staticmethod
    def get_concept(session: Session, concept_id: int) -> Optional[Concept]:
        """Get a concept by ID"""
        statement = select(Concept).where(Concept.concept_id == concept_id)
        return session.exec(statement).first()
    
    @staticmethod
    def search_concepts(
        session: Session, search_term: str, skip: int = 0, limit: int = 100
    ) -> List[Concept]:
        """Search for concepts by name"""
        statement = (
            select(Concept)
            .where(Concept.concept_name.ilike(f"%{search_term}%"))
            .offset(skip)
            .limit(limit)
        )
        return session.exec(statement).all()
    
    @staticmethod
    def get_concepts_by_domain(
        session: Session, domain_id: str, skip: int = 0, limit: int = 100
    ) -> List[Concept]:
        """Get concepts for a specific domain"""
        statement = (
            select(Concept)
            .where(Concept.domain_id == domain_id)
            .offset(skip)
            .limit(limit)
        )
        return session.exec(statement).all()
